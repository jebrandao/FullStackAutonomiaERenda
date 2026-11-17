import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// Usuario administrador de teste (o front ja trata admin@email.com como admin).
const EMAIL_ADMIN = 'admin@email.com';
const SENHA_ADMIN = 'admin123';

await mongoose.connect(process.env.MONGODB_URI);
const colecao = mongoose.connection.collection('usuarios');

const senhaHash = await bcrypt.hash(SENHA_ADMIN, 10);
const agora = new Date();

await colecao.updateOne(
  { email: EMAIL_ADMIN },
  {
    $set: { senhaHash, perfil: 'admin', updatedAt: agora },
    $setOnInsert: { createdAt: agora },
  },
  { upsert: true },
);

console.log(`Admin pronto: ${EMAIL_ADMIN} / ${SENHA_ADMIN}`);
await mongoose.disconnect();
