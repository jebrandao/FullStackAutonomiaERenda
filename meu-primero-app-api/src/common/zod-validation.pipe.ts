import { BadRequestException, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(valor: unknown) {
    const resultado = this.schema.safeParse(valor);

    if (!resultado.success) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Dados invalidos',
        erros: resultado.error.issues.map((problema) => ({
          campo: problema.path.join('.'),
          mensagem: problema.message,
        })),
      });
    }

    return resultado.data;
  }
}
