import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const PERFIS = ['usuario', 'admin'] as const;
export type Perfil = (typeof PERFIS)[number];

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  // Nunca guardamos a senha: apenas o hash gerado pelo BCrypt.
  @Prop({ required: true })
  senhaHash: string;

  @Prop({ type: String, enum: PERFIS, default: 'usuario' })
  perfil: Perfil;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
