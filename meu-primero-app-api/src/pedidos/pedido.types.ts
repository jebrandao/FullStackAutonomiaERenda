import { z } from 'zod';

export const criarPedidoSchema = z.object({
  cliente: z.object({
    nome: z.string('nome e obrigatorio').min(3, 'nome muito curto'),
    email: z.email('e-mail invalido'),
    endereco: z.string('endereco e obrigatorio').min(5, 'endereco muito curto'),
  }),
  // O preco enviado pelo front e ignorado: o servidor busca no banco.
  itens: z
    .array(z.object({ nome: z.string().min(1) }))
    .min(1, 'o pedido precisa ter ao menos um item'),
});

export type DadosPedido = z.infer<typeof criarPedidoSchema>;
