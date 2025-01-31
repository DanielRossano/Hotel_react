const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Listar todos os hóspedes
router.get('/', async (req, res) => {
  const { search, type } = req.query;
try {
  let query = 'SELECT * FROM guests';
  const queryParams = [];

  if (search) {
    query += ' WHERE name LIKE ? OR cpf_cnpj LIKE ?';
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  if (type) {
    query += search ? ' AND type = ?' : ' WHERE type = ?';
    queryParams.push(type);
  }

  const [rows] = await db.query(query, queryParams);
  res.json(rows);
} catch (error) {
  console.error('Erro ao listar hóspedes:', error);
  res.status(500).json({ error: error.message });
}
});
// Cadastrar novo hóspede
router.post('/', async (req, res) => {
  const {
    name,
    cpf_cnpj,
    telefone,
    type,
    address: { estado, cidade, bairro, rua, numero, cep } = {},
    nome_fantasia,
  } = req.body;

  // Verificação adicional
  if (!name || !cpf_cnpj || type === undefined) {
    return res
      .status(400)
      .json({ error: 'Nome, CPF/CNPJ e tipo são obrigatórios.' });
  }

  // Certifique-se de que "type" está no formato esperado (0 ou 1)
  const guestType = type === "fisica" ? 0 : 1;

  try {
    const [result] = await db.query(
      `
      INSERT INTO guests (name, cpf_cnpj, telefone, estado, cidade, bairro, rua, numero, cep, nome_fantasia, type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        cpf_cnpj,
        telefone || null,
        estado || null,
        cidade || null,
        bairro || null,
        rua || null,
        numero || null,
        cep || null,
        nome_fantasia || null,
        guestType,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      cpf_cnpj,
      telefone,
      estado,
      cidade,
      bairro,
      rua,
      numero,
      cep,
      nome_fantasia,
      type: guestType,
    });
  } catch (error) {
    console.error('Erro ao cadastrar hóspede:', error);
    res.status(500).json({ error: error.message });
  }
});


// Atualizar hóspede
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    cpf_cnpj,
    telefone,
    estado,
    cidade,
    bairro,
    rua,
    numero,
    cep,
    nome_fantasia,
    type,
  } = req.body;

  if (!name || !cpf_cnpj || type === undefined) {
    return res.status(400).json({ error: 'Nome, CPF/CNPJ e tipo são obrigatórios.' });
  }

  try {
    const [result] = await db.query(
      `
      UPDATE guests 
      SET 
        name = ?,
        cpf_cnpj = ?,
        telefone = ?,  
        estado = ?, 
        cidade = ?, 
        bairro = ?, 
        rua = ?, 
        numero = ?, 
        cep = ?, 
        nome_fantasia = ?, 
        type = ? 
      WHERE id = ?
      `,
      [
        name,
        cpf_cnpj,
        telefone || null,
        estado,
        cidade,
        bairro,
        rua,
        numero,
        cep,
        nome_fantasia || null,
        type === "fisica" ? 0 : 1, // Converter para booleano
        id,
      ]
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
