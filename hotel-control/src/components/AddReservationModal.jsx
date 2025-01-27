import React, { useState, useEffect } from "react";
import api from "../services/api";
import AsyncSelect from "react-select/async";
import "../styles/ReservationsPage.css";
import { handleInputChange, calculateTotalAndDays } from "../services/reservationsFunctions";

const AddReservationModal = ({ selectedRoom, selectedDate, onClose, onSubmit }) => {
  const [useCustomName, setUseCustomName] = useState(false);
  const [customName, setCustomName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newReservation, setNewReservation] = useState({
    room_id: selectedRoom?.id || "",
    guest_id: "",
    start_date: selectedDate ? `${selectedDate}T13:00` : "",
    end_date: selectedDate
      ? `${new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 1))
          .toISOString()
          .split("T")[0]}T12:00`
      : "",
    daily_rate: selectedRoom?.preco || "",
    total_amount: "",
    checkin_time: "13:00",
    checkout_time: "12:00",
  });

  useEffect(() => {
    const fetchGuests = async () => {
      if (searchTerm.trim()) {
        try {
          const response = await api.get(`/guests?search=${searchTerm}`);
          setFilteredGuests(response.data);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Erro ao buscar hóspedes:", error);
        }
      } else {
        setFilteredGuests([]);
        setShowSuggestions(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchGuests();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    setNewReservation((prev) => ({
      ...prev,
      room_id: selectedRoom?.id || "",
      start_date: selectedDate ? `${selectedDate}T13:00` : "",
      end_date: selectedDate
        ? `${new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 1))
            .toISOString()
            .split("T")[0]}T12:00`
        : "",
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

  const { total, days } = calculateTotalAndDays(newReservation);

  if (!selectedRoom || !selectedDate) return null;

  return (
    <div className="modal fade show" tabIndex="-1" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Cadastrar Reserva</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
          <form
  onSubmit={(e) => {
    e.preventDefault();
    if (typeof onSubmit === "function") {
      onSubmit({
        ...newReservation,
        custom_name: useCustomName ? customName : null, // Inclui o customName no envio
      });
    } else {
      console.error("Função onSubmit não definida ou inválida!");
    }
  }}
>
              <div className="mb-3">
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
                <div className="d-flex align-items-center">
                  <AsyncSelect
                    defaultOptions
                    cacheOptions={false}
                    value={filteredGuests.find((guest) => guest.value === newReservation.guest_id) || null}
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      try {
                        const response = await api.get(`/guests`);
                        const normalizedInput = inputValue
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "");
                        const options = response.data
                          .filter((guest) =>
                            guest.name
                              .toLowerCase()
                              .normalize("NFD")
                              .replace(/[\u0300-\u036f]/g, "")
                              .includes(normalizedInput)
                          )
                          .map((guest) => ({
                            value: guest.id,
                            label: guest.name,
                          }));
                        setFilteredGuests(options);
                        return options;
                      } catch (error) {
                        console.error("Erro ao buscar hóspedes:", error);
                        return [];
                      }
                    }}
                    onChange={(selectedOption) => {
                      if (selectedOption) {
                        setNewReservation((prev) => ({
                          ...prev,
                          guest_id: selectedOption.value,
                        }));
                      }
                    }}
                    placeholder="Digite o nome do hóspede..."
                    noOptionsMessage={() => "Nenhum hóspede encontrado"}
                    className="flex-grow-1 me-2"
                  />
                  <button
                    type="button"
                    className="btn btn-limpar"
                    onClick={() => {
                      setNewReservation((prev) => ({ ...prev, guest_id: "" }));
                      setFilteredGuests([]);
                    }}
                  >
                    Limpar
                  </button>
                </div>
              </div>
              <hr />
              <div className="form-check">
                <input
                  type="checkbox"
                  id="useCustomName"
                  className="check-input"
                  checked={useCustomName}
                  onChange={() => setUseCustomName((prev) => !prev)}
                />
                <label htmlFor="useCustomName" className="small-checkbox"></label>
                <label htmlFor="useCustomName" className="form-check-label">
                  Adicionar nome usual?
                </label>
              </div>
              {useCustomName && (
                <div className="mb-3">
                  <label htmlFor="customName" className="form-label">
                    Nome usual:
                  </label>
                  <input
                    type="text"
                    id="customName"
                    className="form-control"
                    placeholder="Digite o nome usual"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                  <hr />
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="room_id" className="form-label">
                  Quarto
                </label>
                <input
                  type="number"
                  id="room_id"
                  name="room_id"
                  className="form-control"
                  value={newReservation.room_id}
                  onChange={(e) => handleInputChange(e, setNewReservation)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="startDate" className="form-label">
                  Data de Início: 
                  <span className="mb-2 text-muted">(Check-in)</span>
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
                      start_date: `${e.target.value}T${newReservation.checkin_time || "13:00"}`,
                    })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="time"
                  id="checkinTime"
                  name="checkinTime"
                  className="form-control"
                  value={newReservation.checkin_time}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      checkin_time: e.target.value,
                      start_date: `${newReservation.start_date.split("T")[0]}T${e.target.value}`,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label htmlFor="endDate" className="form-label">
                  Data de Fim:
                  <span className="mb-2 text-muted">(Check-out)</span>
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
                      end_date: `${e.target.value}T${newReservation.checkout_time || "12:00"}`,
                    })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="time"
                  id="checkoutTime"
                  name="checkoutTime"
                  className="form-control"
                  value={newReservation.checkout_time}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      checkout_time: e.target.value,
                      end_date: `${newReservation.end_date.split("T")[0]}T${e.target.value}`,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label>Qtd. Diárias:</label>
                <input
                  type="text"
                  id="totalDays"
                  className="form-control"
                  value={`${days}`}
                  readOnly
                />
              </div>
              <div className="mb-3">
                <label htmlFor="daily_rate" className="form-label">
                  Valor da Diária (R$)
                  <span className="ms-2 text-muted">(Padrão: R$ {selectedRoom?.preco?.toFixed(2) || "0.00"})</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="daily_rate"
                  name="daily_rate"
                  className="form-control"
                  value={newReservation.daily_rate}
                  onChange={(e) => handleInputChange(e, setNewReservation)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="total_amount" className="form-label">
                  Valor Total (R$)
                </label>
                <input
                  type="number"
                  id="total_amount"
                  name="total_amount"
                  className="form-control"
                  value={newReservation.total_amount}
                  onChange={(e) => handleInputChange(e, setNewReservation)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
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
