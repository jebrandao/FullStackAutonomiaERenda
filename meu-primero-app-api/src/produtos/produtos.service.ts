import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Produto } from './produto.schema.js';
import type {
  DadosAtualizacao,
  DadosProduto,
  FiltrosProduto,
} from './produto.types.js';

const ID_VALIDO = /^[0-9a-fA-F]{24}$/;

@Injectable()
export class ProdutosService {
  constructor(
    @InjectModel(Produto.name) private readonly produtoModel: Model<Produto>,
  ) {}

  listar(filtros: FiltrosProduto = {}) {
    const consulta: Record<string, unknown> = {};

    if (filtros.nome) {
      const texto = filtros.nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      consulta.nome = { $regex: texto, $options: 'i' };
    }
    if (filtros.precoMax !== undefined) {
      consulta.preco = { $lte: filtros.precoMax };
    }

    return this.produtoModel.find(consulta).sort({ nome: 1 }).exec();
  }

  async buscarPorId(id: string) {
    this.validarId(id);
    const produto = await this.produtoModel.findById(id).exec();
    if (!produto) {
      throw new NotFoundException(`Produto ${id} nao encontrado`);
    }
    return produto;
  }

  criar(dados: DadosProduto) {
    return this.produtoModel.create(dados);
  }

  async atualizar(id: string, dados: DadosAtualizacao) {
    this.validarId(id);
    const produto = await this.produtoModel
      .findByIdAndUpdate(id, dados, { new: true, runValidators: true })
      .exec();
    if (!produto) {
      throw new NotFoundException(`Produto ${id} nao encontrado`);
    }
    return produto;
  }

  async remover(id: string) {
    this.validarId(id);
    const produto = await this.produtoModel.findByIdAndDelete(id).exec();
    if (!produto) {
      throw new NotFoundException(`Produto ${id} nao encontrado`);
    }
  }

  private validarId(id: string) {
    if (!ID_VALIDO.test(id)) {
      throw new BadRequestException(`Id invalido: ${id}`);
    }
  }
}
