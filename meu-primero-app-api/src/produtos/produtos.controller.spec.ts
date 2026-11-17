import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ProdutosController } from './produtos.controller.js';
import { ProdutosService } from './produtos.service.js';

describe('ProdutosController', () => {
  let controller: ProdutosController;
  const listaFalsa = [{ nome: 'Teclado', preco: 120 }];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutosController],
      providers: [
        // Os guards do controller pedem o JwtService: usamos um falso
        { provide: JwtService, useValue: {} },
        {
          provide: ProdutosService,
          useValue: { listar: vi.fn().mockResolvedValue(listaFalsa) },
        },
      ],
    }).compile();

    controller = module.get<ProdutosController>(ProdutosController);
  });

  it('deve devolver a lista vinda do service', async () => {
    await expect(controller.listar()).resolves.toEqual(listaFalsa);
  });
});
