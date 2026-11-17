import type { Request } from 'express';
import { z } from 'zod';
import type { Perfil } from '../usuarios/usuario.schema.js';

export const registrarSchema = z.object({
  email: z.email('e-mail invalido'),
  senha: z
    .string('senha e obrigatoria')
    .min(6, 'a senha precisa ter ao menos 6 caracteres')
    .max(72, 'a senha pode ter no maximo 72 caracteres'),
});

export const loginSchema = z.object({
  email: z.email('e-mail invalido'),
  senha: z.string('senha e obrigatoria').min(1, 'senha e obrigatoria'),
});

export type DadosRegistro = z.infer<typeof registrarSchema>;
export type DadosLogin = z.infer<typeof loginSchema>;

// O que vai dentro do token JWT.
export type PayloadJwt = {
  sub: string;
  email: string;
  perfil: Perfil;
};

// Requisicao depois que o guard validou o token.
export type RequisicaoAutenticada = Request & { usuario: PayloadJwt };
