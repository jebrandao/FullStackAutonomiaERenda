import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { RequisicaoAutenticada } from '../auth/auth.types.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { criarPedidoSchema } from './pedido.types.js';
import type { DadosPedido } from './pedido.types.js';
import { PedidosService } from './pedidos.service.js';

// Todas as rotas de pedidos exigem login.
@Controller('pedidos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  // POST /pedidos
  @Post()
  criar(
    @Req() req: RequisicaoAutenticada,
    @Body(new ZodValidationPipe(criarPedidoSchema)) dados: DadosPedido,
  ) {
    return this.pedidosService.criar(req.usuario.sub, dados);
  }

  // GET /pedidos/meus
  @Get('meus')
  meus(@Req() req: RequisicaoAutenticada) {
    return this.pedidosService.listarDoUsuario(req.usuario.sub);
  }

  // GET /pedidos  (somente admin)
  @Get()
  @Roles('admin')
  todos() {
    return this.pedidosService.listarTodos();
  }
}
