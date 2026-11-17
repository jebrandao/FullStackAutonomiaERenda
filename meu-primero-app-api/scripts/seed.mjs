import mongoose from 'mongoose';

const produtos = [
  { nome: 'Teclado Mecanico', preco: 249.9, descricao: 'Switch azul, ABNT2', estoque: 15 },
  { nome: 'Mouse Gamer', preco: 129.9, descricao: '6 botoes, 12000 DPI', estoque: 30 },
  { nome: 'Monitor 24 pol', preco: 899.0, descricao: 'Full HD, 75 Hz', estoque: 8 },
  { nome: 'Headset USB', preco: 189.5, descricao: 'Com microfone', estoque: 20 },
  { nome: 'Webcam HD', preco: 159.0, descricao: '720p com microfone', estoque: 12 },
];

await mongoose.connect(process.env.MONGODB_URI);
const colecao = mongoose.connection.collection('produtos');
await colecao.deleteMany({});
const agora = new Date();
await colecao.insertMany(produtos.map((p) => ({ ...p, createdAt: agora, updatedAt: agora })));
console.log(`Seed concluido: ${produtos.length} produtos inseridos.`);
await mongoose.disconnect();
