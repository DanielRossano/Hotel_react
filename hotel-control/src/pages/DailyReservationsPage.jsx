import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import moment from "moment";
import "../styles/DailyReservationsPage.css";
import { loadRoomsAndReservations, createReservation } from "../services/reservationsFunctions";
import AddReservationModal from "../components/AddReservationModal";
import EditReservationModal from "../components/EditReservationModal";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
} from "docx";

const DailyReservationsControl = () => {
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editReservation, setEditReservation] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState(moment().startOf("week"));
  const [filterEndDate, setFilterEndDate] = useState(moment().endOf("week"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { rooms, reservations } = await loadRoomsAndReservations();
        const fetchedGuests = await api.get("/guests");
        setRooms(rooms);
        setReservations(reservations);
        setFilteredReservations(reservations);
        setGuests(fetchedGuests.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar quartos, reservas ou hóspedes.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = reservations.filter((reservation) => {
      const reservationStart = moment(reservation.start_date, "YYYY-MM-DDTHH:mm:ss");
      const reservationEnd = moment(reservation.end_date, "YYYY-MM-DDTHH:mm:ss");
      const filterDateWithTime = moment(selectedDate).set({
        hour: 17,
        minute: 0,
        second: 0,
      });

      return filterDateWithTime.isBetween(reservationStart, reservationEnd, null, "[]");
    });

    setFilteredReservations(filtered);
  }, [reservations, selectedDate]);

  const handleCellClick = (roomId, date, reservation) => {
    if (reservation) {
      const guest = guests.find((g) => g.id === reservation.guest_id);
      setEditReservation({
        ...reservation,
        guest_name: guest ? guest.name : "Hóspede não encontrado",
      });
    } else {
      setSelectedRoom(rooms.find((room) => room.id === roomId));
      setSelectedDate(date);
      setShowAddModal(true);
    }
  };

  const renderCellContent = (room, day) => {
    const reservationsForDay = filteredReservations.filter(
      (res) =>
        res.room_id === room.id &&
        moment(day).isBetween(res.start_date, res.end_date, "day", "[]")
    );

    if (reservationsForDay.length > 0) {
      return reservationsForDay.map((reservation) => (
        <div
          key={reservation.id}
          className="daily-cell daily-reserved"
          onClick={() => handleCellClick(room.id, day, reservation)}
          title={`Check-in: ${moment(reservation.start_date).format("DD/MM/YYYY HH:mm")}, Check-out: ${moment(reservation.end_date).format("DD/MM/YYYY HH:mm")}`}
        >
          <div>Hóspede: {reservation.guest_name}</div>
          <div>Check-in: {moment(reservation.start_date).format("DD/MM/YYYY HH:mm")}</div>
          <div>Check-out: {moment(reservation.end_date).format("DD/MM/YYYY HH:mm")}</div>
        </div>
      ));
    }

    return (
      <div
        className="daily-cell daily-available"
        onClick={() => handleCellClick(room.id, day, null)}
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
      const errorMessage =
        error.response?.data?.error || "Erro ao excluir reserva. Tente novamente.";
      toast.error(errorMessage);
      throw error;
    }
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
  const handleExportToWord = async () => {
    const rows = rooms.map((room) => {
      const roomReservation = filteredReservations.find(
        (res) => res.room_id === room.id
      );

      const dailyRate = roomReservation?.daily_rate || "-";
      const totalAmount = roomReservation
        ? ((moment(roomReservation.end_date).diff(moment(roomReservation.start_date), "days") || 1) * dailyRate).toFixed(2)
        : "-";

      return [
        `${room.name} (${dailyRate !== "-" ? `R$ ${dailyRate}` : "Sem diária"})`,
        roomReservation?.guest_name || "",
        roomReservation ? moment(roomReservation.start_date).format("DD/MM HH:mm") : "",
        roomReservation ? moment(roomReservation.end_date).format("DD/MM HH:mm") : "",
        "", // Placeholder para consumo
        totalAmount !== "-" ? `R$ ${totalAmount}` : "-",
      ];
    });

    const table = new Table({
      rows: [
        new TableRow({
          children: [
            { text: "Quarto", width: 800 },
            { text: "Hóspede", width: 3332 },
            { text: "Entrada", width: 800 },
            { text: "Saída", width: 800 },
            { text: "Consumo", width: 2000 },
            { text: "Total", width: 800 },
          ].map((header) =>
            new TableCell({
              children: [
                new Paragraph({
                  text: header.text,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  font: { size: 22 }, // Font size 11
                }),
              ],
              width: { size: header.width, type: WidthType.DXA },
            })
          ),
        }),
        ...rows.map(
          (row) =>
            new TableRow({
              children: row.map(
                (cell) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: cell,
                        alignment: AlignmentType.CENTER,
                        font: { size: 22 }, // Font size 11
                      }),
                    ],
                    width: { size: 1666, type: WidthType.DXA },
                  })
              ),
            })
        ),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
              size: {
                orientation: "landscape",
              },
            },
          },
          children: [
            new Paragraph({
              text: `${moment(selectedDate).format("DD/MM/yy dddd")}`,
              heading: "Heading1",
              alignment: AlignmentType.CENTER,
            }),
            table,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Controle_Diario_${selectedDate}.docx`);
  };

  return (
    <div className="daily-container">
      <div className="daily-date-selector">
        <label htmlFor="selectedDate" className="daily-date-label">
          Data:
        </label>
        <input
          type="date"
          id="daily-selected-date"
          className="daily-date-input"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleExportToWord}>
          Imprimir Lista Diária
        </button>
      </div>

      <div className="daily-table-container">
        <table className="daily-table">
          <thead>
            <tr>
              <th>Quarto</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.name}</td>
                <td>
                  {renderCellContent(
                    room,
                    moment(selectedDate, "YYYY-MM-DD")
                  )}
                </td>
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

export default DailyReservationsControl;
