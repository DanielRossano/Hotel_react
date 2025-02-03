import React, { useState, useEffect } from 'react';
import EditGuestModal from '../components/EditGuestModal';
import AddGuestModal from '../components/AddGuestModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/container.css';
import '../styles/guests-page.css';
import api from '../services/api';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

const GuestsPage = () => {
  const [modalError, setModalError] = useState(null);
  const [editGuest, setEditGuest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState('');
  const [newGuest, setNewGuest] = useState({
    name: '',
    telefone: '',
    cpf_cnpj: '',
    type: 'fisica',
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

  const fetchGuests = async (query = '') => {
    try {
      setIsLoading(true);
      const response = await api.get(`/guests?search=${query}`);
      setGuests(response.data);
    } catch (error) {
      toast.error('Erro ao buscar hóspedes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGuest = async (id) => {
    try {
      await api.delete(`/guests/${id}`);
      toast.success('Hóspede excluído com sucesso!');
      fetchGuests();
    } catch (error) {
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
      fetchGuests();
      setEditGuest(null);

      const modalElement = document.getElementById('editGuestModal');
      if (modalElement) {
        const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalBootstrap.hide();
      }
    } catch (error) {
      toast.error('Erro ao atualizar hóspede. Tente novamente.');
    }
  };

  const openEditModal = (guest) => {
    setEditGuest({
      ...guest,
      type: String(guest.type),
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

  useEffect(() => {
    fetchGuests();
  }, []);

  return (
    <div className="container">
      <h1 className="text-center my-4">Lista de Hóspedes</h1>
      <ToastContainer />
      <section className="filters d-flex justify-content-between align-items-center mb-4">
        <div className="search-container d-flex align-items-center me-3 flex-grow-1">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Buscar por Nome ou CPF/CNPJ"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchGuests(search);
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
      <section className="guests-list">
        <ul className="list-group">
          {guests.map((guest) => (
            <li key={guest.id} className="list-group-item mb-2">
              <div>
                <strong>{guest.name}</strong>
              </div>
              <div>
                <span className="fw-bold">
                  {guest.type === "1" ? "CNPJ:" : "CPF:"}
                </span>{" "}
                {guest.cpf_cnpj || "Não informado"}
              </div>
              <div>
                <span className="fw-bold">Endereço:</span>{" "}
                {guest.cidade
                  ? `${guest.estado || "Estado não informado"}, ${guest.cidade || "Cidade não informada"}, ${guest.bairro || "Bairro não informado"}, ${guest.rua || "Rua não informada"}, ${guest.numero || "Número não informado"}, ${guest.cep || "CEP não informado"}`
                  : "Endereço não informado"}
              </div>
              <div className="mt-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => openEditModal(guest)}
                >
                  Editar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <AddGuestModal
        newGuest={newGuest}
        setNewGuest={setNewGuest}
        setGuests={setGuests}
        fetchGuests={fetchGuests}
        setModalError={setModalError}
      />
      <EditGuestModal
        editGuest={editGuest}
        setEditGuest={setEditGuest}
        handleUpdateGuest={handleUpdateGuest}
        handleDeleteGuest={handleDeleteGuest}
        modalError={modalError}
      />
    </div>
  );
};

export default GuestsPage;