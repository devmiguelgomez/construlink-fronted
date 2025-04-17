import { useState } from 'react';
import axios from 'axios';
import { FaCamera, FaWrench } from 'react-icons/fa';
import { getS3ImageUrl } from '../../services/api';

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

const PerfilMaestro = ({ perfil: perfilProp, setPerfil: setPerfilProp, setEditando }) => {
  // Convertir la cadena de especialidades a un array
  const especialidadesIniciales = perfilProp?.especialidad 
    ? perfilProp.especialidad.split(', ').map(esp => esp.trim())
    : [];

  const [perfil, setPerfil] = useState({
    nombre: perfilProp?.nombre || '',
    telefono: perfilProp?.telefono || '',
    direccion: perfilProp?.direccion || '',
    especialidades: especialidadesIniciales,
    fotoPerfil: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleEspecialidadChange = (especialidad) => {
    setPerfil(prevState => {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPerfil({ ...perfil, fotoPerfil: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const guardarPerfil = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('nombre', perfil.nombre);
    formData.append('telefono', perfil.telefono);
    formData.append('direccion', perfil.direccion);
    
    // Convertir el array de especialidades a una cadena
    if (perfil.especialidades.length > 0) {
      formData.append('especialidad', perfil.especialidades.join(', '));
    } else {
      formData.append('especialidad', '');
    }

    if (perfil.fotoPerfil && perfil.fotoPerfil instanceof File) {
      formData.append('fotoPerfil', perfil.fotoPerfil);
    }

    try {
      const res = await axios.put('https://construlink-inky.vercel.app/api/users/perfil', formData, {
        headers: { 
          Authorization: localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data'
        },
      });
      setPerfilProp(res.data);
      setEditando(false);
      alert('Perfil actualizado correctamente');
    } catch (err) {
      console.error("Error al actualizar:", err);
      alert('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const cancelarEdicion = () => {
    setEditando(false);
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">Editar Perfil</h2>
      
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <div className="avatar maestro-avatar">
          {(preview || perfilProp?.fotoPerfil) ? (
            <img 
              src={preview || `https://construlink-inky.vercel.app/uploads/${perfilProp.fotoPerfil}`}
              alt="Perfil" 
            />
          ) : (
            <div className="avatar-placeholder">
              {perfilProp?.nombre?.charAt(0)?.toUpperCase() || 'M'}
            </div>
          )}
          <label htmlFor="fotoPerfil" className="avatar-upload-button">
            <FaCamera />
          </label>
          <input 
            id="fotoPerfil" 
            type="file" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
        </div>
      </div>

      <div>
        <div className="form-group mb-3">
          <label htmlFor="nombre" style={{color: '#333333', fontWeight: 500}}>Nombre</label>
          <input 
            type="text"
            id="nombre"
            name="nombre" 
            className="form-control"
            value={perfil.nombre || ''} 
            onChange={handleChange} 
            style={{
              color: '#333333',
              backgroundColor: '#fafafa'
            }}
          />
        </div>
        
        <div className="form-group mb-3">
          <label htmlFor="telefono" style={{color: '#333333', fontWeight: 500}}>Teléfono</label>
          <input 
            type="text"
            id="telefono"
            name="telefono" 
            className="form-control"
            value={perfil.telefono || ''} 
            onChange={handleChange}
            style={{
              color: '#333333',
              backgroundColor: '#fafafa'
            }}
          />
        </div>
        
        <div className="form-group mb-3">
          <label htmlFor="direccion" style={{color: '#333333', fontWeight: 500}}>Dirección</label>
          <input 
            type="text"
            id="direccion"
            name="direccion" 
            className="form-control"
            value={perfil.direccion || ''} 
            onChange={handleChange}
            style={{
              color: '#333333',
              backgroundColor: '#fafafa'
            }}
          />
        </div>
        
        <div className="form-group mb-3">
          <label style={{color: '#333333', fontWeight: 500}}>
            <FaWrench style={{ marginRight: '5px' }} />
            Especialidades
          </label>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px', 
            maxHeight: '150px',
            overflowY: 'auto',
            padding: '10px',
            border: '1px solid #F4F1F1',
            borderRadius: '4px',
            marginTop: '5px'
          }}>
            {especialidades.map(especialidad => (
              <div 
                key={especialidad} 
                style={{ 
                  display: 'inline-block'
                }}
              >
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}>
                  <input 
                    type="checkbox" 
                    checked={perfil.especialidades.includes(especialidad)}
                    onChange={() => handleEspecialidadChange(especialidad)}
                    style={{ marginRight: '5px' }}
                  />
                  {especialidad}
                </label>
              </div>
            ))}
          </div>
          {perfil.especialidades.length === 0 && (
            <p style={{ color: '#e74c3c', fontSize: '0.9rem', marginTop: '5px' }}>
              Debes seleccionar al menos una especialidad
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button 
            onClick={cancelarEdicion}
            className="btn btn-secondary"
            style={{ flex: 1 }}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            onClick={guardarPerfil}
            className="btn"
            style={{ flex: 1 }}
            disabled={loading || perfil.especialidades.length === 0}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerfilMaestro;
