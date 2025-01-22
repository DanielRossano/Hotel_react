import React, { useEffect, useState } from "react";
import "../styles/ReservationsPage.css";

const AddReservationModal = ({
  selectedRoom,
  selectedDate,
  onClose,
  onSubmit,
  guests = [],
}) => {
  const [newReservation, setNewReservation] = useState({
    room_id: selectedRoom?.id || "",
    guest_id: "",
    start_date: selectedDate || "",
    end_date: "",
    daily_rate: "",
    total_amount: "",
  });
  

  useEffect(() => {
    // Atualiza o estado inicial do modal
    setNewReservation((prev) => ({
      ...prev,
      room_id: selectedRoom?.id || "",
      start_date: selectedDate || "",
    }));
  }, [selectedRoom, selectedDate]);

  // Calcula o valor total da reserva
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newReservation);
  };


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
              {/* Campo Hóspede */}
              <div className="mb-3">
                <label htmlFor="guest_id" className="form-label">
                  Hóspede
                </label>
                <select
                  id="guest_id"
                  name="guest_id"
                  className="form-select"
                  value={newReservation.guest_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>
                    Selecione um hóspede
                  </option>
                  {guests.map((guest) => (
                    <option key={guest.id} value={guest.id}>
                      {guest.name}
                    </option>
                  ))}
                </select>
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
                <label htmlFor="start_date" className="form-label">
                  Data de Início
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  className="form-control"
                  value={newReservation.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Data de Fim */}
              <div className="mb-3">
                <label htmlFor="end_date" className="form-label">
                  Data de Fim
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  className="form-control"
                  value={newReservation.end_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Valor da Diária */}
              <div className="mb-3">
                <label htmlFor="daily_rate" className="form-label">
                  Valor da Diária (R$)
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
