import React, { useState, useEffect } from "react";
import "../styles/ReservationsPage.css";

const AddReservationModal = ({
  selectedRoom,
  selectedDate,
  onClose,
  onSubmit,
  guests = [],
}) => {
  const [searchTerm, setSearchTerm] = useState(""); // Termo de busca
  const [filteredGuests, setFilteredGuests] = useState([]); // Hóspedes filtrados
  const [showSuggestions, setShowSuggestions] = useState(false); // Controla a exibição das sugestões
  const [newReservation, setNewReservation] = useState({
    room_id: selectedRoom?.id || "",
    guest_id: "",
    start_date: selectedDate ? `${selectedDate}T13:00` : "", // Check-in padrão às 13h
    end_date: selectedDate ? `${selectedDate}T12:00` : "", // Check-out padrão às 12h
    daily_rate: selectedRoom?.preco || "", // Valor padrão do quarto
    total_amount: "",
  });

  // Normaliza strings, removendo caracteres especiais e acentos
  const normalizeString = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "");

  // Atualiza a lista de hóspedes conforme o termo de busca
  useEffect(() => {
    if (searchTerm) {
      const normalizedSearch = normalizeString(searchTerm);
      const filtered = guests.filter((guest) =>
        normalizeString(guest.name).includes(normalizedSearch)
      );
      setFilteredGuests(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredGuests([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, guests]);

  useEffect(() => {
    setNewReservation((prev) => ({
      ...prev,
      room_id: selectedRoom?.id || "",
      start_date: selectedDate ? `${selectedDate}T13:00` : "",
      end_date: selectedDate ? `${selectedDate}T12:00` : "",
      daily_rate: selectedRoom?.preco || "",
    }));
  }, [selectedRoom, selectedDate]);

  useEffect(() => {
    const { daily_rate, start_date, end_date } = newReservation;
    if (daily_rate && start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const total = days > 0 ? days * parseFloat(daily_rate) : 0;
      setNewReservation((prev) => ({ ...prev, total_amount: total.toFixed(2) }));
    }
  }, [newReservation.daily_rate, newReservation.start_date, newReservation.end_date]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReservation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectGuest = (guest) => {
    setNewReservation((prev) => ({ ...prev, guest_id: guest.id }));
    setSearchTerm(guest.name);
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newReservation.start_date || !newReservation.end_date) {
      alert("Por favor, preencha a data e hora de início e fim.");
      return;
    }
    onSubmit(newReservation); // Submete a nova reserva
  };
  
  // Hook que ajusta o horário de fim, caso seja anterior ao horário de início
  useEffect(() => {
    const { start_date, end_date } = newReservation;
  
    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
  
      if (end <= start) {
        setNewReservation((prev) => ({
          ...prev,
          end_date: `${start_date.split("T")[0]}T12:00`, // Define um horário padrão
        }));
      }
    }
  }, [newReservation.start_date, newReservation.end_date]);
  
  if (!selectedRoom || !selectedDate) return null;
  
  return (
    <div
      className="modal fade show"
      tabIndex="-1"
      style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Cadastrar Reserva</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* Campo de Busca com Sugestões */}
              <div className="mb-3 position-relative">
                <label htmlFor="searchGuest" className="form-label d-flex align-items-center">
                  Buscar Hóspede
                  <a
                    href="/guests"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ms-2 text-primary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Cadastrar
                  </a>
                </label>
                <input
                  type="text"
                  id="searchGuest"
                  className="form-control"
                  placeholder="Digite o nome do hóspede"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && filteredGuests.length > 0 && (
                  <ul className="list-group position-absolute w-100">
                    {filteredGuests.map((guest) => (
                      <li
                        key={guest.id}
                        className="list-group-item list-group-item-action"
                        onClick={() => handleSelectGuest(guest)}
                        style={{ cursor: "pointer" }}
                      >
                        {guest.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Campo Quarto */}
              <div className="mb-3">
                <label htmlFor="room_id" className="form-label">
                  Quarto
                </label>
                <input
                  type="text"
                  id="room_id"
                  name="room_id"
                  className="form-control"
                  value={newReservation.room_id}
                  readOnly
                />
              </div>

              {/* Data de Início */}
              <div className="mb-3">
                <label htmlFor="startDate" className="form-label">
                  Data de Início: (Check-in)
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="form-control"
                  value={newReservation.start_date.split("T")[0] || ""}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      start_date: `${e.target.value}T${newReservation.start_date.split("T")[1] || "13:00"}`,
                    })
                  }
                  required
                />
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  className="form-control mt-2"
                  value={newReservation.start_date.split("T")[1] || "13:00"}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      start_date: `${newReservation.start_date.split("T")[0]}T${e.target.value}`,
                    })
                  }
                  required
                />
              </div>

              {/* Data de Fim */}
              <div className="mb-3">
                <label htmlFor="endDate" className="form-label">
                  Data de Fim: (Check-out)
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="form-control"
                  value={newReservation.end_date.split("T")[0] || ""}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      end_date: `${e.target.value}T${newReservation.end_date.split("T")[1] || "12:00"}`,
                    })
                  }
                  required
                />
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  className="form-control mt-2"
                  value={newReservation.end_date.split("T")[1] || "12:00"}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      end_date: `${newReservation.end_date.split("T")[0]}T${e.target.value}`,
                    })
                  }
                  required
                />
              </div>

              {/* Valor da Diária */}
              <div className="mb-3">
                <label htmlFor="daily_rate" className="form-label">
                  Valor da Diária (R$)
                  <span className="ms-2 text-muted">
                    (Padrão: R$ {selectedRoom?.preco?.toFixed(2) || "0.00"})
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="daily_rate"
                  name="daily_rate"
                  className="form-control"
                  value={newReservation.daily_rate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Valor Total */}
              <div className="mb-3">
                <label htmlFor="total_amount" className="form-label">
                  Valor Total (R$)
                </label>
                <input
                  type="text"
                  id="total_amount"
                  name="total_amount"
                  className="form-control"
                  value={newReservation.total_amount}
                  readOnly
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReservationModal;
