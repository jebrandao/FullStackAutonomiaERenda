import { BadRequestException } from '@nestjs/common';
import { criarProdutoSchema } from '../produtos/produto.types.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(criarProdutoSchema);

  it('devolve os dados validos (e remove campos desconhecidos)', () => {
    const resultado = pipe.transform({
      nome: '  Teclado  ',
      preco: 99,
      invasor: 'x',
    });
    expect(resultado).toEqual({ nome: 'Teclado', preco: 99 });
  });

  it('lanca 400 com a lista de erros por campo', () => {
    try {
      pipe.transform({ nome: 'A', preco: -5 });
      expect.unreachable('deveria ter lancado');
    } catch (erro) {
      expect(erro).toBeInstanceOf(BadRequestException);
      const corpo = (erro as BadRequestException).getResponse() as {
        erros: { campo: string }[];
      };
      expect(corpo.erros.map((e) => e.campo)).toEqual(['nome', 'preco']);
    }
  });
});
