import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { toast } from 'react-toastify';
import api from './api';

const resetBodyState = () => {
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
};

// Função para adicionar um novo hóspede
export const handleAddGuest = async (newGuest, setGuests, setNewGuest, fetchGuests) => {
  try {
    const response = await api.post('/guests', newGuest);
    toast.success('Hóspede cadastrado com sucesso!');

    fetchGuests();

    const modalElement = document.getElementById('addGuestModal');
    if (modalElement) {
      const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
      if (modalBootstrap) {
        modalBootstrap.hide();
        resetBodyState();
      }
    }
    const backdropElement = document.querySelector('.modal-backdrop');
    if (backdropElement) {
      backdropElement.remove();
    }

    setNewGuest({
      name: '',
      cpf_cnpj: '',
      type: newGuest.type === 0 ? 'fisica' : 'juridica', 
      estado: '',
      cidade: '',
      bairro: '',
      rua: '',
      numero: '',
      cep: '',
      nome_fantasia: '',
    });
  } catch (error) {
    console.error('Erro ao cadastrar hóspede:', error);
    toast.error('Erro ao cadastrar hóspede. Tente novamente.');
  }
};

// Função para atualizar um hóspede
export const handleUpdateGuest = async (editGuest, fetchGuests, setEditGuest) => {
  try {
    await api.put(`/guests/${editGuest.id}`, editGuest);
    toast.success('Hóspede atualizado com sucesso!');
    fetchGuests();

    const modalElement = document.getElementById('editGuestModal');
    if (modalElement) {
      const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
      modalBootstrap.hide();
    }

    setEditGuest(null);
  } catch (error) {
    console.error('Erro ao atualizar hóspede:', error);
    toast.error('Erro ao atualizar hóspede. Tente novamente.');
  }
};

// Função para aplicar o filtro de pesquisa
export const handleApplyFilter = (query, fetchGuestsFn) => {
  fetchGuestsFn(query);
};

