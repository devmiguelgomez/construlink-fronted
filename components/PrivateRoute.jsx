// src/components/PrivateRoute.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
  const { authenticated, loading, user } = useContext(AuthContext);
  
  console.log("PrivateRoute:", { authenticated, loading, userRole: user?.role, expectedRole: role });

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  // Si no está autenticado, redirigir al login
  if (!authenticated || !user) {
    console.log("No autenticado, redirigiendo a /");
    return <Navigate to="/" replace />;
  }

  // Verificar si el usuario tiene el rol adecuado para la ruta
  if (role && user.role !== role) {
    console.log(`Rol incorrecto: esperaba ${role}, tiene ${user.role}`);
    // Redirigir al dashboard correspondiente al rol del usuario
    return <Navigate to={`/${user.role}`} replace />;
  }

  console.log("Acceso permitido");
  return children;
};

export default PrivateRoute;
