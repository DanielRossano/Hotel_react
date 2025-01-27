import React, { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/pt-br";
import { toast } from "react-toastify";
import AddReservationModal from "../components/AddReservationModal";
import EditReservationModal from "../components/EditReservationModal";
import {
  loadRoomsAndReservations,
  createReservation,
  fetchGuests,
  updateReservation,
  deleteReservation,
} from "../services/reservationsFunctions";
import "../styles/ReservationsPage.css";

const ReservationsPage = () => {
  // **Estados Globais**
  const [rooms, setRooms] = useState([]); // Lista de quartos
  const [reservations, setReservations] = useState([]); // Todas as reservas
  const [filteredReservations, setFilteredReservations] = useState([]); // Reservas filtradas
  const [guests, setGuests] = useState([]); // Lista de hóspedes

  // **Estados de Controle**
  const [startDate, setStartDate] = useState(moment().startOf("week"));
  const [endDate, setEndDate] = useState(moment().endOf("week"));
  const [filterStartDate, setFilterStartDate] = useState(moment().startOf("week"));
  const [filterEndDate, setFilterEndDate] = useState(moment().endOf("week"));
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
        toast.success("Dados carregados com sucesso!");
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar quartos e reservas.");
      }
    };


    const fetchGuestsData = async () => {
      try {
        const fetchedGuests = await fetchGuests();
        setGuests(fetchedGuests);
      } catch (error) {
        console.error("Erro ao carregar hóspedes:", error);
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
    toast.success("Filtro aplicado com sucesso!");
  };
  
  const handleAddReservation = async (reservation) => {
    try {
      const newReservation = await createReservation(reservation);
  
      // Busca o nome do hóspede correspondente
      const guest = guests.find((g) => g.id === newReservation.guest_id);
      const updatedReservation = { ...newReservation, guest_name: guest?.name || "Hóspede não encontrado" };
  
      // Atualiza as reservas no estado global
      setReservations((prev) => [...prev, updatedReservation]);
  
      // Verifica se a nova reserva está dentro do intervalo de filtros aplicados
      const reservationStart = moment(updatedReservation.start_date, "YYYY-MM-DDTHH:mm:ss");
      const reservationEnd = moment(updatedReservation.end_date, "YYYY-MM-DDTHH:mm:ss");
      if (
        reservationStart.isBetween(filterStartDate, filterEndDate, null, "[]") ||
        reservationEnd.isBetween(filterStartDate, filterEndDate, null, "[]") ||
        (reservationStart.isBefore(filterStartDate) && reservationEnd.isAfter(filterEndDate))
      ) {
        setFilteredReservations((prev) => [...prev, updatedReservation]);
      }
  
      setShowAddModal(false);
      toast.success("Reserva cadastrada com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar reserva:", error);
      toast.error("Erro ao cadastrar reserva. Tente novamente.");
    }
  };
  
  const handleUpdateReservation = async (updatedReservation) => {
    try {
      const updatedData = await updateReservation(updatedReservation);
      setReservations((prev) =>
        prev.map((res) => (res.id === updatedData.id ? updatedData : res))
      );
      setFilteredReservations((prev) =>
        prev.map((res) => (res.id === updatedData.id ? updatedData : res))
      );
      setEditReservation(null);
      toast.success("Reserva atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar reserva:", error);
      toast.error("Erro ao atualizar reserva.");
    }
  };
  
  const handleDeleteReservation = async (reservationId) => {
    try {
      await deleteReservation(reservationId);
      setReservations((prev) => prev.filter((res) => res.id !== reservationId));
      setFilteredReservations((prev) =>
        prev.filter((res) => res.id !== reservationId)
      );
      setEditReservation(null);
      toast.success("Reserva excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir reserva:", error);
      toast.error("Erro ao excluir reserva. Tente novamente.");
    }
  };
  
  useEffect(() => {
    applyFilter();
  }, [reservations]);

  // **Gerar Conteúdo das Células**
  const renderCellContent = (room, day) => {
    const reservationsForDay = filteredReservations.filter(
      (res) =>
        res.room_id === room.id &&
        moment(day).isBetween(res.start_date, res.end_date, "day", "[]")
    );

    if (reservationsForDay.length > 0) {
      const reservation = reservationsForDay[0];
      return (
        <div
          className="reserved"
          onClick={() => setEditReservation(reservation)}
          title={`Reserva: ${reservation.guest_name || reservation.custom_name}`}
        >
          {reservation.custom_name || reservation.guest_name}
        </div>
      );
    }

    return (
      <div
        className="available"
        onClick={() => {
          setSelectedRoom(room);
          setSelectedDate(day.format("YYYY-MM-DD"));
          setShowAddModal(true);
        }}
        title="Dia disponível"
      >
        Livre
      </div>
    );
  };

  const daysOfWeek = generateDaysRange();
  const filteredRooms = rooms.filter((room) => room.location === `${currentPage}`);

  return (
    <div className="container reservations-page">
      <h3 className="text-center mb-4">Listagem de Reservas</h3>
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

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Quartos</th>
              {daysOfWeek.map((day) => (
                <th key={day.format("YYYY-MM-DD")}>{day.format("ddd DD")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room.id}>
                <td>{room.name}</td>
                {daysOfWeek.map((day) => (
                  <td key={day.format("YYYY-MM-DD")}>{renderCellContent(room, day)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modais */}
      {showAddModal && (
        <AddReservationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={(reservation) => handleAddReservation(reservation)}
        selectedRoom={selectedRoom}
        selectedDate={selectedDate}
        guests={guests}
      />
      )}
      {editReservation && (
       <EditReservationModal
       editReservation={editReservation}
  setEditReservation={setEditReservation}
  onClose={() => setEditReservation(null)}
  onSubmit={handleUpdateReservation}
  handleDeleteReservation={handleDeleteReservation}
       rooms={rooms}
       guests={guests}
     />
      )}
    </div>
  );
};

export default ReservationsPage;
