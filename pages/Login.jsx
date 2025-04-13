// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock, FaTools } from 'react-icons/fa';
import construlinkLogo from '../src/assets/construlink.jpg';

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
      
      const response = await axios.post('https://construlink-mu.vercel.app/api/users/login', {
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
      <div className="auth-card">
      <div className="auth-header">
          {/* Reemplaza el icono con la imagen importada */}
          <img 
            src={construlinkLogo} // Asegúrate que la ruta sea correcta desde la carpeta public o ajusta la importación si está en src
            alt="Construlink Logo" 
            style={{ width: '100px', height: 'auto', marginBottom: '15px' }} // Ajusta el tamaño según necesites
          />
          <h2>Iniciar Sesión en Construlink</h2>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <FaUser /> Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock /> Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="btn" 
            style={{ width: '100%', marginBottom: '25px', backgroundColor: '#984F40', color: 'white', padding: '14px' }}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="text-center mb-4">
            <p>¿No tienes cuenta? Regístrate como:</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', gap: '10px' }}>
              <button 
                type="button" // Añadir type="button" para que no envíe el formulario
                onClick={() => navigate('/register?role=cliente')} 
                style={{ flex: 1, backgroundColor: '#984F40', color: 'white', padding: '10px', border: 'none', borderRadius: '4px' }}
              >
                Cliente
              </button>
              <button 
                type="button" // Añadir type="button" para que no envíe el formulario
                onClick={() => navigate('/register?role=ferreteria')} 
                style={{ flex: 1, backgroundColor: '#984F40', color: 'white', padding: '10px', border: 'none', borderRadius: '4px' }}
              >
                Ferretería
              </button>
              <button 
                type="button" // Añadir type="button" para que no envíe el formulario
                onClick={() => navigate('/register?role=maestro')} 
                style={{ flex: 1, backgroundColor: '#984F40', color: 'white', padding: '10px', border: 'none', borderRadius: '4px' }}
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
