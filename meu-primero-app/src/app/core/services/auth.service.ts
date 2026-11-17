import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal, inject, PLATFORM_ID } from '@angular/core';
import { map, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

type PerfilUsuario = 'usuario' | 'admin';

type Usuario = {
  email: string;
  perfil: PerfilUsuario;
};

// Resposta do POST /auth/login da API.
type RespostaLogin = {
  token: string;
  usuario: Usuario;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  private readonly API = `${environment.apiUrl}/auth`;
  private readonly chaveUsuario = 'minha-loja-usuario';
  private readonly chaveToken = 'minha-loja-token';

  private usuario = signal<Usuario | null>(this.carregarUsuarioSalvo());
  private tokenJwt = signal<string | null>(this.carregarTokenSalvo());

  usuarioAtual = computed(() => this.usuario());
  estaLogado = computed(() => this.usuario() !== null && this.tokenJwt() !== null);
  ehAdmin = computed(() => this.usuario()?.perfil === 'admin');
  token = computed(() => this.tokenJwt());

  // Login real: a API confere a senha (BCrypt) e devolve um token JWT.
  login(email: string, senha: string) {
    return this.http.post<RespostaLogin>(`${this.API}/login`, { email, senha }).pipe(
      tap((resposta) => {
        this.usuario.set(resposta.usuario);
        this.tokenJwt.set(resposta.token);
        this.salvarAutenticacao(resposta.usuario, resposta.token);
      }),
      map((resposta) => resposta.usuario),
    );
  }

  // Cria uma conta de usuário comum na API.
  registrar(email: string, senha: string) {
    return this.http.post<Usuario>(`${this.API}/registrar`, { email, senha });
  }

  logout() {
    this.usuario.set(null);
    this.tokenJwt.set(null);
    this.limparAutenticacaoSalva();
  }

  obterToken(): string | null {
    return this.tokenJwt();
  }

  obterPerfil(): PerfilUsuario | null {
    return this.usuario()?.perfil ?? null;
  }

  private estaNoNavegador(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private carregarUsuarioSalvo(): Usuario | null {
    if (!this.estaNoNavegador()) {
      return null;
    }
    const dadosSalvos = localStorage.getItem(this.chaveUsuario);

    if (!dadosSalvos) {
      return null;
    }

    try {
      return JSON.parse(dadosSalvos) as Usuario;
    } catch {
      return null;
    }
  }

  private carregarTokenSalvo(): string | null {
    if (!this.estaNoNavegador()) {
      return null;
    }
    return localStorage.getItem(this.chaveToken);
  }

  private salvarAutenticacao(usuario: Usuario, token: string) {
    if (!this.estaNoNavegador()) {
      return;
    }
    localStorage.setItem(this.chaveUsuario, JSON.stringify(usuario));
    localStorage.setItem(this.chaveToken, token);
  }

  private limparAutenticacaoSalva() {
    if (!this.estaNoNavegador()) {
      return;
    }
    localStorage.removeItem(this.chaveUsuario);
    localStorage.removeItem(this.chaveToken);
  }
}
