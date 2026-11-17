import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Perfil, Usuario } from './usuario.schema.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
  ) {}

  buscarPorEmail(email: string) {
    return this.usuarioModel.findOne({ email: email.toLowerCase() }).exec();
  }

  criar(email: string, senhaHash: string, perfil: Perfil = 'usuario') {
    return this.usuarioModel.create({ email, senhaHash, perfil });
  }
}
