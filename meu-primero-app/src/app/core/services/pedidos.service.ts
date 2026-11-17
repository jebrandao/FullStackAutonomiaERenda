import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { NovoPedido, Pedido } from '../models/pedido';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private http = inject(HttpClient);

  private readonly API = `${environment.apiUrl}/pedidos`;

  criar(pedido: NovoPedido) {
    return this.http.post<Pedido>(this.API, pedido);
  }

  // Somente o admin consegue listar todos os pedidos.
  listarTodos() {
    return this.http.get<Pedido[]>(this.API);
  }
}
