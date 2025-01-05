const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Listar todos os quartos
router.get('/', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM rooms');
      console.log('Resultado do MySQL:', rows); // Log para depuração
      res.json(rows);
    } catch (error) {
      console.error('Erro ao buscar quartos:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
// Adicionar um novo quarto
router.post('/', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'O nome do quarto é obrigatório.' });
  }

  try {
    const [result] = await db.query('INSERT INTO rooms (name) VALUES (?)', [
      name,
    ]);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar o nome do quarto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "O nome do quarto é obrigatório." });
  }

  try {
    const [result] = await db.query('UPDATE rooms SET name = ? WHERE id = ?', [
      name,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Quarto não encontrado." });
    }

    res.json({ message: "Quarto atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar o quarto:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;

