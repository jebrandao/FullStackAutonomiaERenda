import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type PedidoDocument = HydratedDocument<Pedido>;

@Schema({ _id: false })
export class ItemPedido {
  @Prop({ required: true })
  nome: string;

  @Prop({ required: true, min: 0 })
  preco: number;
}
export const ItemPedidoSchema = SchemaFactory.createForClass(ItemPedido);

@Schema({ timestamps: true })
export class Pedido {
  // Referencia ao usuario dono do pedido (colecao "usuarios")
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  usuario: Types.ObjectId;

  @Prop({ required: true })
  cliente: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  endereco: string;

  @Prop({ type: [ItemPedidoSchema], required: true })
  itens: ItemPedido[];

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({
    type: String,
    enum: ['pendente', 'pago', 'cancelado'],
    default: 'pendente',
  })
  status: string;
}

export const PedidoSchema = SchemaFactory.createForClass(Pedido);
