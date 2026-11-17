import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { MongoServerError } from 'mongodb';
import mongoose from 'mongoose';

@Catch(
  MongoServerError,
  mongoose.Error.ValidationError,
  mongoose.Error.CastError,
)
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoExceptionFilter.name);

  catch(erro: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    // Chave unica violada (por exemplo, nome de produto repetido)
    if (erro instanceof MongoServerError && erro.code === 11000) {
      return res.status(HttpStatus.CONFLICT).json({
        statusCode: 409,
        message: 'Registro duplicado',
        campos: Object.keys(erro.keyValue ?? {}),
      });
    }

    // Validacao do schema do Mongoose ou valor com tipo errado
    if (
      erro instanceof mongoose.Error.ValidationError ||
      erro instanceof mongoose.Error.CastError
    ) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: 'Dados rejeitados pelo banco',
        detalhe: erro.message,
      });
    }

    // Qualquer outra falha do MongoDB: nao vaza detalhes ao cliente
    this.logger.error(erro);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message: 'Erro interno ao acessar o banco de dados',
    });
  }
}
