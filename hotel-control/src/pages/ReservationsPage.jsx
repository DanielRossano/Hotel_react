import React, { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/pt-br";
import AddReservationModal from "../components/AddReservationModal";
import { loadRoomsAndReservations, createReservation, fetchGuests, handleDeleteReservation } from "../services/reservationsFunctions";
import { toast } from "react-toastify";
import "../styles/ReservationsPage.css";

const ReservationsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [guests, setGuests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { rooms, reservations } = await loadRoomsAndReservations();
        setRooms(rooms);
        setReservations(reservations);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar quartos e reservas.");
      }
    };

    fetchData();
  }, []);

  const generateDaysOfMonth = () => {
    const startOfMonth = currentMonth.clone().startOf("month");
    const endOfMonth = currentMonth.clone().endOf("month");

    const days = [];
    let day = startOfMonth;

    while (day <= endOfMonth) {
      days.push(day.clone());
      day.add(1, "day");
    }

    return days;
  };

  const getReservation = (roomId, date) => {
    return reservations.find(
      (reservation) =>
        reservation.room_id === roomId &&
        moment(date).isBetween(
          reservation.start_date,
          reservation.end_date,
          "day",
          "[]"
        )
    );
  };

  const handleMonthChange = (direction) => {
    setCurrentMonth((prev) =>
      direction === "prev"
        ? prev.clone().subtract(1, "month")
        : prev.clone().add(1, "month")
    );
  };

  const handleCellClick = async (roomId, date) => {
    const reservation = getReservation(roomId, date);

    if (reservation) {
      if (window.confirm("Deseja cancelar esta reserva?")) {
        try {
          await handleDeleteReservation(reservation.id);
          setReservations((prev) => prev.filter((r) => r.id !== reservation.id));
        } catch (error) {
          console.error("Erro ao cancelar reserva:", error);
        }
      }
    } else {
      try {
        const fetchedGuests = await fetchGuests();
        setGuests(fetchedGuests);
        setSelectedRoom(rooms.find((room) => room.id === roomId));
        setSelectedDate(date);
        setShowAddModal(true);
      } catch (error) {
        console.error("Erro ao carregar hóspedes:", error);
        toast.error("Erro ao carregar lista de hóspedes.");
      }
    }
  };

  const handleAddReservation = async (reservation) => {
    try {
      const newReservation = await createReservation(reservation);
      setReservations((prev) => [...prev, newReservation]);
      setShowAddModal(false);
      toast.success("Reserva cadastrada com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar reserva:", error);
      toast.error("Erro ao cadastrar reserva. Tente novamente.");
    }
  };

  const daysOfMonth = generateDaysOfMonth();

  return (
    <div className="container reservations-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          className="btn btn-outline-primary"
          onClick={() => handleMonthChange("prev")}
        >
          &lt; Mês Anterior
        </button>
        <h3>{currentMonth.format("MMMM YYYY")}</h3>
        <button
          className="btn btn-outline-primary"
          onClick={() => handleMonthChange("next")}
        >
          Próximo Mês &gt;
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Quartos</th>
              {daysOfMonth.map((day) => (
                <th key={day.format("YYYY-MM-DD")}>{day.format("DD")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
  {rooms.map((room) => {
    const reservationsForRoom = reservations.filter(
      (res) => res.room_id === room.id
    );

    return (
      <tr key={room.id}>
  <td>{room.name}</td>
  {(() => {
    let cells = [];
    let dayIndex = 0;

    while (dayIndex < daysOfMonth.length) {
      const day = daysOfMonth[dayIndex];
      const currentReservation = reservationsForRoom.find((res) =>
        moment(day).isBetween(res.start_date, res.end_date, "day", "[]")
      );

      if (currentReservation) {
        // Cálculo do número de dias consecutivos para esta reserva
        const reservationDays = daysOfMonth.filter((d) =>
          moment(d).isBetween(
            currentReservation.start_date,
            currentReservation.end_date,
            "day",
            "[]"
          )
        );

        const colspan = reservationDays.length;

        // Adiciona a célula agrupada
        cells.push(
          <td
            key={`${room.id}-${day.format("YYYY-MM-DD")}`}
            colSpan={colspan}
            className="reserved"
            onClick={() =>
              handleCellClick(room.id, day.format("YYYY-MM-DD"))
            }
            style={{
              cursor: "pointer",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: `${colspan * 100}px`, // Ajusta largura conforme o número de células
            }}
            title={currentReservation.guest_name}
          >
            {currentReservation.guest_name}
          </td>
        );

        // Avança o índice para pular os dias da reserva já processados
        dayIndex += colspan;
      } else {
        // Adiciona células disponíveis
        cells.push(
          <td
            key={`${room.id}-${day.format("YYYY-MM-DD")}`}
            className="available"
            onClick={() =>
              handleCellClick(room.id, day.format("YYYY-MM-DD"))
            }
            style={{ cursor: "pointer" }}
          ></td>
        );
        dayIndex++;
      }
    }

    return cells;
  })()}
</tr>

    );
  })}
</tbody>

        </table>
      </div>

      {showAddModal && (
        <AddReservationModal
          selectedRoom={selectedRoom}
          selectedDate={selectedDate}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddReservation}
          guests={guests}
        />
      )}
    </div>
  );
};

export default ReservationsPage;
