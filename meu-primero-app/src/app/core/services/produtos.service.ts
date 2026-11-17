import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { DadosProduto, ProdutoLoja } from '../models/produto-loja';

@Injectable({ providedIn: 'root' })
export class ProdutosService {
  private http = inject(HttpClient);

  // A URL base da API vem do arquivo de ambiente.
  private readonly API = `${environment.apiUrl}/produtos`;

  buscarProdutos() {
    return this.http.get<ProdutoLoja[]>(this.API);
  }

  criar(dados: DadosProduto) {
    return this.http.post<ProdutoLoja>(this.API, dados);
  }

  atualizar(id: string, dados: DadosProduto) {
    return this.http.put<ProdutoLoja>(`${this.API}/${id}`, dados);
  }

  remover(id: string) {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
