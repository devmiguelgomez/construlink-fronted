// src/pages/cliente/DashboardCliente.jsx
import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import FerreteriasDisponibles from './FerreteriasDisponibles';
import ProductosDisponibles from './ProductosDisponibles';
import ServiciosDisponibles from './ServiciosDisponibles';
import MisPedidos from './MisPedidos';
import MisSolicitudes from './MisSolicitudes';
import MaestrosDisponibles from './MaestrosDisponibles';
import PerfilCliente from './PerfilCliente';
import Estadisticas from './Estadisticas';
import { FaUser, FaStore, FaWrench, FaBox, FaClipboardList, FaSignOutAlt, FaChartBar } from 'react-icons/fa';

const DashboardCliente = () => {
  const [vista, setVista] = useState('ferreterias');
  const [perfil, setPerfil] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ferreteriaSeleccionada, setFerreteriaSeleccionada] = useState(null);
  const [maestroSeleccionado, setMaestroSeleccionado] = useState(null);
  const [editandoPerfil, setEditandoPerfil] = useState(false);

  useEffect(() => {
    // Cargar datos del perfil usando el servicio de API
    const cargarPerfil = async () => {
      try {
        const response = await userAPI.getPerfil();
        setPerfil(response.data);
      } catch (error) {
        console.error('Error al cargar el perfil', error);
      }
    };
    
    cargarPerfil();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const seleccionarFerreteria = (ferreteria) => {
    setFerreteriaSeleccionada(ferreteria);
    setVista('productos');
  };

  const seleccionarMaestro = (maestro) => {
    setMaestroSeleccionado(maestro);
    setVista('servicios');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
        <div className="sidebar">
          <div className="logo-container">
            <FaUser size={30} />
            <h2>Construlink</h2>
          </div>
          <div className="profile-brief">
            <div className="avatar">
          {perfil?.fotoPerfil ? (
            <img 
              src={`https://construlink-inky.vercel.app/uploads/${perfil.fotoPerfil}`}
              alt="Perfil" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="avatar-placeholder" style={{ fontSize: '1.2rem' }}>
              {perfil?.nombre?.charAt(0) || 'C'}
            </div>
          )}
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{perfil?.nombre || 'Cliente'}</span>
          </div>
          <nav className="sidebar-nav">
            <button 
          className={`nav-item ${vista === 'ferreterias' ? 'active' : ''}`}
          onClick={() => {setVista('ferreterias'); setFerreteriaSeleccionada(null);}}
            >
          <FaStore size={20} /> <span>Ferreterías</span>
            </button>
            <hr className="nav-divider" />
            <button 
          className={`nav-item ${vista === 'maestros' ? 'active' : ''}`}
          onClick={() => {setVista('maestros'); setMaestroSeleccionado(null);}}
            >
          <FaWrench size={20} /> <span>Maestros</span>
            </button>
            <hr className="nav-divider" />
            <button 
          className={`nav-item ${vista === 'pedidos' ? 'active' : ''}`}
          onClick={() => setVista('pedidos')}
            >
          <FaBox size={20} /> <span>Mis Pedidos</span>
            </button>
            <hr className="nav-divider" />
            <button 
          className={`nav-item ${vista === 'solicitudes' ? 'active' : ''}`}
          onClick={() => setVista('solicitudes')}
            >
          <FaClipboardList size={20} /> <span>Mis Solicitudes</span>
            </button>
            <hr className="nav-divider" />
            <button 
          className={`nav-item ${vista === 'estadisticas' ? 'active' : ''}`}
          onClick={() => setVista('estadisticas')}
            >
          <FaChartBar size={20} /> <span>Mis Estadísticas</span>
            </button>
            <hr className="nav-divider" />
            <button 
          className={`nav-item ${vista === 'perfil' ? 'active' : ''}`}
          onClick={() => setVista('perfil')}
            >
          <FaUser size={20} /> <span>Mi Perfil</span>
            </button>
            <hr className="nav-divider" />
            <button 
          className="nav-item logout"
          onClick={handleLogout}
          title="Cerrar Sesión"
            >
          <FaSignOutAlt size={20} /> <span>Cerrar Sesión</span>
            </button>
          </nav>
        </div>

        {/* Mobile Header - visible only on mobile */}
      <div className="mobile-header">
        <button 
          className="menu-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
        <h2>Construlink</h2>
      </div>

      {/* Mobile Menu - visible only when menu is open on mobile */}
      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-profile">
            <div className="avatar">
              {perfil?.fotoPerfil ? (
                <img 
                  src={`https://construlink-inky.vercel.app/uploads/${perfil.fotoPerfil}`}
                  alt="Perfil" 
                />
              ) : (
                <div className="avatar-placeholder">
                  {perfil?.nombre?.charAt(0) || 'C'}
                </div>
              )}
            </div>
            <span>{perfil?.nombre || 'Cliente'}</span>
          </div>
          <nav className="mobile-nav">
            <button onClick={() => {setVista('ferreterias'); setMenuOpen(false); setFerreteriaSeleccionada(null);}}>
              <FaStore /> Ferreterías
            </button>
            <button onClick={() => {setVista('maestros'); setMenuOpen(false); setMaestroSeleccionado(null);}}>
              <FaWrench /> Maestros
            </button>
            <button onClick={() => {setVista('pedidos'); setMenuOpen(false);}}>
              <FaBox /> Mis Pedidos
            </button>
            <button onClick={() => {setVista('solicitudes'); setMenuOpen(false);}}>
              <FaClipboardList /> Mis Solicitudes
            </button>
            <button onClick={() => {setVista('estadisticas'); setMenuOpen(false);}}>
              <FaChartBar /> Mis Estadísticas
            </button>
            <button onClick={() => {setVista('perfil'); setMenuOpen(false);}}>
              <FaUser /> Mi Perfil
            </button>
            <button onClick={handleLogout}>
              <FaSignOutAlt /> Cerrar Sesión
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <h1>
            {vista === 'ferreterias' ? 'Ferreterías Disponibles' : 
             vista === 'productos' ? `Productos de ${ferreteriaSeleccionada?.nombre || ''}` :
             vista === 'maestros' ? 'Maestros Disponibles' :
             vista === 'servicios' ? `Servicios de ${maestroSeleccionado?.nombre || ''}` :
             vista === 'pedidos' ? 'Mis Pedidos' :
             vista === 'solicitudes' ? 'Mis Solicitudes' :
             vista === 'estadisticas' ? 'Mis Estadísticas' :
             vista === 'perfil' ? 'Mi Perfil' : ''}
          </h1>
          {vista === 'productos' && ferreteriaSeleccionada && (
            <button 
              className="btn btn-secondary" 
              style={{marginLeft: '15px'}}
              onClick={() => {setVista('ferreterias'); setFerreteriaSeleccionada(null);}}
            >
              Volver a Ferreterías
            </button>
          )}
          {vista === 'servicios' && maestroSeleccionado && (
            <button 
              className="btn btn-secondary" 
              style={{marginLeft: '15px'}}
              onClick={() => {setVista('maestros'); setMaestroSeleccionado(null);}}
            >
              Volver a Maestros
            </button>
          )}
        </header>

        <div className="content-body">
          {vista === 'ferreterias' && <FerreteriasDisponibles onSeleccionarFerreteria={seleccionarFerreteria} />}
          {vista === 'productos' && <ProductosDisponibles ferreteriaId={ferreteriaSeleccionada?._id} />}
          {vista === 'maestros' && <MaestrosDisponibles onSeleccionarMaestro={seleccionarMaestro} />}
          {vista === 'servicios' && <ServiciosDisponibles maestroId={maestroSeleccionado?._id} />}
          {vista === 'pedidos' && <MisPedidos />}
          {vista === 'solicitudes' && <MisSolicitudes />}
          {vista === 'estadisticas' && <Estadisticas />}
          {vista === 'perfil' && (
            <div className="profile-container">
              {editandoPerfil ? (
                <PerfilCliente perfil={perfil} setPerfil={setPerfil} setEditando={setEditandoPerfil} />
              ) : (
                <div>
                  <h2>Información del Perfil</h2>
                  {perfil && (
                    <div>
                      <div className="text-center">
                        <div className="avatar" style={{ margin: '0 auto', width: '120px', height: '120px' }}>
                          {perfil?.fotoPerfil ? (
                            <img 
                              src={`https://construlink-inky.vercel.app/uploads/${perfil.fotoPerfil}`}
                              alt="Perfil" 
                            />
                          ) : (
                            <div className="avatar-placeholder" style={{ fontSize: '3rem' }}>
                              {perfil?.nombre?.charAt(0) || 'C'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ marginTop: '20px' }}>
                        <p><strong>Nombre:</strong> {perfil.nombre}</p>
                        <p><strong>Correo:</strong> {perfil.email}</p>
                        <p><strong>Teléfono:</strong> {perfil.telefono || 'No especificado'}</p>
                        <p><strong>Dirección:</strong> {perfil.direccion || 'No especificada'}</p>
                      </div>
                      <button 
                        className="btn" 
                        style={{ width: '100%', marginTop: '20px' }}
                        onClick={() => setEditandoPerfil(true)}
                      >
                        Editar Perfil
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardCliente;
