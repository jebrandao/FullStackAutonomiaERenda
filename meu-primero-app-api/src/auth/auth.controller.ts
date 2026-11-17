import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { AuthService } from './auth.service.js';
import { loginSchema, registrarSchema } from './auth.types.js';
import type {
  DadosLogin,
  DadosRegistro,
  RequisicaoAutenticada,
} from './auth.types.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/registrar  (201 Created)
  @Post('registrar')
  registrar(
    @Body(new ZodValidationPipe(registrarSchema)) dados: DadosRegistro,
  ) {
    return this.authService.registrar(dados);
  }

  // POST /auth/login  (200 OK, devolve o token JWT)
  @Post('login')
  @HttpCode(200)
  login(@Body(new ZodValidationPipe(loginSchema)) dados: DadosLogin) {
    return this.authService.login(dados);
  }

  // GET /auth/eu  (rota protegida: devolve quem esta logado)
  @Get('eu')
  @UseGuards(JwtAuthGuard)
  eu(@Req() req: RequisicaoAutenticada) {
    const { email, perfil } = req.usuario;
    return { email, perfil };
  }
}
