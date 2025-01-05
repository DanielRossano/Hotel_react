const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Listar todos os hóspedes
router.get('/', async (req, res) => {
  const { search, type } = req.query;

  try {
    let query = 'SELECT * FROM guests WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR cpf_cnpj LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar hóspedes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cadastrar novo hóspede
router.post('/', async (req, res) => {
  const { name, cpf_cnpj, address, nome_fantasia, type } = req.body;

  if (!name || !cpf_cnpj || !type) {
    return res.status(400).json({ error: 'Nome, CPF/CNPJ e tipo são obrigatórios.' });
  }

  try {
    const fullAddress = JSON.stringify(address); // Serializar o endereço para texto
    const [result] = await db.query(
      'INSERT INTO guests (name, cpf_cnpj, address, nome_fantasia, type) VALUES (?, ?, ?, ?, ?)',
      [name, cpf_cnpj, fullAddress, nome_fantasia || null, type]
    );
    res.status(201).json({ id: result.insertId, name, cpf_cnpj, address, nome_fantasia, type });
  } catch (error) {
    console.error('Erro ao cadastrar hóspede:', error);
    res.status(500).json({ error: error.message });
  }
});

// Atualizar hóspede
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, cpf_cnpj, address, nome_fantasia, type } = req.body;

  if (!name || !cpf_cnpj || !type) {
    return res.status(400).json({ error: 'Nome, CPF/CNPJ e tipo são obrigatórios.' });
  }

  try {
    const fullAddress = JSON.stringify(address);
    const [result] = await db.query(
      'UPDATE guests SET name = ?, cpf_cnpj = ?, address = ?, nome_fantasia = ?, type = ? WHERE id = ?',
      [name, cpf_cnpj, fullAddress, nome_fantasia || null, type, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hóspede não encontrado.' });
    }

    res.json({ message: 'Hóspede atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar hóspede:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deletar hóspede
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM guests WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hóspede não encontrado.' });
    }

    res.json({ message: 'Hóspede excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir hóspede:', error);
    res.status(500).json({ error: error.message });
  }
});router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar se existem reservas associadas
    const [reservations] = await db.query(
      'SELECT id FROM reservations WHERE guest_id = ?',
      [id]
    );

    if (reservations.length > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir o hóspede porque ele possui reservas associadas.',
      });
    }

    // Excluir o hóspede
    const [result] = await db.query('DELETE FROM guests WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hóspede não encontrado.' });
    }

    res.json({ message: 'Hóspede excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir hóspede:', error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
