import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaTools, FaUser } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to={`/${user?.role}`} className="navbar-brand">
        <FaTools /> Construlink
      </Link>
      
      <div className="navbar-nav">
        <span className="nav-link">
          <FaUser /> {user?.nombre || user?.email || 'Usuario'}
        </span>
        <button onClick={handleLogout} className="nav-link" style={{background: 'transparent', border: 'none'}}>
          <FaSignOutAlt /> Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
