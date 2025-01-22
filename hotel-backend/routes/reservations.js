const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Listar todas as reservas
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        reservations.*, 
        rooms.name AS room_name, 
        guests.name AS guest_name 
      FROM reservations
      JOIN rooms ON reservations.room_id = rooms.id
      JOIN guests ON reservations.guest_id = guests.id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cadastrar nova reserva
router.post('/', async (req, res) => {
  const { room_id, guest_id, start_date, end_date, daily_rate } = req.body;

  if (!room_id || !guest_id || !start_date || !end_date || !daily_rate) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Verificar conflito de datas para o quarto
    const [conflictingReservations] = await db.query(
      `
      SELECT * FROM reservations 
      WHERE room_id = ? 
      AND (
        (start_date <= ? AND end_date >= ?) OR 
        (start_date <= ? AND end_date >= ?) OR 
        (start_date >= ? AND end_date <= ?)
      )
      `,
      [room_id, end_date, start_date, start_date, end_date, start_date, end_date]
    );

    if (conflictingReservations.length > 0) {
      return res.status(400).json({
        error: 'O quarto já está reservado para o período selecionado.',
      });
    }

    // Calcular total de diárias
    const start = new Date(start_date);
    const end = new Date(end_date);
    const days = (end - start) / (1000 * 60 * 60 * 24);

    if (days <= 0) {
      return res.status(400).json({ error: 'Datas inválidas.' });
    }

    const total_amount = days * daily_rate;

    // Inserir a reserva no banco de dados
    const [result] = await db.query(
      `
      INSERT INTO reservations 
      (room_id, guest_id, start_date, end_date, daily_rate, total_amount, amount_paid) 
      VALUES (?, ?, ?, ?, ?, ?, 0)
      `,
      [room_id, guest_id, start_date, end_date, daily_rate, total_amount]
    );

    res.status(201).json({
      id: result.insertId,
      room_id,
      guest_id,
      start_date,
      end_date,
      daily_rate,
      total_amount,
    });
  } catch (error) {
    console.error('Erro ao cadastrar reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { room_id, guest_id, start_date, end_date, daily_rate } = req.body;

  if (!room_id || !guest_id || !start_date || !end_date || !daily_rate) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const start = new Date(start_date);
    const end = new Date(end_date);
    const days = (end - start) / (1000 * 60 * 60 * 24);

    if (days <= 0) {
      return res.status(400).json({ error: 'Datas inválidas.' });
    }

    const total_amount = days * daily_rate;

    const [result] = await db.query(
      `
      UPDATE reservations 
      SET room_id = ?, guest_id = ?, start_date = ?, end_date = ?, daily_rate = ?, total_amount = ? 
      WHERE id = ?
      `,
      [room_id, guest_id, start_date, end_date, daily_rate, total_amount, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    res.json({ message: 'Reserva atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

// exclui reserva
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM reservations WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    res.json({ message: 'Reserva cancelada com sucesso.' }); // Retorno claro
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
