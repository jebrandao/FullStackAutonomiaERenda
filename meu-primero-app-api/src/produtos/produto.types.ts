import { z } from 'zod';

export const criarProdutoSchema = z.object({
  nome: z
    .string('nome e obrigatorio')
    .trim()
    .min(2, 'nome precisa ter ao menos 2 letras')
    .max(80, 'nome pode ter no maximo 80 letras'),
  preco: z
    .number('preco deve ser um numero')
    .min(0, 'preco nao pode ser negativo'),
  descricao: z.string().max(300, 'descricao muito longa').optional(),
  estoque: z
    .number('estoque deve ser um numero')
    .int('estoque deve ser inteiro')
    .min(0, 'estoque nao pode ser negativo')
    .optional(),
});

export const atualizarProdutoSchema = criarProdutoSchema.partial();

export const filtrosProdutoSchema = z.object({
  nome: z.string().optional(),
  precoMax: z.coerce
    .number('precoMax deve ser um numero')
    .min(0, 'precoMax nao pode ser negativo')
    .optional(),
});

export type DadosProduto = z.infer<typeof criarProdutoSchema>;
export type DadosAtualizacao = z.infer<typeof atualizarProdutoSchema>;
export type FiltrosProduto = z.infer<typeof filtrosProdutoSchema>;
