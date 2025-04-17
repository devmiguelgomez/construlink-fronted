import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      console.log("Verificando autenticación, token:", token ? "existe" : "no existe");
      
      if (token) {
        try {
          const res = await axios.get('https://construlink-inky.vercel.app/api/users/perfil', {
            headers: { Authorization: token }
          });
          console.log("Perfil obtenido:", res.data);
          setUser(res.data);
          setAuthenticated(true);
        } catch (error) {
          console.error('Error verificando autenticación:', error);
          localStorage.removeItem('token');
          setUser(null);
          setAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await axios.post('https://construlink-inky.vercel.app/api/users/login', credentials);
      console.log('Respuesta de login en AuthContext:', res.data);
      
      if (!res.data.token || !res.data.user) {
        throw new Error('Respuesta inválida del servidor');
      }
      
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setAuthenticated(true);
      return res.data.user;
    } catch (error) {
      console.error('Error en login de AuthContext:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAuthenticated(false);
  };

  const updateUser = (data) => {
    setUser(prev => ({...prev, ...data}));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      authenticated, 
      loading, 
      login, 
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
