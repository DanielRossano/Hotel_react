import React, { useEffect, useState } from "react";
import moment from "moment";
import Swal from "sweetalert2";

const ViewReservationModal = ({
  reservation,
  guests = [],
  rooms = [],
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [editableReservation, setEditableReservation] = useState(null);

  // Atualiza o estado local quando a reserva muda
  useEffect(() => {
    if (reservation) {
      setEditableReservation({
        ...reservation,
        start_date: moment(reservation.start_date).format("YYYY-MM-DD"),
        end_date: moment(reservation.end_date).format("YYYY-MM-DD"),
      });
    }
  }, [reservation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableReservation((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    onUpdate(editableReservation);
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Tem certeza?",
      text: "Esta ação não poderá ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(editableReservation.id);
        onClose();
      }
    });
  };

  if (!editableReservation) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      tabIndex="-1"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalhes da Reserva</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleUpdate}>
              {/* Selecionar Hóspede */}
              <div className="mb-3">
                <label htmlFor="guest_id" className="form-label">
                  Hóspede
                </label>
                <select
                  id="guest_id"
                  name="guest_id"
                  className="form-select"
                  value={editableReservation.guest_id || ""}
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

              {/* Selecionar Quarto */}
              <div className="mb-3">
                <label htmlFor="room_id" className="form-label">
                  Quarto
                </label>
                <select
                  id="room_id"
                  name="room_id"
                  className="form-select"
                  value={editableReservation.room_id || ""}
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
                <label htmlFor="start_date" className="form-label">
                  Data de Início
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  className="form-control"
                  value={editableReservation.start_date || ""}
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
                  value={editableReservation.end_date || ""}
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
                  value={editableReservation.daily_rate || ""}
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
                  value={editableReservation.total_amount || ""}
                  readOnly
                />
              </div>

              <div className="modal-footer d-flex justify-content-between">
                {/* Botão para Excluir */}
                <button
  type="button"
  className="btn btn-danger"
  onClick={() => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, cancelar',
      cancelButtonText: 'Não, manter',
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(reservation.id);
      }
    });
  }}
>
  Cancelar Reserva
</button>

                {/* Botões de Cancelar e Salvar */}
                <div>
                  <button type="submit" className="btn btn-primary">
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewReservationModal;
