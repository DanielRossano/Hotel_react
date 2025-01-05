const express = require('express');
const cors = require('cors');
const { join } = require('path');
const db = require('./db/connection');

db.query('SELECT 1 + 1 AS result')
  .then(([rows]) => console.log('Banco conectado! Resultado:', rows))
  .catch((err) => console.error('Erro ao conectar no banco:', err));

// Criando o servidor
const app = express();
const PORT = 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/rooms', require('./routes/rooms'));
app.use('/reservations', require('./routes/reservations'));
app.use('/guests', require('./routes/guests'));

// Inicializando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
