import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import MisProductos from './MisProductos';
import PedidosRecibidos from './PedidosRecibidos';
import PerfilFerreteria from './PerfilFerreteria';
import Publicaciones from './Publicaciones';
import { FaUser, FaBox, FaShoppingBag, FaSignOutAlt, FaStore } from 'react-icons/fa';

const DashboardFerreteria = () => {
  const [vista, setVista] = useState('perfil');
  const [perfil, setPerfil] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
          <FaStore size={30} />
          <h2>Construlink</h2>
        </div>
        <div className="profile-brief">
          <div className="avatar">
            {perfil?.fotoPerfil ? (
              <img 
                src={`https://construlink-inky.vercel.app/uploads/${perfil.fotoPerfil}`}
                alt="Perfil" 
              />
            ) : (
              <div className="avatar-placeholder">
                {perfil?.nombre?.charAt(0) || 'F'}
              </div>
            )}
          </div>
          <span>{perfil?.nombre || 'Ferretería'}</span>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${vista === 'perfil' ? 'active' : ''}`}
            onClick={() => setVista('perfil')}
          >
            <FaUser /> <span>Perfil</span>
          </button>
          <button 
            className={`nav-item ${vista === 'publicaciones' ? 'active' : ''}`}
            onClick={() => setVista('publicaciones')}
          >
            <FaBox /> <span>Publicaciones</span>
          </button>
          <button 
            className={`nav-item ${vista === 'pedidos' ? 'active' : ''}`}
            onClick={() => setVista('pedidos')}
          >
            <FaShoppingBag /> <span>Pedidos</span>
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
                  src={`https://construlink-inky.vercel.app/uploads/${perfil.fotoPerfil}`}
                  alt="Perfil" 
                />
              ) : (
                <div className="avatar-placeholder">
                  {perfil?.nombre?.charAt(0) || 'F'}
                </div>
              )}
            </div>
            <span>{perfil?.nombre || 'Ferretería'}</span>
          </div>
          <nav className="mobile-nav">
            <button onClick={() => {setVista('perfil'); setMenuOpen(false)}}>
              <FaUser /> Perfil
            </button>
            <button onClick={() => {setVista('publicaciones'); setMenuOpen(false)}}>
              <FaBox /> Publicaciones
            </button>
            <button onClick={() => {setVista('pedidos'); setMenuOpen(false)}}>
              <FaShoppingBag /> Pedidos
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
            vista === 'perfil' ? 'Mi Perfil' : 
            vista === 'publicaciones' ? 'Mis Publicaciones' : 
            'Pedidos Recibidos'
          }</h1>
        </header>

        <div className="content-body">
          {vista === 'perfil' && <PerfilFerreteria perfil={perfil} setPerfil={setPerfil} />}
          {vista === 'publicaciones' && <Publicaciones />}
          {vista === 'pedidos' && <PedidosRecibidos />}
        </div>
      </main>
    </div>
  );
};

export default DashboardFerreteria;
