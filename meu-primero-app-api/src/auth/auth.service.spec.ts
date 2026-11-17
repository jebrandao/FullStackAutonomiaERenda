import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  const usuarios = { buscarPorEmail: vi.fn(), criar: vi.fn() };
  const jwt = { signAsync: vi.fn().mockResolvedValue('token-falso') };

  beforeEach(async () => {
    vi.clearAllMocks();
    jwt.signAsync.mockResolvedValue('token-falso');
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: usuarios },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  it('registrar guarda apenas o hash da senha', async () => {
    usuarios.buscarPorEmail.mockResolvedValue(null);
    usuarios.criar.mockResolvedValue({ email: 'a@a.com', perfil: 'usuario' });

    await service.registrar({ email: 'a@a.com', senha: 'segredo123' });

    const [, hash] = usuarios.criar.mock.calls[0] as [string, string];
    expect(hash).not.toBe('segredo123');
    expect(await bcrypt.compare('segredo123', hash)).toBe(true);
  });

  it('registrar rejeita e-mail repetido com 409', async () => {
    usuarios.buscarPorEmail.mockResolvedValue({ email: 'a@a.com' });
    await expect(
      service.registrar({ email: 'a@a.com', senha: 'segredo123' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('login devolve token e perfil quando a senha confere', async () => {
    const senhaHash = await bcrypt.hash('segredo123', 4);
    usuarios.buscarPorEmail.mockResolvedValue({
      id: '1',
      email: 'a@a.com',
      perfil: 'admin',
      senhaHash,
    });

    const resposta = await service.login({
      email: 'a@a.com',
      senha: 'segredo123',
    });

    expect(resposta).toEqual({
      token: 'token-falso',
      usuario: { email: 'a@a.com', perfil: 'admin' },
    });
  });

  it('login rejeita senha errada e e-mail inexistente com 401', async () => {
    const senhaHash = await bcrypt.hash('segredo123', 4);
    usuarios.buscarPorEmail.mockResolvedValueOnce({ id: '1', senhaHash });
    await expect(
      service.login({ email: 'a@a.com', senha: 'errada' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    usuarios.buscarPorEmail.mockResolvedValueOnce(null);
    await expect(
      service.login({ email: 'x@x.com', senha: 'qualquer' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
