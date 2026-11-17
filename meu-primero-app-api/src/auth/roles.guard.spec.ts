import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';

function criarContexto(perfil: string) {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ usuario: { perfil } }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: vi.fn() };
  const guard = new RolesGuard(reflector as unknown as Reflector);

  it('libera quando a rota nao exige perfil', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(criarContexto('usuario'))).toBe(true);
  });

  it('libera o admin em rota @Roles("admin")', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(guard.canActivate(criarContexto('admin'))).toBe(true);
  });

  it('bloqueia usuario comum em rota @Roles("admin") com 403', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(() => guard.canActivate(criarContexto('usuario'))).toThrow(
      ForbiddenException,
    );
  });
});
