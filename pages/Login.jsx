// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock, FaTools } from 'react-icons/fa';
import construlinkLogo from '../src/assets/construlink.jpg';
import '../src/styles/forms.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''  // Este nombre debe coincidir con el controlador del backend
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Enviando datos de login:', formData);

      // Verificar que el email y la contraseña no estén vacíos
      if (!formData.email || !formData.password) {
        setError('Por favor ingrese su correo electrónico y contraseña');
        setLoading(false);
        return;
      }
      
      const response = await axios.post('https://construlink-inky.vercel.app/api/users/login', {
        email: formData.email.trim(),
        password: formData.password
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      // Almacenar el token en localStorage
      localStorage.setItem('token', response.data.token);
      
      // Verificar el rol del usuario
      const userRole = response.data.user?.role;
      console.log('Rol detectado:', userRole);
      
      // Forzar la redirección manualmente según el rol
      if (userRole === 'cliente') {
        window.location.href = '/cliente';
      } else if (userRole === 'ferreteria') {
        window.location.href = '/ferreteria';
      } else if (userRole === 'maestro') {
        window.location.href = '/maestro';
      } else {
        console.error('Rol no reconocido:', userRole);
        setError('Error: Rol no válido');
      }
    } catch (err) {
      console.error('Error de login:', err);
      if (err.response && err.response.status === 400) {
        setError(err.response.data.msg || 'Credenciales incorrectas');
      } else {
        setError('Error al conectar con el servidor. Intente de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card form-container">
        <div className="auth-header">
          <img 
            src={construlinkLogo}
            alt="Construlink Logo" 
            style={{ width: '120px', height: 'auto', marginBottom: '15px' }}
          />
          <h2>Iniciar Sesión en Construlink</h2>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="ejemplo@correo.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="Su contraseña"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="form-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="text-center mt-4">
            <p>¿No tienes cuenta? Regístrate como:</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', gap: '10px' }}>
              <button 
                type="button"
                onClick={() => navigate('/register?role=cliente')} 
                className="form-button"
                style={{ flex: 1, padding: '8px' }}
              >
                Cliente
              </button>
              <button 
                type="button"
                onClick={() => navigate('/register?role=ferreteria')} 
                className="form-button"
                style={{ flex: 1, padding: '8px' }}
              >
                Ferretería
              </button>
              <button 
                type="button"
                onClick={() => navigate('/register?role=maestro')} 
                className="form-button"
                style={{ flex: 1, padding: '8px' }}
              >
                Maestro
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
