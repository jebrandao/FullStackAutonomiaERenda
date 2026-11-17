import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET / informa que a API esta no ar', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ app: 'meu-primero-app-api', status: 'ok' });
  });

  it('GET /produtos responde 200 com uma lista', async () => {
    const res = await request(app.getHttpServer()).get('/produtos').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterEach(async () => {
    await app.close();
  });
});
