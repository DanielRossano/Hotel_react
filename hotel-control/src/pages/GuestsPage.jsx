import React, { useState, useEffect } from 'react';
import EditGuestModal from '../components/EditGuestModal';
import AddGuestModal from '../components/AddGuestModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/guests-page.css';
import api from '../services/api';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

const GuestsPage = () => {
  const [modalError, setModalError] = useState(null); // Estado para armazenar erros no modal
  const [editGuest, setEditGuest] = useState(null); // Estado para o hóspede sendo editado
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento
  const [guests, setGuests] = useState([]); // Estado para a lista de hóspedes
  const [search, setSearch] = useState(''); // Filtro de pesquisa
  const [newGuest, setNewGuest] = useState({
    name: '',
    telefone: '',
    cpf_cnpj: '',
    type: 'fisica', // Valor padrão
    address: {
      estado: '',
      cidade: '',
      bairro: '',
      rua: '',
      numero: '',
      cep: '',
    },
    nome_fantasia: '',
  });

  // Passo 1: Definindo a função fetchGuests
  const fetchGuests = async (query = '') => {
    try {
      setIsLoading(true); // Ativa o estado de carregamento
      const response = await api.get(`/guests?search=${query}`); // Faz a chamada para o backend
      setGuests(response.data); // Atualiza a lista de hóspedes
    } catch (error) {
      console.error('Erro ao buscar hóspedes:', error);
      toast.error('Erro ao buscar hóspedes.');
    } finally {
      setIsLoading(false); // Desativa o estado de carregamento
    }
  };

  const handleDeleteGuest = async (id) => {
    try {
      await api.delete(`/guests/${id}`);
      toast.success('Hóspede excluído com sucesso!');

      // Atualiza a lista de hóspedes após a exclusão
      fetchGuests('', setGuests, setIsLoading);
    } catch (error) {
      console.error('Erro ao excluir hóspede:', error);

      if (error.response && error.response.data.error.includes('foreign key constraint')) {
        toast.error('Não é possível excluir o hóspede porque ele possui reservas associadas.');
      } else {
        toast.error('Erro ao excluir hóspede. Tente novamente.');
      }
    }
  };


  const handleUpdateGuest = async (updatedGuest) => {
    try {
      await api.put(`/guests/${updatedGuest.id}`, updatedGuest);
      toast.success('Hóspede atualizado com sucesso!');

      // Atualiza a lista de hóspedes
      fetchGuests('', setGuests, setIsLoading);

      // Reseta o estado do hóspede em edição
      setEditGuest(null);

      // Fecha o modal
      const modalElement = document.getElementById('editGuestModal');
      if (modalElement) {
        const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalBootstrap.hide();
      }
    } catch (error) {
      console.error('Erro ao atualizar hóspede:', error);
      toast.error('Erro ao atualizar hóspede. Tente novamente.');
    }
  };

  const openEditModal = (guest, setEditGuest) => {
    console.log("Dados recebidos do backend para o modal:", guest);
    setEditGuest({
      ...guest,
      type: String(guest.type), // Use 'guest.type' diretamente
      address: {
        estado: guest.estado || "",
        cidade: guest.cidade || "",
        bairro: guest.bairro || "",
        rua: guest.rua || "",
        numero: guest.numero || "",
        cep: guest.cep || "",
      },
    });

    setTimeout(() => {
      const modalElement = document.getElementById("editGuestModal");
      if (modalElement) {
        const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalBootstrap.show();
      }
    }, 0);
  };
  // Carrega os hóspedes ao inicializar
  useEffect(() => {
    fetchGuests();
  }, []);

  return (
    <div className="guests-page container">
      <h1 className="text-center my-4">Lista de Hóspedes</h1>

      <ToastContainer />

      {/* Filtros */}
      <section className="filters d-flex justify-content-between align-items-center mb-4">
        {/* Filtro de busca */}
        <div className="search-container d-flex align-items-center me-3 flex-grow-1">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Buscar por Nome ou CPF/CNPJ"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchGuests(search); // Busca ao pressionar Enter
            }}
          />
          {search && (
            <button
              className="btn btn-sm position-absolute end-0 top-50 translate-middle-y me-2"
              onClick={() => {
                setSearch('');
                fetchGuests();
              }}
            >
              ✖
            </button>
          )}
          <button
            className="btn btn-primary btn-sm ms-2"
            onClick={() => fetchGuests(search)}
          >
            Buscar
          </button>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            const modalElement = document.getElementById('addGuestModal');
            if (modalElement) {
              const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
              modalBootstrap.show();
            }
          }}
        >
          Cadastrar
        </button>
      </section>

      {/* Lista de Hóspedes */}
      <section className="guests-list">
        <ul className="list-group">
          {guests.map((guest) => (
            <li key={guest.id} className="list-group-item mb-2">
              {/* Nome do Hóspede */}
              <div>
                <strong>{guest.name}</strong>
              </div>

              {/* CPF ou CNPJ */}
              <div>
                <span className="fw-bold">
                  {guest.type === "1" ? "CNPJ:" : "CPF:"}
                </span>{" "}
                {guest.cpf_cnpj || "Não informado"}
              </div>

              {/* Endereço */}
              <div>
                <span className="fw-bold">Endereço:</span>{" "}
                {guest.cidade
                  ? `${guest.estado || "Estado não informado"}, ${guest.cidade || "Cidade não informada"}, ${guest.bairro || "Bairro não informado"}, ${guest.rua || "Rua não informada"}, ${guest.numero || "Número não informado"}, ${guest.cep || "CEP não informado"}`
                  : "Endereço não informado"}
              </div>

              {/* Botão de Ação */}
              <div className="mt-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => openEditModal(guest, setEditGuest)}
                >
                  Editar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Passo 2: Passando fetchGuests como prop para AddGuestModal */}
      <AddGuestModal
        newGuest={newGuest}
        setNewGuest={setNewGuest}
        setGuests={setGuests}
        fetchGuests={fetchGuests} // Prop para o modal
        setModalError={modalError}
      />

      {/* Modal de Edição */}
      <EditGuestModal
        editGuest={editGuest}
        setEditGuest={setEditGuest}
        handleUpdateGuest={handleUpdateGuest}
        handleDeleteGuest={(id) => handleDeleteGuest(id, setGuests, guests)}
        modalError={modalError}
      />
    </div>
  );
};

export default GuestsPage;