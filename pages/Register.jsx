// src/pages/Register.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock, FaEnvelope, FaTools, FaWrench } from 'react-icons/fa';
import construlinkLogo from '../src/assets/construlink.jpg';
import '../src/styles/forms.css';

// Lista de especialidades comunes para maestros
const especialidades = [
  'Albañilería',
  'Carpintería',
  'Electricidad',
  'Fontanería',
  'Pintura',
  'Herrería',
  'Jardinería',
  'Construcción general',
  'Soldadura',
  'Instalación de pisos',
  'Instalación de drywall',
  'Acabados',
  'Plomería',
  'Cerrajería'
];

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener el rol de los parámetros de la URL
  const queryParams = new URLSearchParams(location.search);
  const roleFromUrl = queryParams.get('role');
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: roleFromUrl || 'cliente',
    especialidades: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Actualizar el rol cuando cambia la URL
  useEffect(() => {
    if (roleFromUrl) {
      setFormData(prevData => ({
        ...prevData,
        role: roleFromUrl
      }));
    }
  }, [roleFromUrl]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEspecialidadChange = (especialidad) => {
    setFormData(prevState => {
      // Verificar si la especialidad ya está seleccionada
      if (prevState.especialidades.includes(especialidad)) {
        // Si ya está seleccionada, eliminarla
        return {
          ...prevState,
          especialidades: prevState.especialidades.filter(esp => esp !== especialidad)
        };
      } else {
        // Si no está seleccionada, añadirla
        return {
          ...prevState,
          especialidades: [...prevState.especialidades, especialidad]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Eliminamos la confirmación de contraseña del objeto antes de enviarlo
      const dataToSend = { ...formData };
      delete dataToSend.passwordConfirm;
      
      // Convertir el array de especialidades a un string separado por comas
      if (dataToSend.role === 'maestro' && dataToSend.especialidades.length > 0) {
        dataToSend.especialidad = dataToSend.especialidades.join(', ');
      }
      delete dataToSend.especialidades;
      
      console.log('Enviando datos de registro:', dataToSend);
      
      const response = await axios.post('https://construlink-inky.vercel.app/api/users/register', dataToSend);
      console.log('Respuesta del servidor:', response.data);
      localStorage.setItem('token', response.data.token);
      
      // Redirigir según el rol seleccionado
      navigate(`/${formData.role}`);
    } catch (err) {
      console.error('Error al registrarse:', err);
      
      // Mostrar detalles más específicos del error
      if (err.response) {
        console.error('Respuesta del servidor:', err.response.data);
        setError(err.response.data.msg || err.response.data.message || 'Error en el registro');
      } else if (err.request) {
        console.error('Sin respuesta del servidor:', err.request);
        setError('No se recibió respuesta del servidor');
      } else {
        console.error('Error de configuración:', err.message);
        setError('Error al configurar la solicitud');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar el título según el rol
  const getTitleByRole = () => {
    switch(formData.role) {
      case 'ferreteria': return 'Registro de Ferretería';
      case 'maestro': return 'Registro de Maestro';
      default: return 'Registro de Cliente';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card form-container">
        <div className="auth-header">
          {/* Reemplaza el icono con la imagen importada */}
          <img 
            src={construlinkLogo}
            alt="Construlink Logo" 
            style={{ width: '100px', height: 'auto', marginBottom: '15px' }}
          />
          <h2>{getTitleByRole()}</h2>
        </div>

        {error && <div className="alert alert-danger form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre" className="form-label">
              <FaUser /> Nombre {formData.role === 'ferreteria' ? 'de la Ferretería' : 'Completo'}
            </label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="nombre"
                name="nombre"
                className="form-control"
                value={formData.nombre}
                onChange={handleChange}
                required
                autoComplete="name"
                placeholder={formData.role === 'ferreteria' ? 'Nombre de la ferretería' : 'Su nombre completo'}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FaEnvelope /> Correo Electrónico
            </label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
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
              <FaLock /> Contraseña
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
                minLength="6"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm" className="form-label">
              <FaLock /> Confirmar Contraseña
            </label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                className="form-control"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
                minLength="6"
                autoComplete="new-password"
                placeholder="Repita su contraseña"
              />
            </div>
          </div>

          {/* Campo oculto para el rol */}
          <input type="hidden" name="role" value={formData.role} />

          {/* Mostrar el selector de especialidades solo para maestros */}
          {formData.role === 'maestro' && (
            <div className="form-group">
              <label className="form-label">
                <FaWrench /> Especialidades
              </label>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
                Selecciona todas las especialidades que ofreces:
              </p>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '10px', 
                maxHeight: '150px',
                overflowY: 'auto',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: '#f9f9f9'
              }}>
                {especialidades.map(especialidad => (
                  <div key={especialidad} className="checkbox-container">
                    <input 
                      type="checkbox" 
                      id={`esp-${especialidad}`}
                      checked={formData.especialidades.includes(especialidad)}
                      onChange={() => handleEspecialidadChange(especialidad)}
                    />
                    <label htmlFor={`esp-${especialidad}`}>{especialidad}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mostrar el rol seleccionado */}
          <div className="form-group">
            <p>Registrándose como: <strong>{formData.role === 'ferreteria' ? 'Ferretería' : formData.role === 'maestro' ? 'Maestro' : 'Cliente'}</strong></p>
          </div>

          <button 
            type="submit" 
            className="form-button" 
            disabled={loading || (formData.role === 'maestro' && formData.especialidades.length === 0)}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          <p className="text-center mt-3">
            ¿Ya tienes cuenta? <Link to="/" style={{ color: '#984F40', fontWeight: 'bold' }}>Inicia Sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
