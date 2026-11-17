import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { LoggerMiddleware } from './common/logger.middleware.js';
import { MongoExceptionFilter } from './common/mongo-exception.filter.js';
import { PedidosModule } from './pedidos/pedidos.module.js';
import { ProdutosModule } from './produtos/produtos.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    UsuariosModule,
    AuthModule,
    ProdutosModule,
    PedidosModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_FILTER, useClass: MongoExceptionFilter }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*path');
  }
}
