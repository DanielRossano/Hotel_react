const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const moment = require('moment');

// Listar todas as reservas
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        reservations.*, 
        rooms.name AS room_name, 
        guests.name AS guest_name,
        reservations.custom_name
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
  const { room_id, guest_id, start_date, end_date, daily_rate, custom_name } = req.body;

  if (!room_id || !guest_id || !start_date || !end_date || !daily_rate) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  try {
    const formattedStartDate = moment(start_date).format('YYYY-MM-DD HH:mm:ss');
    const formattedEndDate = moment(end_date).format('YYYY-MM-DD HH:mm:ss');

    const [conflictingReservations] = await db.query(`
      SELECT * FROM reservations 
      WHERE room_id = ? 
      AND (
        (start_date <= ? AND end_date >= ?) OR 
        (start_date <= ? AND end_date >= ?) OR 
        (start_date >= ? AND end_date <= ?)
      )
    `, [room_id, formattedEndDate, formattedStartDate, formattedStartDate, formattedEndDate, formattedStartDate, formattedEndDate]);

    if (conflictingReservations.length > 0) {
      return res.status(400).json({ error: 'O quarto já está reservado para o período selecionado.' });
    }

    const start = moment(start_date);
    const end = moment(end_date);

    if (!end.isAfter(start)) {
      return res.status(400).json({ error: 'Datas inválidas. O check-out deve ser após o check-in.' });
    }

    const days = Math.ceil(end.diff(start, 'hours') / 24);
    const total_amount = days * daily_rate;

    const [result] = await db.query(`
      INSERT INTO reservations 
      (room_id, guest_id, start_date, end_date, daily_rate, total_amount, amount_paid, custom_name) 
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `, [room_id, guest_id, formattedStartDate, formattedEndDate, daily_rate, total_amount, custom_name]);

    res.status(201).json({
      id: result.insertId,
      room_id,
      guest_id,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      daily_rate,
      total_amount,
      custom_name,
    });
  } catch (error) {
    console.error('Erro ao cadastrar reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

// Atualizar reserva
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { room_id, guest_id, start_date, end_date, daily_rate, custom_name } = req.body;

  if (!room_id || !guest_id || !start_date || !end_date || !daily_rate) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  try {
    const formattedStartDate = moment(start_date).format('YYYY-MM-DD HH:mm:ss');
    const formattedEndDate = moment(end_date).format('YYYY-MM-DD HH:mm:ss');

    const start = moment(formattedStartDate).startOf('day');
    const end = moment(formattedEndDate).startOf('day');
    const days = end.diff(start, 'days') + 1;

    if (days <= 0) {
      return res.status(400).json({ error: 'Datas inválidas.' });
    }

    const total_amount = days * daily_rate;

    const [result] = await db.query(`
      UPDATE reservations 
      SET room_id = ?, guest_id = ?, start_date = ?, end_date = ?, daily_rate = ?, total_amount = ?, custom_name = ? 
      WHERE id = ?
    `, [room_id, guest_id, formattedStartDate, formattedEndDate, daily_rate, total_amount, custom_name, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    res.json({ message: 'Reserva atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

// Excluir reserva
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM reservations WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    res.json({ message: 'Reserva cancelada com sucesso.' });
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
