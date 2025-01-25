import React, { useEffect } from "react";
import moment from "moment";
import "../styles/ReservationsPage.css";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

const EditReservationModal = ({
  editReservation,
  onClose,
  setEditReservation,
  handleUpdateReservation,
  handleDeleteReservation,
  guests = [],
  rooms = [],
}) => {
  useEffect(() => {
    if (!editReservation) return;

    const modalElement = document.getElementById("editReservationModal");

    if (modalElement) {
      const bootstrapModal = new bootstrap.Modal(modalElement, {
        backdrop: "static", // Impede o fechamento ao clicar fora
        keyboard: false, // Impede o fechamento ao pressionar "Esc"
      });
      bootstrapModal.show();
    }
  }, [editReservation]);

  const handleClose = () => {
    const modalElement = document.getElementById("editReservationModal");
    if (modalElement) {
      const bootstrapModal = bootstrap.Modal.getInstance(modalElement); // Obtém a instância ativa do modal
      if (bootstrapModal) {
        bootstrapModal.hide(); // Fecha o modal corretamente
      }
    }
    setEditReservation(null); // Reseta o estado de edição
    if (onClose) {
      onClose(); // Chama o handler passado como prop
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditReservation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdateReservation(editReservation);
    handleClose(); // Fecha o modal após salvar
  };

  if (!editReservation) return null;

  return (
    <div
      className="modal fade show"
      id="editReservationModal"
      tabIndex="-1"
      style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Editar Reserva</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose} // Fecha o modal ao clicar no botão de fechar
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* Campo de Hóspede */}
              <div className="mb-3">
                <label htmlFor="guestSelect" className="form-label">
                  Hóspede
                </label>
                <select
                  id="guestSelect"
                  name="guest_id"
                  className="form-select"
                  value={editReservation.guest_id || ""}
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
                <label htmlFor="roomSelect" className="form-label">
                  Quarto
                </label>
                <select
                  id="roomSelect"
                  name="room_id"
                  className="form-select"
                  value={editReservation.room_id || ""}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>
                    Selecione um quarto
                  </option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data de Início */}
              <div className="mb-3">
                <label htmlFor="startDate" className="form-label">
                  Data de Início: (Check-in)
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="start_date"
                  className="form-control"
                  value={moment(editReservation.start_date).format("YYYY-MM-DD") || ""}
                  onChange={(e) =>
                    setEditReservation({
                      ...editReservation,
                      start_date: `${e.target.value}T${moment(editReservation.start_date).format(
                        "HH:mm"
                      ) || "13:00"}`,
                    })
                  }
                  required
                />
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  className="form-control mt-2"
                  value={moment(editReservation.start_date).format("HH:mm") || "13:00"}
                  onChange={(e) =>
                    setEditReservation({
                      ...editReservation,
                      start_date: `${moment(editReservation.start_date).format(
                        "YYYY-MM-DD"
                      )}T${e.target.value}`,
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
                  name="end_date"
                  className="form-control"
                  value={moment(editReservation.end_date).format("YYYY-MM-DD") || ""}
                  onChange={(e) =>
                    setEditReservation({
                      ...editReservation,
                      end_date: `${e.target.value}T${moment(editReservation.end_date).format(
                        "HH:mm"
                      ) || "12:00"}`,
                    })
                  }
                  required
                />
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  className="form-control mt-2"
                  value={moment(editReservation.end_date).format("HH:mm") || "12:00"}
                  onChange={(e) =>
                    setEditReservation({
                      ...editReservation,
                      end_date: `${moment(editReservation.end_date).format(
                        "YYYY-MM-DD"
                      )}T${e.target.value}`,
                    })
                  }
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    handleDeleteReservation(editReservation.id);
                    handleClose();
                  }}
                >
                  Excluir Reserva
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditReservationModal;
