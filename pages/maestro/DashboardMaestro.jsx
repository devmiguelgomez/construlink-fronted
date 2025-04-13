import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import MisServicios from './MisServicios';
import SolicitudesRecibidas from './SolicitudesRecibidas';
import PerfilMaestro from './PerfilMaestro';
import { FaTools, FaEnvelope, FaUser, FaSignOutAlt, FaHardHat } from 'react-icons/fa';

const DashboardMaestro = () => {
  const [vista, setVista] = useState('servicios');
  const [perfil, setPerfil] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-container">
          <FaHardHat size={30} />
          <h2>Construlink</h2>
        </div>
        <div className="profile-brief">
          <div className="avatar">
            {perfil?.fotoPerfil ? (
              <img 
                src={`https://construlink-mu.vercel.app/uploads/${perfil.fotoPerfil}`}
                alt="Perfil" 
              />
            ) : (
              <div className="avatar-placeholder">
                {perfil?.nombre?.charAt(0) || 'M'}
              </div>
            )}
          </div>
          <span>{perfil?.nombre || 'Maestro'}</span>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${vista === 'servicios' ? 'active' : ''}`}
            onClick={() => setVista('servicios')}
          >
            <FaTools /> <span>Mis Servicios</span>
          </button>
          <button 
            className={`nav-item ${vista === 'solicitudes' ? 'active' : ''}`}
            onClick={() => setVista('solicitudes')}
          >
            <FaEnvelope /> <span>Solicitudes</span>
          </button>
          <button 
            className={`nav-item ${vista === 'perfil' ? 'active' : ''}`}
            onClick={() => setVista('perfil')}
          >
            <FaUser /> <span>Mi Perfil</span>
          </button>
          <button 
            className="nav-item logout"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> <span>Cerrar Sesión</span>
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
                  src={`http://localhost:5000/uploads/${perfil.fotoPerfil}`}
                  alt="Perfil" 
                />
              ) : (
                <div className="avatar-placeholder">
                  {perfil?.nombre?.charAt(0) || 'M'}
                </div>
              )}
            </div>
            <span>{perfil?.nombre || 'Maestro'}</span>
          </div>
          <nav className="mobile-nav">
            <button onClick={() => {setVista('servicios'); setMenuOpen(false)}}>
              <FaTools /> Mis Servicios
            </button>
            <button onClick={() => {setVista('solicitudes'); setMenuOpen(false)}}>
              <FaEnvelope /> Solicitudes
            </button>
            <button onClick={() => {setVista('perfil'); setMenuOpen(false)}}>
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
          <h1>{
            vista === 'servicios' ? 'Mis Servicios' : 
            vista === 'solicitudes' ? 'Solicitudes Recibidas' : 
            'Mi Perfil'
          }</h1>
        </header>

        <div className="content-body">
          {vista === 'servicios' && <MisServicios />}
          {vista === 'solicitudes' && <SolicitudesRecibidas />}
          {vista === 'perfil' && (
            <div className="profile-container">
              {editandoPerfil ? (
                <PerfilMaestro perfil={perfil} setPerfil={setPerfil} setEditando={setEditandoPerfil} />
              ) : (
                <div>
                  <h2>Información del Perfil</h2>
                  {perfil && (
                    <div>
                      <div className="text-center">
                        <div className="avatar" style={{ margin: '0 auto', width: '120px', height: '120px' }}>
                          {perfil?.fotoPerfil ? (
                            <img 
                              src={`http://localhost:5000/uploads/${perfil.fotoPerfil}`}
                              alt="Perfil" 
                            />
                          ) : (
                            <div className="avatar-placeholder" style={{ fontSize: '3rem' }}>
                              {perfil?.nombre?.charAt(0) || 'M'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ marginTop: '20px' }}>
                        <p><strong>Nombre:</strong> {perfil.nombre}</p>
                        <p><strong>Correo:</strong> {perfil.email}</p>
                        <p><strong>Teléfono:</strong> {perfil.telefono || 'No especificado'}</p>
                        <p><strong>Dirección:</strong> {perfil.direccion || 'No especificada'}</p>
                        <p><strong>Especialidades:</strong> {perfil.especialidad || 'No especificada'}</p>
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

export default DashboardMaestro;
