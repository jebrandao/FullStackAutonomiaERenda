import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import type { DadosLogin, DadosRegistro } from './auth.types.js';

const RODADAS_BCRYPT = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly jwt: JwtService,
  ) {}

  async registrar(dados: DadosRegistro) {
    const existente = await this.usuarios.buscarPorEmail(dados.email);
    if (existente) {
      throw new ConflictException('E-mail ja cadastrado');
    }

    const senhaHash = await bcrypt.hash(dados.senha, RODADAS_BCRYPT);
    const usuario = await this.usuarios.criar(dados.email, senhaHash);

    return { email: usuario.email, perfil: usuario.perfil };
  }

  async login(dados: DadosLogin) {
    const usuario = await this.usuarios.buscarPorEmail(dados.email);
    const senhaConfere = usuario
      ? await bcrypt.compare(dados.senha, usuario.senhaHash)
      : false;

    // Mesma mensagem para e-mail inexistente e senha errada:
    // assim ninguem descobre quais e-mails estao cadastrados.
    if (!usuario || !senhaConfere) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const token = await this.jwt.signAsync({
      sub: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    });

    return { token, usuario: { email: usuario.email, perfil: usuario.perfil } };
  }
}
