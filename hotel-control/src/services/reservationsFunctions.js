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
    toast.success('Quartos e reservas carregados com sucesso!');
    return result;
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
  toast.success('Intervalo de datas gerado com sucesso!');
  return dates;
};

// Listar todas as reservas
export const fetchReservations = async () => {
  try {
    const response = await api.get('/reservations');
    toast.success('Reservas carregadas com sucesso!');
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
    toast.success('Reserva adicionada com sucesso!');
    return createdReservation; // Retorna a nova reserva criada
  } catch (error) {
    toast.error('Erro ao adicionar reserva:', error);
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
    toast.success('Hóspedes carregados com sucesso!');
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar hóspedes:', error);
    toast.error('Erro ao carregar hóspedes.');
    throw error;
  }
};

// Atualizar reserva
export const updateReservation = async (updatedReservation) => {
  try {
    const { id, ...data } = updatedReservation;
    const response = await api.put(`/reservations/${id}`, data);
    toast.success('Reserva atualizada com sucesso!');
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    toast.error('Erro ao atualizar reserva.');
    throw error;
  }
};

// Excluir reserva
export const deleteReservation = async (id) => {
  try {
    await api.delete(`/reservations/${id}`);
    toast.success('Reserva excluída com sucesso!');
  } catch (error) {
    console.error('Erro ao excluir reserva:', error);
    const errorMessage = error.response?.data?.error || 'Erro ao excluir reserva.';
    toast.error(errorMessage);
    throw error;
  }
};

// Handle Delete Reservation
export const handleDeleteReservation = async (reservationId, updateReservations) => {
  try {
    await deleteReservation(reservationId);
    const updatedReservations = await fetchReservations(); // Busca a lista atualizada
    if (typeof updateReservations === "function") {
      updateReservations(updatedReservations); // Atualiza o estado no componente pai
    }
    toast.success("Reserva cancelada com sucesso!");
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error);
    throw error;
  }
};


export const handleInputChange = (e, setNewReservation) => {
  const { name, value } = e.target;
  setNewReservation((prev) => ({ ...prev, [name]: value }));
  toast.success('Entrada atualizada com sucesso!');
};

export const handleSelectGuest = (guest, setNewReservation, setSearchTerm, setShowSuggestions) => {
  // Primeiro, atualize os dados da reserva
  setNewReservation((prev) => ({ ...prev, guest_id: guest.id }));

  // Em seguida, atualize o termo de busca com o nome do hóspede selecionado
  setSearchTerm(guest.name);

  // Por fim, feche a lista de sugestões
  setTimeout(() => setShowSuggestions(false), 100); // Adiciona um pequeno atraso para evitar conflito
  toast.success('Hóspede selecionado com sucesso!');
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
  toast.success("Reserva submetida com sucesso!");
};

// Função para exibir o nome correto
export const getDisplayName = (reservation) => {
  const displayName = reservation.custom_name || reservation.guest_name;
  toast.success('Nome exibido com sucesso!');
  return displayName;
};

export const calculateTotalAndDays = (reservation) => {
  if (reservation.start_date && reservation.end_date && reservation.daily_rate) {
    const start = new Date(reservation.start_date);
    const end = new Date(reservation.end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const total = days * parseFloat(reservation.daily_rate);
    toast.success('Total e dias calculados com sucesso!');
    return { total: total.toFixed(2), days };
  }
  toast.success('Total e dias calculados com sucesso!');
  return { total: "0.00", days: 0 };
};

