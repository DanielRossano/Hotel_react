import React, { useState, useEffect } from 'react';
import EditGuestModal from '../components/EditGuestModal'; // Importação do modal separado
import AddGuestModal from '../components/AddGuestModal'; // Importação do modal separado
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/guests-page.css';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {
  handleAddGuest,
  handleDeleteGuest,
  handleUpdateGuest,
  fetchGuests,
  handleApplyFilter,
  openEditModal,
} from '../services/guestFunctions';



const GuestsPage = () => {
  const [editGuest, setEditGuest] = useState(null); // Estado para o hóspede sendo editado
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento
  const [guests, setGuests] = useState([]); // Estado para a lista de hóspedes
  const [search, setSearch] = useState(''); // Filtro de pesquisa
  const [newGuest, setNewGuest] = useState({
    name: '',
    cpf_cnpj: '',
    type: 'fisica',
    address: {
      cidade: '',
      bairro: '',
      rua: '',
      numero: '',
      cep: '',
    },
    nome_fantasia: '',
  });

  // Função para buscar os hóspedes no carregamento inicial
  useEffect(() => {
    fetchGuests('', setGuests, setIsLoading);
  }, []);

  return (
    <div className="guests-page container">
      <h1 className="text-center my-4">Lista de Hóspedes</h1>

      <ToastContainer />

      {/* Filtros */}
      <section className="filters d-flex justify-content-start align-items-center mb-4">
        <input
          type="text"
          className="form-control form-control-sm me-2"
          placeholder="Buscar por Nome ou CPF/CNPJ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button
            className="btn btn-primary"
            onClick={() => handleApplyFilter(search, (query) => fetchGuests(query, setGuests, setIsLoading))}
          >
            Pesquisar
          </button>
         <button
           className="btn btn-primary"
           onClick={() => {
             const modalElement = document.getElementById("addGuestModal");
             if (modalElement) {
               const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
               modalBootstrap.show(); // Exibe o modal, recriando o backdrop
             }
           }}
         >
           Cadastrar
         </button>
        </div>
      </section>

{/* Lista de Hóspedes */}
<section className="guests-list">
  <ul className="list-group">
    {guests.map((guest) => {
      let address = {};

      // Verifica e processa o endereço (string ou objeto)
      if (typeof guest.address === "string") {
        try {
          address = JSON.parse(guest.address);
        } catch (error) {
          console.error("Erro ao analisar o endereço:", error);
        }
      } else {
        address = guest.address || {};
      }

      return (
        <li key={guest.id} className="list-group-item mb-2">
          <strong>{guest.name}</strong> <br />
          CPF/CNPJ: {guest.cpf_cnpj} <br />
          Endereço:{" "}
          {address.cidade
            ? `${address.estado ? `${address.estado}, ` : ""}${address.cidade}, ${address.bairro}, ${address.rua}, ${address.numero}, ${address.cep}`
            : "Não informado"}
          <div className="mt-2">
            <button
              className="btn btn-sm btn-edit"
              onClick={() => openEditModal(guest, setEditGuest)}
            >
              Editar
            </button>
          </div>
        </li>
      );
    })}
  </ul>
</section>

      {/* Modal de Cadastro */}
      <AddGuestModal
  newGuest={newGuest}
  setNewGuest={setNewGuest}
  handleAddGuest={(e) => {
    e.preventDefault();
    handleAddGuest(newGuest, setGuests, setNewGuest, () => fetchGuests('', setGuests, setIsLoading));
  }}
/>
      {/* Modal de Edição */}
      <EditGuestModal
        editGuest={editGuest}
        setEditGuest={setEditGuest}
        handleUpdateGuest={(e) => {
          e.preventDefault();
          handleUpdateGuest(editGuest, () => fetchGuests('', setGuests, setIsLoading), setEditGuest);
        }}
        handleDeleteGuest={(id) => handleDeleteGuest(id, setGuests, guests)}
      />
    </div>
  );
};

export default GuestsPage;

