import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Produto } from './produto.schema.js';
import { ProdutosService } from './produtos.service.js';

describe('ProdutosService', () => {
  let service: ProdutosService;
  const produtoModel = {
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
    create: vi.fn(),
  };
  const executar = (valor: unknown) => ({ exec: () => Promise.resolve(valor) });
  const ID = '6afc895a44f71e63b49f6728';

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutosService,
        { provide: getModelToken(Produto.name), useValue: produtoModel },
      ],
    }).compile();
    service = module.get<ProdutosService>(ProdutosService);
  });

  it('rejeita id mal formado com 400', async () => {
    await expect(service.buscarPorId('abc')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('devolve 404 quando o produto nao existe', async () => {
    produtoModel.findById.mockReturnValue(executar(null));
    await expect(service.buscarPorId(ID)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('devolve o produto quando existe', async () => {
    produtoModel.findById.mockReturnValue(executar({ nome: 'Mouse' }));
    await expect(service.buscarPorId(ID)).resolves.toEqual({ nome: 'Mouse' });
  });

  it('monta o filtro de nome e preco maximo', async () => {
    const sort = vi.fn().mockReturnValue(executar([]));
    produtoModel.find.mockReturnValue({ sort });
    await service.listar({ nome: 'tec', precoMax: 300 });
    expect(produtoModel.find).toHaveBeenCalledWith({
      nome: { $regex: 'tec', $options: 'i' },
      preco: { $lte: 300 },
    });
  });

  it('remover devolve 404 quando nao encontra', async () => {
    produtoModel.findByIdAndDelete.mockReturnValue(executar(null));
    await expect(service.remover(ID)).rejects.toBeInstanceOf(NotFoundException);
  });
});
