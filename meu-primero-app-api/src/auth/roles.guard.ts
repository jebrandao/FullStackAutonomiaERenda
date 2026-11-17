import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Perfil } from '../usuarios/usuario.schema.js';
import type { RequisicaoAutenticada } from './auth.types.js';

const CHAVE_PERFIS = 'perfis';

// Uso: @Roles('admin') em um metodo ou em uma classe.
export const Roles = (...perfis: Perfil[]) =>
  SetMetadata(CHAVE_PERFIS, perfis);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const perfisPermitidos = this.reflector.getAllAndOverride<Perfil[]>(
      CHAVE_PERFIS,
      [context.getHandler(), context.getClass()],
    );

    // Rota sem @Roles(): qualquer usuario autenticado passa.
    if (!perfisPermitidos) {
      return true;
    }

    const { usuario } = context
      .switchToHttp()
      .getRequest<RequisicaoAutenticada>();

    if (!perfisPermitidos.includes(usuario.perfil)) {
      throw new ForbiddenException('Perfil sem permissao para esta acao');
    }

    return true;
  }
}
