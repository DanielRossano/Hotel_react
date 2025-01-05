import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { toast } from 'react-toastify';
import api from './api'; // Certifique-se de que o caminho para o arquivo da API está correto

const resetBodyState = () => {
    document.body.classList.remove('modal-open'); // Remove a classe que bloqueia o scroll
    document.body.style.overflow = ''; // Remove o overflow hidden
    document.body.style.paddingRight = ''; // Remove o padding
  };

// Função para adicionar um novo hóspede
export const handleAddGuest = async (newGuest, setGuests, setNewGuest, fetchGuests) => {
    try {
      const response = await api.post('/guests', newGuest);
      toast.success('Hóspede cadastrado com sucesso!');
      
      // Atualiza a lista de hóspedes
      fetchGuests();
  
      // Fechar o modal
      const modalElement = document.getElementById('addGuestModal');
      if (modalElement) {
        const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
        if (modalBootstrap) {
          modalBootstrap.hide();
          resetBodyState(); // Corrige o estado do body após o fechamento
        }
      }
      const backdropElement = document.querySelector('.modal-backdrop');
      if (backdropElement) {
        backdropElement.remove();
      }
      // Resetar o formulário
      setNewGuest({
        name: '',
        cpf_cnpj: '',
        type: 'fisica',
        address: { cidade: '', bairro: '', rua: '', numero: '', cep: '' },
        nome_fantasia: '',
      });
    } catch (error) {
      console.error('Erro ao cadastrar hóspede:', error);
      toast.error('Erro ao cadastrar hóspede. Tente novamente.');
    }
  };
  
// Função para excluir um hóspede
export const handleDeleteGuest = async (id, setGuests, guests) => {
    try {
      await api.delete(`/guests/${id}`);
      setGuests(guests.filter((guest) => guest.id !== id));
      toast.success('Hóspede excluído com sucesso!');
  
      // Fechar o modal
      const modalElement = document.getElementById('editGuestModal');
      if (modalElement) {
        const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalBootstrap.hide(); // Apenas fecha o modal, sem destruir a instância
      }
    } catch (error) {
      console.error('Erro ao excluir hóspede:', error);
  
      if (error.response && error.response.data.error.includes('foreign key constraint')) {
        toast.error('Não é possível excluir o hóspede porque ele possui reservas associadas.');
      } else {
        toast.error('Erro ao excluir hóspede. Tente novamente.');
      }
    }
  };
  
// Função para atualizar um hóspede
export const handleUpdateGuest = async (editGuest, fetchGuests, setEditGuest) => {
    try {
      await api.put(`/guests/${editGuest.id}`, editGuest);
      toast.success('Hóspede atualizado com sucesso!');
      fetchGuests();
  
      // Fechar o modal
      const modalElement = document.getElementById('editGuestModal');
      if (modalElement) {
        const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalBootstrap.hide(); // Apenas fecha o modal, sem destruir a instância
      }
  
      setEditGuest(null);
    } catch (error) {
      console.error('Erro ao atualizar hóspede:', error);
      toast.error('Erro ao atualizar hóspede. Tente novamente.');
    }
  };
  
// Função para buscar hóspedes
export const fetchGuests = async (query, setGuests, setIsLoading) => {
    try {
      const response = await api.get(`/guests?search=${query}`);
      setGuests(response.data);
      setIsLoading(false); // Carregamento concluído
    } catch (error) {
      console.error('Erro ao buscar hóspedes:', error);
      setIsLoading(false); // Evitar que fique preso em estado de carregamento
      toast.error('Erro ao buscar hóspedes. Tente novamente.');
    }
  };
  
  // Função para aplicar o filtro de pesquisa
  export const handleApplyFilter = (query, fetchGuestsFn) => {
    fetchGuestsFn(query);
  };
  
  // Função para abrir o modal de edição
  const formatAddress = (address) => {
    if (typeof address === "string") {
      try {
        return JSON.parse(address);
      } catch (error) {
        console.error("Erro ao analisar o endereço:", error);
        return {};
      }
    }
    return address || {};
  };
  
  export const openEditModal = (guest, setEditGuest) => {
    setEditGuest({
      ...guest,
      address: formatAddress(guest.address),
    });
  
    // Exibir o modal
    setTimeout(() => {
      const modalElement = document.getElementById("editGuestModal");
      if (modalElement) {
        const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalBootstrap.show();
      }
    }, 0);
  };
  