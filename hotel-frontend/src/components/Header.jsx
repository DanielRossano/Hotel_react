import React, { useState } from 'react';
import Sidebar from './Sidebar'; 
import '../styles/header.css';

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Header */}
      <header className="header d-flex justify-content-between align-items-center px-3">
        {/* Botão de Hambúrguer */}
        <button
          className="hamburger-btn border-0 bg-transparent text-white"
          onClick={toggleSidebar}
        >
          <div className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {/* Título */}
        <h1>Hotel Pioneiro</h1>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </>
  );
};

export default Header;
