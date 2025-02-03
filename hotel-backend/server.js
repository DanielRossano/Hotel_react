const express = require('express');
const cors = require('cors');
const { join } = require('path');
const axios = require('axios');
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

// Rota para buscar CNPJ receitaws
app.get('/api/cnpj/:cnpj', async (req, res) => {
  const { cnpj } = req.params;

  try {

    const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
    const data = response.data;

    if (!data.nome) {
      return res.status(404).json({ error: 'CNPJ não encontrado' });
    }

    res.json(data); 
  } catch (error) {
    console.error('Erro ao buscar CNPJ:', error);
    res.status(500).json({ error: 'Erro ao buscar CNPJ' });
  }
});

// Inicializando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});