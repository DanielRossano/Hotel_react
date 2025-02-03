import api from './api';
import moment from 'moment';
import { toast } from 'react-toastify';

// Carregar quartos e reservas
export const loadRoomsAndReservations = async () => {
  try {
    const roomsResponse = await api.get('/rooms');
    const reservationsResponse = await api.get('/reservations');
    const result = {
      rooms: roomsResponse.data,
      reservations: reservationsResponse.data,
    };
    return result;
  } catch (error) {
    toast.error('Erro ao carregar quartos e reservas.');
    throw error; 
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
    toast.error('Erro ao carregar reservas.');
    throw error;
  }
};

// Criar uma nova reserva
export const createReservation = async (newReservation) => {
  try {
    const response = await api.post('/reservations', newReservation);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lida com a criação de uma nova reserva
export const handleAddReservation = async (newReservation, updateReservations, setModalError) => {
  try {
    const createdReservation = await createReservation(newReservation);
    const updatedReservations = await fetchReservations(); 
    updateReservations(updatedReservations); 
    toast.success('Reserva adicionada com sucesso!');
    setModalError(null); 
    return createdReservation; 
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || 'Erro ao adicionar reserva. Tente novamente.';
    toast.error(errorMessage);
    return null;
  }
};
// Atualizar o pagamento de uma reserva
export const updateReservationPayment = async (id, amountPaid) => {
  try {
    const response = await api.put(`/reservations/${id}/payment`, { amount_paid: amountPaid });
    return response.data;
  } catch (error) {
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
    toast.error('Erro ao carregar hóspedes.');
    throw error;
  }
};

// Atualizar reserva
export const updateReservation = async (updatedReservation) => {
  try {
    const { id, ...data } = updatedReservation;
    const response = await api.put(`/reservations/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    throw error;
  }
};

// Lida com a atualização de reserva
export const handleUpdateReservation = async (updatedReservation, reloadReservations, setEditReservation, setModalError) => {
  try {
    if (!validateReservation(updatedReservation)) {
      return;
    }
    await updateReservation(updatedReservation);
    await reloadReservations();
    setEditReservation(null);
    toast.success("Reserva atualizada com sucesso!");
  } catch (error) {
    const errorMessage = error.response?.data?.error || "Erro ao atualizar reserva. Tente novamente.";
    setModalError(errorMessage); 
    toast.error(errorMessage); 
  }
};

// Excluir reserva
export const deleteReservation = async (id) => {
  try {
    await api.delete(`/reservations/${id}`);
    toast.success('Reserva excluída com sucesso!');
  } catch (error) {
  }
};

// Lida com a exclusão de reserva
export const handleDeleteReservation = async (reservationId, reloadReservations, setEditReservation) => {
  try {
    await deleteReservation(reservationId); // Exclui a reserva no backend
    await reloadReservations(); // Atualiza a lista de reservas no estado
    setEditReservation(null); // Fecha o modal, se estiver aberto
    toast.success("Reserva excluída com sucesso!");
  } catch (error) {
  }
};

export const handleInputChange = (e, setNewReservation) => {
  const { name, value } = e.target;
  setNewReservation((prev) => ({ ...prev, [name]: value }));
};

export const handleSelectGuest = (guest, setNewReservation, setSearchTerm, setShowSuggestions) => {
  // Primeiro, atualize os dados da reserva
  setNewReservation((prev) => ({ ...prev, guest_id: guest.id }));

  // Em seguida, atualize o termo de busca com o nome do hóspede selecionado
  setSearchTerm(guest.name);

  // Por fim, feche a lista de sugestões
  setTimeout(() => setShowSuggestions(false), 100); // Adiciona um pequeno atraso para evitar conflito
};

// handleSubmit agora aceita todos os estados necessários como parâmetros
export const handleSubmit = (e, newReservation, useCustomName, customName, onSubmit) => {
  e.preventDefault();

  if (!newReservation.start_date || !newReservation.end_date) {
    toast.error("Por favor, preencha a data e hora de início e fim.");
    return;
  }

  const reservationWithCustomName = {
    ...newReservation,
    custom_name: useCustomName ? customName : null, // Inclui o nome usual, se a flag estiver ativa
  };

  onSubmit(reservationWithCustomName); // Submete a reserva com o nome usual (se presente)
};

// Função para exibir o nome correto
export const getDisplayName = (reservation) => {
  const displayName = reservation.custom_name || reservation.guest_name;
  return displayName;
};

export const calculateTotalAndDays = (reservation) => {
  if (reservation.start_date && reservation.end_date && reservation.daily_rate) {
    const start = new Date(reservation.start_date);
    const end = new Date(reservation.end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const total = days * parseFloat(reservation.daily_rate);
    return { total: total.toFixed(2), days };
  }
  return { total: "0.00", days: 0 };
};

export const validateReservation = (reservation) => {
  if (!reservation.room_id) {
    toast.error("Por favor, selecione um quarto.");
    return false;
  }
  if (!reservation.start_date || !reservation.end_date) {
    toast.error("Por favor, preencha as datas de início e fim.");
    return false;
  }
  if (moment(reservation.start_date).isAfter(moment(reservation.end_date))) {
    toast.error("A data de início deve ser anterior à data de fim.");
    return false;
  }
  return true;
};