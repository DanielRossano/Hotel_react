import api from './api';
import moment from 'moment';
import { toast } from 'react-toastify';

// Função para formatação de datas
const formatDate = (date, format = 'YYYY-MM-DD') => moment(date).format(format);

// Carregar quartos e reservas
export const loadRoomsAndReservations = async () => {
  try {
    const roomsResponse = await api.get('/rooms');
    const reservationsResponse = await api.get('/reservations');
    return {
      rooms: roomsResponse.data,
      reservations: reservationsResponse.data,
    };
  } catch (error) {
    console.error('Erro ao carregar quartos e reservas:', error);
    toast.error('Erro ao carregar quartos e reservas.');
    throw error; // Lança o erro para o chamador tratar, se necessário
  }
};

// Gerar intervalo de datas
export const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = moment(startDate);
  while (currentDate <= moment(endDate)) {
    dates.push(currentDate.format('YYYY-MM-DD'));
    currentDate.add(1, 'day');
  }
  return dates;
};

// Listar todas as reservas
export const fetchReservations = async () => {
  try {
    const response = await api.get('/reservations');
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar reservas:', error);
    toast.error('Erro ao carregar reservas.');
    throw error;
  }
};

// Criar uma nova reserva
export const createReservation = async (newReservation) => {
  try {
    const response = await api.post('/reservations', newReservation);
    toast.success('Reserva cadastrada com sucesso!');
    return response.data;
  } catch (error) {
    console.error('Erro ao cadastrar reserva:', error);
    const errorMessage =
      error.response?.data?.error || 'Erro ao cadastrar reserva. Tente novamente.';
    toast.error(errorMessage);
    throw error;
  }
};

// Handle Add Reservation
export const handleAddReservation = async (newReservation, updateReservations) => {
  try {
    const createdReservation = await createReservation(newReservation);
    const updatedReservations = await fetchReservations(); // Atualiza a lista
    updateReservations(updatedReservations); // Atualiza o estado no componente pai
    return createdReservation; // Retorna a nova reserva criada
  } catch (error) {
    console.error('Erro ao adicionar reserva:', error);
    throw error;
  }
};

// Atualizar o pagamento de uma reserva
export const updateReservationPayment = async (id, amountPaid) => {
  try {
    const response = await api.put(`/reservations/${id}/payment`, { amount_paid: amountPaid });
    toast.success('Pagamento atualizado com sucesso!');
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    toast.error('Erro ao atualizar pagamento. Tente novamente.');
    throw error;
  }
};

// Buscar hóspedes
export const fetchGuests = async () => {
  try {
    const response = await api.get('/guests');
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar hóspedes:', error);
    toast.error('Erro ao carregar hóspedes.');
    throw error;
  }
};

// Atualizar reserva
export const updateReservation = async (updatedReservation) => {
  const { id, ...data } = updatedReservation;
  try {
    const response = await api.put(`/reservations/${id}`, data);
    toast.success('Reserva atualizada com sucesso!');
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    toast.error('Erro ao atualizar reserva. Tente novamente.');
    throw error;
  }
};

// Excluir reserva
export const deleteReservation = async (id) => {
  try {
    const response = await api.delete(`/reservations/${id}`);
    toast.success('Reserva cancelada com sucesso!');
    return response.data;
  } catch (error) {
    console.error('Erro ao excluir reserva:', error);
    const errorMessage =
      error.response?.data?.error || 'Erro ao excluir reserva. Tente novamente.';
    toast.error(errorMessage);
    throw error;
  }
};

// Handle Delete Reservation
export const handleDeleteReservation = async (reservationId, updateReservations) => {
  try {
    await deleteReservation(reservationId);
    const updatedReservations = await fetchReservations(); // Atualiza a lista
    updateReservations(updatedReservations); // Atualiza o estado no componente pai
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    throw error;
  }
};
