import React, { useState, useEffect } from "react";
import { fetchRooms, createRoom } from "../services/rooms";
import api from "../services/api"; // Para chamadas personalizadas, como edição
import '../styles/rooms.css'; // Estilos customizados, se necessário
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]); // Lista de quartos
  const [editingRoomId, setEditingRoomId] = useState(null); // ID do quarto em edição
  const [editedRoomName, setEditedRoomName] = useState(""); // Nome do quarto em edição

  // Buscar quartos do backend ao carregar a página
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await fetchRooms();
        setRooms(roomsData);
      } catch (error) {
        console.error("Erro ao carregar quartos:", error);
        toast.error("Erro ao carregar os quartos.");
      }
    };
    loadRooms();
  }, []);

  // Iniciar o modo de edição
  const startEditing = (room) => {
    setEditingRoomId(room.id);
    setEditedRoomName(room.name);
  };

  // Cancelar edição
  const cancelEditing = () => {
    setEditingRoomId(null);
    setEditedRoomName("");
  };

  // Salvar alterações no quarto
  const saveRoom = async (roomId) => {
    if (!editedRoomName.trim()) {
      toast.error("O nome do quarto não pode estar vazio.");
      return;
    }

    try {
      const response = await api.put(`/rooms/${roomId}`, { name: editedRoomName });
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId ? { ...room, name: editedRoomName } : room
        )
      );
      toast.success("Quarto atualizado com sucesso!");
      cancelEditing();
    } catch (error) {
      console.error("Erro ao atualizar o quarto:", error);
      toast.error("Erro ao atualizar o quarto.");
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Controle de Quartos</h1>
      <ToastContainer />

      <div className="rooms-list">
        <ul className="list-group">
          {rooms.map((room) => (
            <li
              key={room.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {editingRoomId === room.id ? (
                <>
                  <input
                    type="text"
                    value={editedRoomName}
                    onChange={(e) => setEditedRoomName(e.target.value)}
                    className="form-control me-2"
                  />
                  <div>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => saveRoom(room.id)}
                    >
                      Salvar
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={cancelEditing}
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span>{room.name}</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => startEditing(room)}
                  >
                    Editar
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoomsPage;
