import React from 'react';
import '../styles/sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header dentro da Sidebar */}
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button className="close-btn text-white" onClick={toggleSidebar}>
            ✖
          </button>
        </div>

        {/* Navegação */}
        <nav>
          <ul>
            <li><a href="/Addreservations">Dashboard</a></li>
            <li><a href="/rooms">Quartos</a></li>
            <li><a href="/reservations">Reservas</a></li>
            <li><a href="/guests">Hóspedes</a></li>
          </ul>
        </nav>
      </div>

      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;