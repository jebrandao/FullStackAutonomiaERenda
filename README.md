# FullStackAutonomiaERenda

Loja de exemplo do curso Full Stack (SENAI):

- `meu-primero-app`: front Angular 21 (lista de produtos, carrinho, checkout, login e admin).
- `meu-primero-app-api`: API NestJS 12 + MongoDB (Mongoose), com CRUD de produtos, validacao com Zod, login com BCrypt e JWT, perfis (usuario e admin) e pedidos.

## Como rodar

Requisitos: Node 24, MongoDB local (porta 27017) e Nest CLI 12.

API:

```bash
cd meu-primero-app-api
cp .env.example .env        # defina JWT_SECRET no .env
npm install
node --env-file=.env scripts/seed.mjs
node --env-file=.env scripts/seed-usuarios.mjs   # admin@email.com / admin123
npm run start
```

Front:

```bash
cd meu-primero-app
npm install
npm start                   # http://localhost:4200
```
