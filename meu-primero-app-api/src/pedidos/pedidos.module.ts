import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Produto, ProdutoSchema } from '../produtos/produto.schema.js';
import { Pedido, PedidoSchema } from './pedido.schema.js';
import { PedidosController } from './pedidos.controller.js';
import { PedidosService } from './pedidos.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pedido.name, schema: PedidoSchema },
      { name: Produto.name, schema: ProdutoSchema },
    ]),
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
