import { createContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Intentar obtener el perfil directamente como primera opción
        // ya que la ruta /users/verify no existe en el backend
        const profileResponse = await userAPI.getPerfil();
        if (profileResponse.data) {
          setUser(profileResponse.data);
          setAuthenticated(true);
          console.log("Perfil cargado exitosamente");
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
        
        // Intento alternativo con /auth/verify
        try {
          console.log('Intentando verificación alternativa...');
          const response = await authAPI.verifyToken();
          
          if (response.data && response.data.user) {
            setUser(response.data.user);
            setAuthenticated(true);
          } else {
            console.warn('No se recibieron datos de usuario válidos');
            localStorage.removeItem('token');
          }
        } catch (verifyError) {
          console.error("Error en la verificación alternativa:", verifyError);
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ authenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
