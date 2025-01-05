import api from './api';

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

// Atualizar o pagamento de uma reserva
export const updateReservationPayment = async (id, amountPaid) => {
  const response = await api.put(`/reservations/${id}/payment`, { amount_paid: amountPaid });
  return response.data;
};
