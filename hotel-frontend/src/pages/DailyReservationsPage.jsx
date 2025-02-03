import React, { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/pt-br";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, AlignmentType, WidthType } from "docx";
import api from "../services/api";
import { loadRoomsAndReservations, handleAddReservation, handleDeleteReservation, handleUpdateReservation, validateReservation } from "../services/reservationsFunctions";
import AddReservationModal from "../components/AddReservationModal";
import EditReservationModal from "../components/EditReservationModal";
import "../styles/DailyReservationsPage.css";
import "../styles/cells.css";
import "../styles/table.css";

const DailyReservationsControl = () => {
  const [startDate, setStartDate] = useState(moment().startOf("day"));
  const [endDate, setEndDate] = useState(moment().add(0, "days").endOf("day"));
  const [modalError, setModalError] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [guests, setGuests] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editReservation, setEditReservation] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

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

  const reloadReservations = async () => {
    try {
      const { reservations } = await loadRoomsAndReservations();
      setReservations(reservations);
      setFilteredReservations(reservations);
    } catch (error) {
      toast.error("Erro ao recarregar reservas.");
    }
  };

  const renderTableColumns = (rooms, day) => {
    const columns = [
      rooms.slice(0, 10),
      rooms.slice(10, 20),
      rooms.slice(20, 30),
    ];
    return (
      <div className="daily-table-columns">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="daily-column">
            <table className="daily-table">
              <thead>
                <tr>
                  <th className="room-column">Quartos</th>
                  <th className="room-column">Status</th>
                </tr>
              </thead>
              <tbody>
                {column.map((room) => (
                  <tr key={room.id}>
                    <td>{room.name}</td>
                    <td>{renderCellContent(room, moment(day, "YYYY-MM-DD"))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
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
          title={`Check-in: ${moment(reservation.start_date).format("DD/MM HH:mm")}, Check-out: ${moment(reservation.end_date).format("DD/MM HH:mm")}`}
        >
          <div>{reservation.custom_name || reservation.guest_name}</div>
          <div>Entrada: {moment(reservation.start_date).format("DD/MM HH:mm")} Saida: {moment(reservation.end_date).format("DD/MM HH:mm")}</div>
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
        <div>{`R$: ${room.preco}`}</div>
      </div>
    );
  };

  const handleCellClick = (roomId, date, reservation) => {
    if (reservation) {
      setEditReservation(reservation);
    } else {
      setSelectedRoom(rooms.find((room) => room.id === roomId));
      setSelectedDate(moment(date).format("YYYY-MM-DD"));
      setShowAddModal(true);
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
        `Ap.${room.id} ${dailyRate !== "-" ? `${parseFloat(dailyRate).toFixed(2)}` : `${parseFloat(room.preco).toFixed(2)}`}`,
        roomReservation?.custom_name || roomReservation?.guest_name || "",
        roomReservation ? moment(roomReservation.start_date).format("DD/MM HH:mm") : "",
        roomReservation ? moment(roomReservation.end_date).format("DD/MM HH:mm") : "",
        "",
        totalAmount !== "-" ? `${parseFloat(totalAmount).toFixed(2)}` : ``,
      ];
    });

    const table = new Table({
      rows: [
        new TableRow({
          children: [
            { text: "Ap.", width: 1500 },
            { text: "Hóspede", width: 4000 },
            { text: "Entrada", width: 1500 },
            { text: "Saída", width: 1500 },
            { text: "Consumo", width: 4000 },
            { text: "Total", width: 1500 },
          ].map((header) =>
            new TableCell({
              children: [
                new Paragraph({
                  text: header.text,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  font: { name: "Arial", size: 24 },
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
                        font: { name: "Arial", size: 24 },
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


  const generateDaysRange = () => {
    const days = [];
    let day = startDate.clone();
    while (day <= endDate) {
      days.push(day.clone());
      day.add(1, "day");
    }
    return days;
  };

  const renderNextDayStatus = (room, currentDay) => {
    const nextDay = moment(currentDay).add(1, "day");
    const reservationsForNextDay = filteredReservations.filter(
      (res) =>
        res.room_id === room.id &&
        moment(nextDay).isBetween(res.start_date, res.end_date, "day", "[]")
    );

    if (reservationsForNextDay.length > 0) {
      const reservation = reservationsForNextDay[0];

      if (moment(nextDay).isSame(reservation.start_date, "day")) {
        return (
          <div className="daily-cell daily-next-day-checkin">
            Novo Check-in
          </div>
        );
      }

      if (moment(nextDay).isSame(reservation.end_date, "day")) {
        return (
          <div className="daily-cell daily-next-day-checkout">
            Check-out
          </div>
        );
      }

      return (
        <div className="daily-cell daily-next-day-continue">
          Continua
        </div>
      );
    }

    return (
      <div className="daily-cell daily-next-day-available">
        Livre
      </div>
    );
  };

  const daysOfWeek = generateDaysRange();

  return (
    <div className="daily-container">
      <ToastContainer />
      <header className="daily-header">
        <h1 className="header-title">Controle Diário</h1>
        <div className="date-range">
          {daysOfWeek.map((day) => (
            <h1 key={day.format('YYYY-MM-DD')}>
              {day.format('ddd DD')}
              <span className="">/{day.format('MMM')}</span>
              <br />
            </h1>
          ))}
        </div>
        <div className="filter-container">
          <label htmlFor="selectedDate">Data:</label>
          <input
            type="date"
            id="daily-selected-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleExportToWord}>
            Imprimir lista diária
          </button>
        </div>
      </header>
      {renderTableColumns(rooms, selectedDate)}

      {showAddModal && (
        <AddReservationModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setModalError(null);
          }}
          onSubmit={async (newReservation) => {
            if (!validateReservation(newReservation)) return;
            const result = await handleAddReservation(newReservation, reloadReservations, setModalError);
            if (result) {
              setShowAddModal(false);
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
            await reloadReservations();
            setModalError(null);
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

export default DailyReservationsControl;
