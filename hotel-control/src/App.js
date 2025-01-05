import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GuestsPage from './pages/GuestsPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// filepath: /D:/Projetos/Hotel_react/hotel-control/src/App.js
import ReservationsPage from './pages/ReservationsPage';
import './App.css';
import RoomsPage from './pages/RoomsPage';

const App = () => (
  <Router>
    <div className="app">
      <Header />
      <div className="main">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/guests" element={<GuestsPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            {/* Adicione outras rotas aqui */}
          </Routes>
        </div>
      </div>
    </div>
  </Router>
);

export default App;
