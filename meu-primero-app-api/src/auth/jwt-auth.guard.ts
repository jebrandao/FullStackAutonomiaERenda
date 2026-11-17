import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { PayloadJwt, RequisicaoAutenticada } from './auth.types.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<RequisicaoAutenticada>();

    // Cabecalho esperado: Authorization: Bearer <token>
    const [tipo, token] = (req.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token ausente');
    }

    try {
      req.usuario = await this.jwt.verifyAsync<PayloadJwt>(token);
    } catch {
      throw new UnauthorizedException('Token invalido ou expirado');
    }

    return true;
  }
}
