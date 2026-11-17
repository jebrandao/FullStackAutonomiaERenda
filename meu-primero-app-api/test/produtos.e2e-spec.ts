import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { Usuario } from './../src/usuarios/usuario.schema.js';
import { UsuariosService } from './../src/usuarios/usuarios.service.js';

const EMAIL_ADMIN = 'admin-e2e@teste.com';
const EMAIL_COMUM = 'comum-e2e@teste.com';
const SENHA = 'senha-e2e-123';

describe('Produtos (e2e)', () => {
  let app: INestApplication<App>;
  let tokenAdmin: string;
  let tokenComum: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    // Cria um admin e um usuario comum so para os testes
    const usuarios = app.get(UsuariosService);
    const hash = await bcrypt.hash(SENHA, 4);
    await usuarios.criar(EMAIL_ADMIN, hash, 'admin');
    await usuarios.criar(EMAIL_COMUM, hash, 'usuario');

    const http = request(app.getHttpServer());
    const a = await http
      .post('/auth/login')
      .send({ email: EMAIL_ADMIN, senha: SENHA });
    const c = await http
      .post('/auth/login')
      .send({ email: EMAIL_COMUM, senha: SENHA });
    tokenAdmin = a.body.token;
    tokenComum = c.body.token;
  });

  afterAll(async () => {
    const modelo = app.get<Model<Usuario>>(getModelToken(Usuario.name));
    await modelo.deleteMany({ email: { $in: [EMAIL_ADMIN, EMAIL_COMUM] } });
    await app.close();
  });

  it('percorre o CRUD completo como admin', async () => {
    const http = request(app.getHttpServer());
    const auth = { Authorization: `Bearer ${tokenAdmin}` };

    const criado = await http
      .post('/produtos')
      .set(auth)
      .send({ nome: 'Produto E2E', preco: 10, estoque: 1 })
      .expect(201);
    const id = criado.body._id as string;

    await http.get(`/produtos/${id}`).expect(200);
    const atualizado = await http
      .patch(`/produtos/${id}`)
      .set(auth)
      .send({ preco: 20 })
      .expect(200);
    expect(atualizado.body.preco).toBe(20);

    await http.delete(`/produtos/${id}`).set(auth).expect(204);
    await http.get(`/produtos/${id}`).expect(404);
  });

  it('leitura e publica, escrita sem token da 401', async () => {
    const http = request(app.getHttpServer());
    await http.get('/produtos').expect(200);
    await http.post('/produtos').send({ nome: 'X Y', preco: 1 }).expect(401);
  });

  it('usuario comum recebe 403 ao tentar criar produto', () => {
    return request(app.getHttpServer())
      .post('/produtos')
      .set('Authorization', `Bearer ${tokenComum}`)
      .send({ nome: 'Nao Pode', preco: 1 })
      .expect(403);
  });

  it('token invalido recebe 401', () => {
    return request(app.getHttpServer())
      .delete('/produtos/6afc895a44f71e63b49f6728')
      .set('Authorization', 'Bearer token.falso.aqui')
      .expect(401);
  });

  it('responde 400 para id invalido', () => {
    return request(app.getHttpServer()).get('/produtos/abc').expect(400);
  });

  it('responde 400 com erros por campo quando o corpo e invalido', async () => {
    const res = await request(app.getHttpServer())
      .post('/produtos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nome: 'A', preco: -1 })
      .expect(400);
    expect(res.body.erros).toHaveLength(2);
  });

  it('responde 409 para nome duplicado', async () => {
    const http = request(app.getHttpServer());
    const auth = { Authorization: `Bearer ${tokenAdmin}` };
    const primeiro = await http
      .post('/produtos')
      .set(auth)
      .send({ nome: 'Produto Duplicado', preco: 5 })
      .expect(201);

    await http
      .post('/produtos')
      .set(auth)
      .send({ nome: 'Produto Duplicado', preco: 5 })
      .expect(409);

    await http.delete(`/produtos/${primeiro.body._id}`).set(auth).expect(204);
  });
});
