import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
import { ItemCarrinho } from '../../../core/models/item-carrinho';
import { PedidosService } from '../../../core/services/pedidos.service';

type PedidoFinalizado = {
  codigo: string;
  cliente: string;
  quantidadeItens: number;
  total: number;
  itens: ItemCarrinho[];
};

function nomeSemNumeros(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;

  if (!valor) return null;

  if (/\d/.test(valor)) {
    return { numeroInvalido: true };
  }
  return null;
}

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  carrinhoFacade = inject(CarrinhoFacade);
  private pedidosService = inject(PedidosService);

  //compraFinalizada = signal(false);
  pedidoFinalizado = signal<PedidoFinalizado | null>(null);
  erroPedido = signal<string | null>(null);

  formulario = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(3), nomeSemNumeros]),
    email: new FormControl('', [Validators.required, Validators.email]),
    endereco: new FormControl('', [Validators.required, Validators.minLength(5)]),
  });

  finalizar() {
    this.pedidoFinalizado.set(null);

    if (this.carrinhoFacade.carrinhoVazio()) {
      console.log('Não é possível finalizar uma compra com o carrinho vazio.');
      return;
    }

    if (this.formulario.invalid) {
      console.log('Formulário inválido');
      this.formulario.markAllAsTouched();
      return;
    }

    const dados = this.formulario.getRawValue();
    const itens = this.carrinhoFacade.itens();

    this.erroPedido.set(null);

    // O pedido vai para a API, que grava no MongoDB (exige login).
    this.pedidosService
      .criar({
        cliente: { nome: dados.nome ?? '', email: dados.email ?? '', endereco: dados.endereco ?? '' },
        itens,
      })
      .subscribe({
        next: (pedido) => {
          this.carrinhoFacade.limparCarrinho();
          this.formulario.reset();
          this.pedidoFinalizado.set({
            codigo: pedido._id,
            cliente: pedido.cliente,
            quantidadeItens: pedido.itens.length,
            total: pedido.total,
            itens: pedido.itens,
          });
        },
        error: (erro) => {
          const lista = erro.error?.erros as { mensagem: string }[] | undefined;
          this.erroPedido.set(
            lista?.map((item) => item.mensagem).join('; ') ??
              erro.error?.message ??
              'Não foi possível finalizar o pedido.',
          );
        },
      });
  }
}
