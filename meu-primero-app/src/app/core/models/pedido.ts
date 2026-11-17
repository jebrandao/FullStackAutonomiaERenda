import { ItemCarrinho } from './item-carrinho';

// Dados do cliente enviados no checkout.
export type ClientePedido = {
  nome: string;
  email: string;
  endereco: string;
};

// Corpo do POST /pedidos. O preço é recalculado pela API.
export type NovoPedido = {
  cliente: ClientePedido;
  itens: ItemCarrinho[];
};

// Pedido como a API devolve.
export type Pedido = {
  _id: string;
  cliente: string;
  total: number;
  status: 'pendente' | 'pago' | 'cancelado';
  itens: ItemCarrinho[];
};
