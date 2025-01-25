import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import moment from "moment";
import "../styles/DailyReservationsPage.css"; // Certifique-se de criar ou importar este arquivo de estilo
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
  const [filterStartDate, setFilterStartDate] = useState(moment().startOf("week")); // Filtro temporário
  const [filterEndDate, setFilterEndDate] = useState(moment().endOf("week")); // Filtro temporário

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { rooms, reservations } = await loadRoomsAndReservations();
        setRooms(rooms);
        setReservations(reservations);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = reservations.filter((reservation) =>
      moment(selectedDate).isBetween(
        moment(reservation.start_date, "YYYY-MM-DDTHH:mm:ss"),
        moment(reservation.end_date, "YYYY-MM-DDTHH:mm:ss"),
        null,
        "[]"
      )
    );
    setFilteredReservations(filtered);
  }, [selectedDate, reservations]);

  const handleCellClick = (room, reservation) => {
    if (reservation) {
      setEditReservation(reservation); // Abre modal de edição
    } else {
      setSelectedRoom(room); // Define o quarto para adicionar reserva
      setShowAddModal(true);
    }
  };

  const renderCellContent = (room) => {
    const roomReservation = filteredReservations.find(
      (res) => res.room_id === room.id
    );

    const status = roomReservation ? "Ocupado" : "Disponível";
    const guestName = roomReservation?.guest_name || "-";
    const checkIn = roomReservation
      ? moment(roomReservation.start_date).format("DD/MM HH:mm")
      : "-";
    const checkOut = roomReservation
      ? moment(roomReservation.end_date).format("DD/MM HH:mm")
      : "-";

    return (
      <div
        className={`daily-cell ${status === "Ocupado" ? "daily-reserved" : "daily-available"}`}
        onClick={() => handleCellClick(room, roomReservation)}
        title={`Status: ${status}`}
      >
        <div>{guestName} | Check-in: {checkIn} | Check-out: {checkOut}</div>
      </div>
    );
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
  

const handleDeleteReservation = async (reservationId) => {
    try {
      await deleteReservation(reservationId); // Função que chama o backend
  
      // Atualiza o estado removendo a reserva excluída
      const updatedReservations = reservations.filter((res) => res.id !== reservationId);
      setReservations(updatedReservations);
      setFilteredReservations(updatedReservations);
  
      // Fecha o modal de edição
      setEditReservation(null);
  
      // Exibe uma mensagem de sucesso
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
      // Lógica para atualizar a reserva no backend
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

      return [
        room.name,
        roomReservation?.guest_name || "",
        roomReservation ? moment(roomReservation.start_date).format("DD/MM HH:mm") : "",
        roomReservation ? moment(roomReservation.end_date).format("DD/MM HH:mm") : "",
        "", // Placeholder para consumo
        "", // Placeholder para total
      ];
    });
    const table = new Table({
      rows: [
        new TableRow({
          children: [
            { text: "Quarto", width: 800 },
            { text: "Hóspede", width: 3332 },
            { text: "Entrada", width: 1200 },
            { text: "Saída", width: 1200 },
            { text: "Consumo", width: 2000 },
            { text: "Total", width: 800 },
          ].map((header) =>
            new TableCell({
              children: [
                new Paragraph({
                  text: header.text,
                  bold: true,
                  alignment: AlignmentType.CENTER,
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
                top: 720, // Margem mínima
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

      {/* Seletor de Data */}
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

      {/* Tabela de Quartos */}
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
                <td>{renderCellContent(room)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para adicionar reserva */}
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
