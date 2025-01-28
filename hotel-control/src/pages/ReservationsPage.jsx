import React, { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/pt-br";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddReservationModal from "../components/AddReservationModal";
import EditReservationModal from "../components/EditReservationModal";
import { loadRoomsAndReservations, fetchGuests, handleUpdateReservation, handleDeleteReservation, handleAddReservation, validateReservation } from "../services/reservationsFunctions";
import "../styles/ReservationsPage.css";
import "../styles/cells.css";
import "../styles/table.css";

const ReservationsPage = () => {
  // **Estados Globais**
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [guests, setGuests] = useState([]);
  const [modalError, setModalError] = useState(null); // Estado para armazenar erros no modal

  // **Estados de Controle**
  const [startDate, setStartDate] = useState(moment().startOf("day")); // Dia atual
  const [endDate, setEndDate] = useState(moment().add(2, "days").endOf("day")); // Dois dias à frente
  const [filterStartDate, setFilterStartDate] = useState(moment().startOf("day")); // Filtro com dia atual
  const [filterEndDate, setFilterEndDate] = useState(moment().add(2, "days").endOf("day")); // Filtro com dois dias à frente
  const [currentPage, setCurrentPage] = useState(1);

  // **Estados de Modais**
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editReservation, setEditReservation] = useState(null);

  // **Carregar Dados Iniciais**
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { rooms, reservations } = await loadRoomsAndReservations();
        setRooms(rooms);
        setReservations(reservations);
        setFilteredReservations(reservations);
      } catch (error) {
        toast.error("Erro ao carregar quartos e reservas.");
      }
    };

    const fetchGuestsData = async () => {
      try {
        const fetchedGuests = await fetchGuests();
        setGuests(fetchedGuests);
      } catch (error) {
        toast.error("Erro ao carregar hóspedes.");
      }
    };

    fetchData();
    fetchGuestsData();
  }, []);

  // **Gerar Intervalo de Datas**
  const generateDaysRange = () => {
    const days = [];
    let day = startDate.clone();
    while (day <= endDate) {
      days.push(day.clone());
      day.add(1, "day");
    }
    return days;
  };

  // **Filtrar Reservas**
  const applyFilter = () => {
    const filtered = reservations.filter((reservation) => {
      const reservationStart = moment(reservation.start_date, "YYYY-MM-DDTHH:mm:ss");
      const reservationEnd = moment(reservation.end_date, "YYYY-MM-DDTHH:mm:ss");

      return (
        reservationStart.isBetween(filterStartDate, filterEndDate, null, "[]") ||
        reservationEnd.isBetween(filterStartDate, filterEndDate, null, "[]") ||
        (reservationStart.isBefore(filterStartDate) && reservationEnd.isAfter(filterEndDate))
      );
    });

    setFilteredReservations(filtered);
    setStartDate(filterStartDate.clone());
    setEndDate(filterEndDate.clone());
  };

  const reloadReservations = async () => {
    try {
      const { reservations } = await loadRoomsAndReservations(); // Recarrega os dados
      setReservations(reservations); // Atualiza o estado global
      setFilteredReservations(reservations); // Atualiza o estado filtrado
    } catch (error) {
      toast.error("Erro ao recarregar reservas.");
    }
  };

  // **Gerar Conteúdo das Células**
  const renderCellContent = (room, day) => {
    const reservationsForDay = filteredReservations.filter(
      (res) =>
        res.room_id === room.id &&
        moment(day).isBetween(res.start_date, res.end_date, "day", "[]")
    );

    const checkInReservations = reservationsForDay.filter((res) =>
      moment(day).isSame(moment(res.start_date), "day")
    );
    const checkOutReservations = reservationsForDay.filter((res) =>
      moment(day).isSame(moment(res.end_date), "day")
    );

    if (checkOutReservations.length > 0) {
      const checkOutReservation = checkOutReservations[0];
      const checkInReservation = checkInReservations[0];

      return (
        <div className="split-cell">
          <div
            className="half reserved"
            onClick={() =>
              handleCellClick(room.id, day.format("YYYY-MM-DD"), checkOutReservation)
            }
            title={`Check-out às ${moment(checkOutReservation.end_date).format(
              "HH:mm"
            )} - ${checkOutReservation.guest_name}`}
          >
            {checkOutReservation.custom_name || checkOutReservation.guest_name}
          </div>
          <div
            className={`half ${checkInReservation ? "reserved" : "available"}`}
            onClick={() =>
              checkInReservation
                ? handleCellClick(room.id, day.format("YYYY-MM-DD"), checkInReservation)
                : handleCellClick(room.id, day.format("YYYY-MM-DD"), null)
            }
            title={
              checkInReservation
                ? `Check-in às ${moment(checkInReservation.start_date).format(
                  "HH:mm"
                )} - ${checkInReservation.guest_name}`
                : "Dia disponível"
            }
          >
            {checkInReservation ? checkInReservation.custom_name || checkInReservation.guest_name : "Livre"}
          </div>
        </div>
      );
    }

    if (reservationsForDay.length > 0) {
      const reservation = reservationsForDay[0];
      const isStartOfReservation = moment(day).isSame(reservation.start_date, "day");
      return (
        <div
          className="reserved"
          onClick={() => handleCellClick(room.id, day.format("YYYY-MM-DD"), reservation)}
          title={`Reserva completa: Check-in às ${moment(reservation.start_date).format(
            "HH:mm"
          )}, Check-out às ${moment(reservation.end_date).format("HH:mm")}`}
          style={{
            gridRow: `span ${moment(reservation.end_date).diff(
              moment(reservation.start_date),
              "days"
            )}`,
          }}
        >
          {reservation.custom_name || reservation.guest_name}
        </div>
      );
    }

    return (
      <div
        className="available"
        onClick={() => handleCellClick(room.id, day.format("YYYY-MM-DD"), null)}
        title="Dia disponível"
      >
        Livre
      </div>
    );
  };

  const handleCellClick = (roomId, date, reservation) => {
    if (reservation) {
      // Abre o modal de edição para a reserva selecionada
      setEditReservation(reservation);
    } else {
      // Ação para nova reserva
      setSelectedRoom(rooms.find((room) => room.id === roomId));
      setSelectedDate(date);
      setShowAddModal(true);
    }
  };


  const daysOfWeek = generateDaysRange();
  const filteredRooms = rooms.filter((room) => room.location === `${currentPage}`);

  return (
    <div className="container reservations-page">
      <ToastContainer />
      {/* Navegação de semana e filtro */}

      <div className='d-flex justify-content-center mb-4'><h3>Listagem de Reserva:</h3></div>

      <div className="d-flex justify-content-center mb-4">
        <label className="mx-2">De:</label>
        <input
          type="date"
          value={filterStartDate.format("YYYY-MM-DD")}
          onChange={(e) => setFilterStartDate(moment(e.target.value))}
        />
        <label className="mx-2">Até:</label>
        <input
          type="date"
          value={filterEndDate.format("YYYY-MM-DD")}
          onChange={(e) => setFilterEndDate(moment(e.target.value))}
        />
        <button className="btn btn-primary mx-3" onClick={applyFilter}>
          Aplicar
        </button>
      </div>
      <div className="d-flex justify-content-center mb-4">
        {[...new Set(rooms.map((room) => room.location))].map((page) => (
          <button
            key={page}
            className={`btn ${currentPage === parseInt(page) ? "btn-primary" : "btn-outline-primary"
              } mx-2`}
            onClick={() => setCurrentPage(parseInt(page))}
          >
            Página {page}
          </button>
        ))}
      </div>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th className="room-column">Quartos</th>
              {daysOfWeek.map((day) => (
                <th key={day.format("YYYY-MM-DD")}>{day.format("ddd DD")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room.id}>
                <td className="room-column">{room.name}</td>
                {daysOfWeek.map((day) => (
                  <td key={day.format("YYYY-MM-DD")}>{renderCellContent(room, day)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAddModal && (
        <AddReservationModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setModalError(null); // Limpa o erro ao fechar o modal
          }}
          onSubmit={async (newReservation) => {
            if (!validateReservation(newReservation)) return; // Validação inicial
            const result = await handleAddReservation(newReservation, reloadReservations, setModalError);
            if (result) {
              setShowAddModal(false); // Fecha o modal somente se a reserva for adicionada com sucesso
            }
          }}
          selectedRoom={selectedRoom}
          selectedDate={selectedDate}
          guests={guests}
          modalError={modalError}
        />
      )}

      {editReservation && (
        <EditReservationModal
          editReservation={editReservation}
          setEditReservation={setEditReservation}
          onClose={async () => {
            setEditReservation(null);
            await reloadReservations(); // Garante que as reservas sejam recarregadas ao fechar o modal
            setModalError(null); // Limpa o erro ao fechar o modal
          }}
          onSubmit={async (updatedReservation) => {
            await handleUpdateReservation(updatedReservation, reloadReservations, setEditReservation, setModalError);
          }}
          handleDeleteReservation={async (reservationId) => {
            await handleDeleteReservation(reservationId, reloadReservations, setEditReservation);
          }}
          rooms={rooms}
          guests={guests}
          modalError={modalError}
        />
      )}
    </div>
  );
};
export default ReservationsPage;
