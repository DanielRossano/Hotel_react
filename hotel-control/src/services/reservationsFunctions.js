import api from './api';
import moment from 'moment';
import { toast } from 'react-toastify';

// Carregar quartos e reservas
export const loadRoomsAndReservations = async () => {
  const roomsResponse = await api.get('/rooms');
  const reservationsResponse = await api.get('/reservations');
  return {
    rooms: roomsResponse.data,
    reservations: reservationsResponse.data,
  };
};

// Gerar intervalo de datas
export const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = moment(startDate);
  while (currentDate <= moment(endDate)) {
    dates.push(currentDate.format('YYYY-MM-DD'));
    currentDate = currentDate.add(1, 'day');
  }
  return dates;
};

// Listar todas as reservas
export const fetchReservations = async () => {
  const response = await api.get('/reservations');
  return response.data;
};

// Criar uma nova reserva
export const createReservation = async (newReservation) => {
  const response = await api.post('/reservations', newReservation);
  return response.data;
};

// Handle Add Reservation
export const handleAddReservation = async (newReservation) => {
  try {
    await createReservation(newReservation); // Chama a API para criar reserva
    toast.success('Reserva cadastrada com sucesso!');
    fetchReservations(); // Atualiza a lista de reservas
  } catch (error) {
    console.error('Erro ao cadastrar reserva:', error);

    // Verifica se há uma mensagem de erro específica
    const errorMessage =
      error.response && error.response.data.error
        ? error.response.data.error
        : 'Erro ao cadastrar reserva. Tente novamente.';
    toast.error(errorMessage);
  }
};


// Atualizar o pagamento de uma reserva
export const updateReservationPayment = async (id, amountPaid) => {
  const response = await api.put(`/reservations/${id}/payment`, { amount_paid: amountPaid });
  return response.data;
};

// aguarda hospedes
export const fetchGuests = async () => {
  const response = await api.get('/guests');
  return response.data;
};

// Atualiza reserva
export const updateReservation = async (updatedReservation) => {
  const { id, ...data } = updatedReservation; // Extrai o ID
  const response = await api.put(`/reservations/${id}`, data);
  return response.data;
};

// Excluir reserva
export const deleteReservation = async (id) => {
  try {
    const response = await api.delete(`/reservations/${id}`);
    return response.data; // Retorna os dados ou mensagem de sucesso
  } catch (error) {
    console.error('Erro ao excluir reserva:', error);
    throw error; // Lança o erro para que o chamador possa tratá-lo
  }
};

// Handle Delete Reservation
export const handleDeleteReservation = async (reservationId) => {
  try {
    await deleteReservation(reservationId); // Chama a API para excluir reserva
    toast.success('Reserva cancelada com sucesso!');
    fetchReservations(); // Atualiza a lista de reservas
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);

    // Verifica se há uma mensagem de erro específica
    const errorMessage =
      error.response && error.response.data.error
        ? error.response.data.error
        : 'Erro ao cancelar reserva. Tente novamente.';
    toast.error(errorMessage);
  }
};


