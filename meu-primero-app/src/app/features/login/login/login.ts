import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthFacade } from '../../../core/facades/auth.facade';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authFacade = inject(AuthFacade);
  private router = inject(Router);

  // Mensagem de erro vinda da API (ou null quando está tudo certo).
  erroLogin = signal<string | null>(null);

  formulario = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    senha: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  entrar() {
    this.erroLogin.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const email = this.formulario.value.email ?? '';
    const senha = this.formulario.value.senha ?? '';

    this.authFacade.realizarLogin(email, senha).subscribe({
      next: (usuario) => {
        // Admin vai para a área administrativa; os demais para os produtos.
        this.router.navigateByUrl(usuario.perfil === 'admin' ? '/admin' : '/produtos');
      },
      error: (erro) => {
        this.erroLogin.set(erro.error?.message ?? 'Não foi possível falar com a API.');
      },
    });
  }

  criarConta() {
    this.erroLogin.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const email = this.formulario.value.email ?? '';
    const senha = this.formulario.value.senha ?? '';

    // Cria a conta e já faz o login em seguida.
    this.authFacade.criarConta(email, senha).subscribe({
      next: () => this.entrar(),
      error: (erro) => {
        const lista = erro.error?.erros as { mensagem: string }[] | undefined;
        this.erroLogin.set(
          lista?.map((item) => item.mensagem).join('; ') ??
            erro.error?.message ??
            'Não foi possível criar a conta.',
        );
      },
    });
  }
}
