// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import PrivateRoute from '../components/PrivateRoute';
import DashboardCliente from '../pages/cliente/DashboardCliente';
import DashboardFerreteria from '../pages/ferreteria/DashboardFerreteria';
import DashboardMaestro from '../pages/maestro/DashboardMaestro';
import { AuthProvider } from '../context/AuthContext';

// Usar variables de entorno de Vite
const API_URL = import.meta.env.VITE_API_URL || "https://construlink-inky.vercel.app/api";
console.log('API URL:', API_URL);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cliente/*" element={
            <PrivateRoute role="cliente">
              <DashboardCliente />
            </PrivateRoute>
          } />
          <Route path="/ferreteria/*" element={
            <PrivateRoute role="ferreteria">
              <DashboardFerreteria />
            </PrivateRoute>
          } />
          <Route path="/maestro/*" element={
            <PrivateRoute role="maestro">
              <DashboardMaestro />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
