import api from './api';

// Buscar todos os quartos
export const fetchRooms = async () => {
  const response = await api.get('/rooms');
  return response.data;
};

// Criar um novo quarto
export const createRoom = async (roomData) => {
  const response = await api.post('/rooms', roomData);
  return response.data;
};
