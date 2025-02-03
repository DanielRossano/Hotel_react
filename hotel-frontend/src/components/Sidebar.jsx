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
            <li>
              <a href="/daily-reservations">
                <i className="fas fa-clock"></i> Controle Diário
              </a>
            </li>
            <li>
              <a href="/rooms">
                <i className="fas fa-bed"></i> Quartos
              </a>
            </li>
            <li>
              <a href="/reservations">
                <i className="fas fa-calendar-check"></i> Reservas
              </a>
            </li>
            <li>
              <a href="/guests">
                <i className="fas fa-users"></i> Hóspedes
              </a>
            </li>
          </ul>
        </nav>
      </div>
      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;
