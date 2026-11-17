import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProdutosController } from './produtos.controller.js';
import { ProdutosService } from './produtos.service.js';
import { Produto, ProdutoSchema } from './produto.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Produto.name, schema: ProdutoSchema }]),
  ],
  controllers: [ProdutosController],
  providers: [ProdutosService],
})
export class ProdutosModule {}
