// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import PrivateRoute from '../components/PrivateRoute';
import Navbar from '../components/Navbar';
import Login from '../pages/Login';
import Register from '../pages/Register';
import DashboardCliente from '../pages/cliente/DashboardCliente';
import DashboardFerreteria from '../pages/ferreteria/DashboardFerreteria';
import DashboardMaestro from '../pages/maestro/DashboardMaestro';

function App() {
  console.log("App rendering");
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rutas para clientes */}
          <Route path="/cliente/*" element={
            <>
              <Navbar />
              <PrivateRoute role="cliente">
                <DashboardCliente />
              </PrivateRoute>
            </>
          } />
          
          {/* Rutas para ferreterías */}
          <Route path="/ferreteria/*" element={
            <>
              <Navbar />
              <PrivateRoute role="ferreteria">
                <DashboardFerreteria />
              </PrivateRoute>
            </>
          } />
          
          {/* Rutas para maestros */}
          <Route path="/maestro/*" element={
            <>
              <Navbar />
              <PrivateRoute role="maestro">
                <DashboardMaestro />
              </PrivateRoute>
            </>
          } />
          
          {/* Ruta para cualquier otra URL */}
          <Route path="*" element={<p>Ruta no encontrada</p>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
