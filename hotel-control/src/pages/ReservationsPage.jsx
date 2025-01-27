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
} from "../services/reservationsFunctions";
import api from "../services/api";
import "../styles/ReservationsPage.css";

const ReservationsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [startDate, setStartDate] = useState(moment().startOf("week"));
  const [endDate, setEndDate] = useState(moment().endOf("week"));
  const [filterStartDate, setFilterStartDate] = useState(moment().startOf("week"));
  const [filterEndDate, setFilterEndDate] = useState(moment().endOf("week"));
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [guests, setGuests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editReservation, setEditReservation] = useState(null);

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

    fetchData();
  }, []);

  useEffect(() => {
    const fetchGuestsData = async () => {
      try {
        const fetchedGuests = await fetchGuests();
        setGuests(fetchedGuests);
        toast.success("Hóspedes carregados com sucesso!");
      } catch (error) {
        console.error("Erro ao carregar hóspedes:", error);
        toast.error("Erro ao carregar lista de hóspedes.");
      }
    };

    fetchGuestsData();
  }, []);

  const generateDaysRange = () => {
    const days = [];
    let day = startDate.clone();

    while (day <= endDate) {
      days.push(day.clone());
      day.add(1, "day");
    }

    return days;
  };

  const handleUpdateReservation = async (updatedReservation) => {
    try {
      const updatedReservations = reservations.map((res) =>
        res.id === updatedReservation.id ? updatedReservation : res
      );
      setReservations(updatedReservations);
      setFilteredReservations(updatedReservations);
      toast.success("Reserva atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar reserva:", error);
      toast.error("Erro ao atualizar reserva.");
    }
  };

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

  const handleCellClick = (roomId, date, reservation) => {
    if (reservation) {
      setEditReservation(reservation);
      toast.info("Reserva selecionada para edição.");
    } else {
      setSelectedRoom(rooms.find((room) => room.id === roomId));
      setSelectedDate(date);
      setShowAddModal(true);
      toast.info("Preparando para adicionar nova reserva.");
    }
  };

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

    if (checkInReservations.length > 0 || checkOutReservations.length > 0) {
      return (
        <div className="split-cell">
          {checkOutReservations.map((res) => (
            <div
              key={`checkOut-${res.id}`}
              className="half reserved"
              onClick={() => handleCellClick(room.id, day.format("YYYY-MM-DD"), res)}
              title={`Check-out às ${moment(res.end_date).format("HH:mm")} - ${res.guest_name}`}
            >
              {res.guest_name}
            </div>
          ))}
          {checkInReservations.map((res) => (
            <div
              key={`checkIn-${res.id}`}
              className="half reserved"
              onClick={() => handleCellClick(room.id, day.format("YYYY-MM-DD"), res)}
              title={`Check-in às ${moment(res.start_date).format("HH:mm")} - ${res.guest_name}`}
            >
              {res.guest_name}
            </div>
          ))}
        </div>
      );
    }

    if (reservationsForDay.length > 0) {
      const reservation = reservationsForDay[0];
      return (
        <div
          className="reserved"
          onClick={() => handleCellClick(room.id, day.format("YYYY-MM-DD"), reservation)}
          title={`Reserva completa: Check-in às ${moment(reservation.start_date).format("HH:mm")}, Check-out às ${moment(reservation.end_date).format("HH:mm")}`}
        >
          {reservation.guest_name}
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

  const handleAddReservation = async (reservation) => {
    try {
      const newReservation = await createReservation(reservation);
      const guest = guests.find((g) => g.id === newReservation.guest_id);
      const updatedReservation = { ...newReservation, guest_name: guest?.name || "Hóspede não encontrado" };

      setReservations((prev) => [...prev, updatedReservation]);

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

  const handleDeleteReservation = async (reservationId) => {
    try {
      await deleteReservation(reservationId);

      const updatedReservations = reservations.filter((res) => res.id !== reservationId);
      setReservations(updatedReservations);
      setFilteredReservations(updatedReservations);

      setEditReservation(null);
      toast.success("Reserva excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir reserva:", error);
      const errorMessage = error.response?.data?.error || "Erro ao excluir reserva. Tente novamente.";
      toast.error(errorMessage);
    }
  };

  const deleteReservation = async (id) => {
    try {
      const response = await api.delete(`/reservations/${id}`);
      toast.success("Reserva cancelada com sucesso!");
      return response.data;
    } catch (error) {
      console.error("Erro ao excluir reserva:", error);
      const errorMessage = error.response?.data?.error || "Erro ao excluir reserva. Tente novamente.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const daysOfWeek = generateDaysRange();
  const filteredRooms = rooms.filter((room) => room.location === `${currentPage}`);

  return (
    <div className="container reservations-page">
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

        {[...new Set(rooms.map((room) => room.location))].map((page) => (
          <button
            key={page}
            className={`btn ${currentPage === parseInt(page) ? "btn-primary" : "btn-outline-primary"} mx-2`}
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
      <EditReservationModal
        editReservation={editReservation}
        setEditReservation={setEditReservation}
        handleUpdateReservation={handleUpdateReservation}
        handleDeleteReservation={handleDeleteReservation}
        guests={guests}
        rooms={rooms}
      />
    </div>
  );
};

export default ReservationsPage;
