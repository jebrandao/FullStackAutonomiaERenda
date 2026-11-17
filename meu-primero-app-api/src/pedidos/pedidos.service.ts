import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Produto } from '../produtos/produto.schema.js';
import { Pedido } from './pedido.schema.js';
import type { DadosPedido } from './pedido.types.js';

@Injectable()
export class PedidosService {
  constructor(
    @InjectModel(Pedido.name) private readonly pedidoModel: Model<Pedido>,
    @InjectModel(Produto.name) private readonly produtoModel: Model<Produto>,
  ) {}

  async criar(usuarioId: string, dados: DadosPedido) {
    // Os precos vem do banco, nunca do cliente (evita adulterar o valor).
    const nomes = [...new Set(dados.itens.map((item) => item.nome))];
    const produtos = await this.produtoModel
      .find({ nome: { $in: nomes } })
      .exec();
    const precos = new Map(produtos.map((p) => [p.nome, p.preco]));

    const itens = dados.itens.map((item) => {
      const preco = precos.get(item.nome);
      if (preco === undefined) {
        throw new BadRequestException(`Produto inexistente: ${item.nome}`);
      }
      return { nome: item.nome, preco };
    });

    const total = Number(
      itens.reduce((soma, item) => soma + item.preco, 0).toFixed(2),
    );

    return this.pedidoModel.create({
      usuario: usuarioId,
      cliente: dados.cliente.nome,
      email: dados.cliente.email,
      endereco: dados.cliente.endereco,
      itens,
      total,
    });
  }

  listarDoUsuario(usuarioId: string) {
    return this.pedidoModel
      .find({ usuario: usuarioId })
      .sort({ createdAt: -1 })
      .exec();
  }

  listarTodos() {
    return this.pedidoModel
      .find()
      .populate('usuario', 'email')
      .sort({ createdAt: -1 })
      .exec();
  }
}
