import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { Pedido } from '../../../core/models/pedido';
import { ProdutoLoja } from '../../../core/models/produto-loja';
import { PedidosService } from '../../../core/services/pedidos.service';
import { ProdutosService } from '../../../core/services/produtos.service';

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  // A área administrativa passa a ler dados do usuário autenticado
  private authFacade = inject(AuthFacade);

  // Router usado para voltar para a área pública após logout
  private router = inject(Router);

  // Service que conversa com a API (NestJS + MongoDB)
  private produtosService = inject(ProdutosService);
  private pedidosService = inject(PedidosService);

  // Produtos que vieram do banco de dados.
  produtos = signal<ProdutoLoja[]>([]);
  totalProdutosCadastrados = computed(() => this.produtos().length);

  // Pedidos gravados no banco (a API só entrega a lista para admin).
  pedidos = signal<Pedido[]>([]);
  pedidosPendentes = computed(() => this.pedidos().filter((p) => p.status === 'pendente').length);

  // Indicador ainda simulado.
  usuariosCadastrados = signal(8);

  // Controle da tela: produto em edição, mensagem de sucesso e de erro.
  editandoId = signal<string | null>(null);
  mensagem = signal<string | null>(null);
  erro = signal<string | null>(null);

  // Computed signal derivado do usuário atual.
  usuarioAtual = this.authFacade.usuarioAtual;

  // Texto calculado para reforçar o perfil atualmente autenticado
  mensagemPerfil = computed(() => {
    const usuario = this.usuarioAtual();

    if (!usuario) {
      return 'Nenhum usuário autenticado.';
    }

    return `Usuário autenticado como ${usuario.perfil}.`;
  });

  formulario = new FormGroup({
    nome: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    preco: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    descricao: new FormControl('', { nonNullable: true }),
    estoque: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  constructor() {
    this.carregarProdutos();
    this.carregarPedidos();
  }

  carregarPedidos() {
    this.pedidosService.listarTodos().subscribe({
      next: (dados) => this.pedidos.set(dados),
      error: (e) => this.erro.set(this.textoDoErro(e)),
    });
  }

  carregarProdutos() {
    this.produtosService.buscarProdutos().subscribe({
      next: (dados) => this.produtos.set(dados),
      error: (e) => this.erro.set(this.textoDoErro(e)),
    });
  }

  salvar() {
    this.mensagem.set(null);
    this.erro.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const dados = this.formulario.getRawValue();
    const id = this.editandoId();

    // Se existe id, atualiza (PUT). Se não, cria (POST).
    const chamada = id
      ? this.produtosService.atualizar(id, dados)
      : this.produtosService.criar(dados);

    chamada.subscribe({
      next: () => {
        this.mensagem.set(id ? 'Produto atualizado.' : 'Produto cadastrado.');
        this.cancelarEdicao();
        this.carregarProdutos();
      },
      error: (e) => this.erro.set(this.textoDoErro(e)),
    });
  }

  editar(produto: ProdutoLoja) {
    this.editandoId.set(produto._id);
    this.formulario.setValue({
      nome: produto.nome,
      preco: produto.preco,
      descricao: produto.descricao,
      estoque: produto.estoque,
    });
  }

  cancelarEdicao() {
    this.editandoId.set(null);
    this.formulario.reset({ nome: '', preco: 0, descricao: '', estoque: 0 });
  }

  excluir(produto: ProdutoLoja) {
    if (!confirm(`Excluir o produto "${produto.nome}"?`)) {
      return;
    }

    this.mensagem.set(null);
    this.erro.set(null);

    this.produtosService.remover(produto._id).subscribe({
      next: () => {
        this.mensagem.set('Produto excluído.');
        this.carregarProdutos();
      },
      error: (e) => this.erro.set(this.textoDoErro(e)),
    });
  }

  sair() {
    // Logout também pode ser feito a partir da área administrativa
    this.authFacade.sair();
    this.router.navigateByUrl('/login');
  }

  // Transforma o erro HTTP em texto: a API devolve a lista "erros" (Zod).
  private textoDoErro(e: {
    error?: { erros?: { mensagem: string }[]; message?: string };
  }): string {
    const lista = e.error?.erros;
    if (lista?.length) {
      return lista.map((item) => item.mensagem).join('; ');
    }
    return e.error?.message ?? 'Não foi possível falar com a API.';
  }
}
