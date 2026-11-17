import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('deve informar que a API esta no ar', () => {
    expect(controller.status()).toEqual({
      app: 'meu-primero-app-api',
      status: 'ok',
    });
  });
});
