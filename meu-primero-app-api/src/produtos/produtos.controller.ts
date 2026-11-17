import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { ProdutosService } from './produtos.service.js';
import {
  atualizarProdutoSchema,
  criarProdutoSchema,
  filtrosProdutoSchema,
} from './produto.types.js';
import type {
  DadosAtualizacao,
  DadosProduto,
  FiltrosProduto,
} from './produto.types.js';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  // GET /produtos?nome=teclado&precoMax=300
  @Get()
  listar(
    @Query(new ZodValidationPipe(filtrosProdutoSchema))
    filtros: FiltrosProduto,
  ) {
    return this.produtosService.listar(filtros);
  }

  // GET /produtos/:id
  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.produtosService.buscarPorId(id);
  }

  // POST /produtos  (201 Created, somente admin)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  criar(
    @Body(new ZodValidationPipe(criarProdutoSchema)) dados: DadosProduto,
  ) {
    return this.produtosService.criar(dados);
  }

  // PUT /produtos/:id  (somente admin, todos os campos obrigatorios)
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  substituir(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(criarProdutoSchema)) dados: DadosProduto,
  ) {
    return this.produtosService.atualizar(id, dados);
  }

  // PATCH /produtos/:id  (somente admin, campos opcionais)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  atualizar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarProdutoSchema))
    dados: DadosAtualizacao,
  ) {
    return this.produtosService.atualizar(id, dados);
  }

  // DELETE /produtos/:id  (somente admin, 204 No Content)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(204)
  remover(@Param('id') id: string) {
    return this.produtosService.remover(id);
  }
}
