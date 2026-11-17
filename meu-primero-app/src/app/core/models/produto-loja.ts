// Modelo do produto como a API (NestJS + MongoDB) devolve.
// O _id e gerado pelo MongoDB.
export type ProdutoLoja = {
  _id: string;
  nome: string;
  preco: number;
  descricao: string;
  estoque: number;
};

// Dados enviados para criar ou atualizar um produto (sem o _id).
export type DadosProduto = {
  nome: string;
  preco: number;
  descricao?: string;
  estoque?: number;
};
