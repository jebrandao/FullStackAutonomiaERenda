import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProdutoDocument = HydratedDocument<Produto>;

@Schema({ timestamps: true })
export class Produto {
  @Prop({ required: true, trim: true, unique: true })
  nome: string;

  @Prop({ required: true, min: 0 })
  preco: number;

  @Prop({ default: '' })
  descricao: string;

  @Prop({ default: 0, min: 0 })
  estoque: number;
}

export const ProdutoSchema = SchemaFactory.createForClass(Produto);
