import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { Pedido } from './../src/pedidos/pedido.schema.js';
import { Usuario } from './../src/usuarios/usuario.schema.js';

const EMAIL = 'cliente-e2e@teste.com';
const SENHA = 'senha-e2e-123';

describe('Auth e Pedidos (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    const usuarios = app.get<Model<Usuario>>(getModelToken(Usuario.name));
    const pedidos = app.get<Model<Pedido>>(getModelToken(Pedido.name));
    const usuario = await usuarios.findOne({ email: EMAIL });
    if (usuario) {
      await pedidos.deleteMany({ usuario: usuario._id });
      await usuarios.deleteOne({ _id: usuario._id });
    }
    await app.close();
  });

  it('registra, faz login e cria um pedido com preco vindo do banco', async () => {
    const http = request(app.getHttpServer());

    await http
      .post('/auth/registrar')
      .send({ email: EMAIL, senha: SENHA })
      .expect(201);
    await http
      .post('/auth/registrar')
      .send({ email: EMAIL, senha: SENHA })
      .expect(409);

    const login = await http
      .post('/auth/login')
      .send({ email: EMAIL, senha: SENHA })
      .expect(200);
    const auth = { Authorization: `Bearer ${login.body.token}` };
    expect(login.body.usuario).toEqual({ email: EMAIL, perfil: 'usuario' });

    await http.get('/auth/eu').set(auth).expect(200);

    const pedido = await http
      .post('/pedidos')
      .set(auth)
      .send({
        cliente: {
          nome: 'Cliente Teste',
          email: EMAIL,
          endereco: 'Rua das Flores, 10',
        },
        // O preco enviado (1) deve ser ignorado
        itens: [
          { nome: 'Mouse Gamer', preco: 1 },
          { nome: 'Mouse Gamer', preco: 1 },
        ],
      })
      .expect(201);
    expect(pedido.body.total).toBe(259.8);

    const meus = await http.get('/pedidos/meus').set(auth).expect(200);
    expect(meus.body).toHaveLength(1);

    // Usuario comum nao lista todos os pedidos
    await http.get('/pedidos').set(auth).expect(403);
  });

  it('login com senha errada recebe 401', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@email.com', senha: 'senha-errada' })
      .expect(401);
  });

  it('pedido sem login recebe 401 e produto inexistente recebe 400', async () => {
    const http = request(app.getHttpServer());
    await http.post('/pedidos').send({}).expect(401);

    await http.post('/auth/registrar').send({ email: EMAIL, senha: SENHA });
    const login = await http
      .post('/auth/login')
      .send({ email: EMAIL, senha: SENHA });
    await http
      .post('/pedidos')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({
        cliente: { nome: 'Cliente Teste', email: EMAIL, endereco: 'Rua A, 1' },
        itens: [{ nome: 'Produto Que Nao Existe' }],
      })
      .expect(400);
  });
});
