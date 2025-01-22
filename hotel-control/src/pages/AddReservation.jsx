import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Conexão com o backend
import moment from 'moment';
import 'moment/locale/pt-br';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddReservation = () => {
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [newReservation, setNewReservation] = useState({
    room_id: '',
    guest_id: '',
    start_date: '',
    end_date: '',
    daily_rate: '',
    total_amount: '',
  });

  // Carregar quartos e hóspedes
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await api.get('/rooms');
        setRooms(data);
      } catch (error) {
        console.error('Erro ao carregar quartos:', error);
        toast.error('Erro ao carregar quartos');
      }
    };

    const fetchGuests = async () => {
      try {
        const { data } = await api.get('/guests');
        setGuests(data);
      } catch (error) {
        console.error('Erro ao carregar hóspedes:', error);
        toast.error('Erro ao carregar hóspedes');
      }
    };

    fetchRooms();
    fetchGuests();
  }, []);

  // Calcular valor total com base na data de início, fim e diária
  const calculateTotalAmount = () => {
    const { start_date, end_date, daily_rate } = newReservation;
    if (start_date && end_date && daily_rate) {
      const start = moment(start_date);
      const end = moment(end_date);
      const days = end.diff(start, 'days') + 1; // Inclui o dia de início
      if (days > 0) {
        const total = days * parseFloat(daily_rate);
        setNewReservation({ ...newReservation, total_amount: total.toFixed(2) });
      } else {
        toast.error('A data de fim deve ser posterior à data de início.');
      }
    }
  };

  // Lida com as mudanças nos campos de entrada
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReservation({ ...newReservation, [name]: value });

    if (name === 'start_date' || name === 'end_date' || name === 'daily_rate') {
      setTimeout(calculateTotalAmount, 100); // Aguarda pequenas mudanças antes de calcular o total
    }
  };

  // Enviar nova reserva ao backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservations', newReservation);
      toast.success('Reserva cadastrada com sucesso!');
      setNewReservation({
        room_id: '',
        guest_id: '',
        start_date: '',
        end_date: '',
        daily_rate: '',
        total_amount: '',
      });
    } catch (error) {
      console.error('Erro ao cadastrar reserva:', error);
      toast.error('Erro ao cadastrar reserva');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Cadastrar Reserva</h1>
      <ToastContainer />

      <form onSubmit={handleSubmit}>
        {/* Selecionar Hóspede */}
        <div className="mb-3">
          <label htmlFor="guest_id" className="form-label">
            Hóspede
          </label>
          <select
            id="guest_id"
            name="guest_id"
            className="form-select"
            value={newReservation.guest_id}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>
              Selecione um hóspede
            </option>
            {guests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guest.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selecionar Quarto */}
        <div className="mb-3">
          <label htmlFor="room_id" className="form-label">
            Quarto
          </label>
          <select
            id="room_id"
            name="room_id"
            className="form-select"
            value={newReservation.room_id}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>
              Selecione um quarto
            </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>

        {/* Data de Início */}
        <div className="mb-3">
          <label htmlFor="start_date" className="form-label">
            Data de Início
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            className="form-control"
            value={newReservation.start_date}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Data de Fim */}
        <div className="mb-3">
          <label htmlFor="end_date" className="form-label">
            Data de Fim
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            className="form-control"
            value={newReservation.end_date}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Valor da Diária */}
        <div className="mb-3">
          <label htmlFor="daily_rate" className="form-label">
            Valor da Diária (R$)
          </label>
          <input
            type="number"
            step="0.01"
            id="daily_rate"
            name="daily_rate"
            className="form-control"
            value={newReservation.daily_rate}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Valor Total */}
        <div className="mb-3">
          <label htmlFor="total_amount" className="form-label">
            Valor Total (R$)
          </label>
          <input
            type="text"
            id="total_amount"
            name="total_amount"
            className="form-control"
            value={newReservation.total_amount}
            readOnly
          />
        </div>

        {/* Botão de Enviar */}
        <button type="submit" className="btn btn-primary">
          Cadastrar Reserva
        </button>
      </form>
    </div>
  );
};

export default AddReservation;
