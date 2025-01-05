import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/pt-br';
import { fetchReservations } from '../services/reservationFunctions';
import { fetchRooms } from '../services/rooms';
import'../styles/ReservationsTimeline.css';   // Importa o arquivo de estilos

const ReservationsTimeline = () => {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));
  const [filteredDates, setFilteredDates] = useState([]);

  useEffect(() => {
    const generateDateRange = (start, end) => {
      const dates = [];
      let currentDate = moment(start);
      while (currentDate <= moment(end)) {
        dates.push(currentDate.format('YYYY-MM-DD'));
        currentDate = currentDate.add(1, 'day');
      }
      return dates;
    };

    setFilteredDates(generateDateRange(startDate, endDate));
  }, [startDate, endDate]);

  useEffect(() => {
    const loadRoomsAndReservations = async () => {
      try {
        // Buscar quartos
        const roomsData = await fetchRooms();
        setRooms(roomsData);

        // Buscar reservas
        const reservationsData = await fetchReservations();
        setReservations(reservationsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadRoomsAndReservations();
  }, []);

  return (
    <div className="reservations-timeline">
      <h1 className="text-center">Controle de Reservas</h1>

      {/* Filtro por período */}
      <div className="filters">
        <label>
          Data de:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          até:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      {/* Tabela de Linha do Tempo */}
      <div className="timeline">
        {/* Cabeçalho com datas */}
        <div className="timeline-header">
          <div className="timeline-room-column">Quarto</div>
          {filteredDates.map((date) => (
            <div key={date} className="timeline-date-column">
              {moment(date).format('DD/MM')}
            </div>
          ))}
        </div>

        {/* Linhas de quartos */}
        {rooms.map((room) => (
          <div key={room.id} className="timeline-row">
            {/* Número do quarto */}
            <div className="timeline-room-column">{room.name}</div>

            {/* Colunas de reservas */}
            {filteredDates.map((date) => {
              const reservation = reservations.find(
                (res) =>
                  res.room_id === room.id &&
                  moment(date).isBetween(res.start_date, res.end_date, 'day', '[]')
              );

              return (
                <div
                  key={date}
                  className={`timeline-date-column ${
                    reservation ? 'reserved' : ''
                  }`}
                  title={reservation ? `Hóspede: ${reservation.guest_name}` : ''}
                >
                  {reservation ? reservation.guest_name : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReservationsTimeline;
