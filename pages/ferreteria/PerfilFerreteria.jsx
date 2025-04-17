import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCamera } from 'react-icons/fa';
import { getS3ImageUrl } from '../../services/api';

const PerfilFerreteria = ({ perfil: perfilProp, setPerfil: setPerfilProp }) => {
  const [perfil, setPerfil] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    fotoPerfil: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (perfilProp) {
      setPerfil(perfilProp);
      setLoading(false);
    } else {
      const cargarPerfil = async () => {
        try {
          const res = await axios.get('https://construlink-inky.vercel.app/api/users/perfil', {
            headers: { Authorization: localStorage.getItem('token') },
          });
          setPerfil(res.data);
          if (setPerfilProp) setPerfilProp(res.data);
        } catch (err) {
          console.error("Error al cargar el perfil:", err);
        } finally {
          setLoading(false);
        }
      };
      cargarPerfil();
    }
  }, [perfilProp, setPerfilProp]);

  const handleChange = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPerfil({ ...perfil, fotoPerfil: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const guardarPerfil = async () => {
    const formData = new FormData();
    formData.append('nombre', perfil.nombre);
    formData.append('telefono', perfil.telefono);
    formData.append('direccion', perfil.direccion);
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
      alert('Perfil actualizado correctamente');
      if (setPerfilProp) setPerfilProp(res.data);
    } catch (err) {
      console.error("Error al actualizar:", err);
      alert('Error al actualizar el perfil');
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="profile-container">
      <h2 className="profile-title">Mi Perfil</h2>
      
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <div className="avatar ferreteria-avatar">
          {(preview || perfil.fotoPerfil) ? (
            <img 
              src={preview || `https://construlink-inky.vercel.app/uploads/${perfil.fotoPerfil}`}
              alt="Perfil" 
            />
          ) : (
            <div className="avatar-placeholder">
              {perfil?.nombre?.charAt(0)?.toUpperCase() || 'F'}
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
        <input 
          name="nombre" 
          value={perfil.nombre || ''} 
          placeholder="Nombre" 
          onChange={handleChange} 
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginBottom: '15px',
            width: '100%',
            fontSize: '1rem',
            backgroundColor: '#fafafa',
            color: '#333333'
          }}
        />
        <input 
          name="telefono" 
          value={perfil.telefono || ''} 
          placeholder="Teléfono" 
          onChange={handleChange} 
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginBottom: '15px',
            width: '100%',
            fontSize: '1rem',
            backgroundColor: '#fafafa',
            color: '#333333'
          }}
        />
        <input 
          name="direccion" 
          value={perfil.direccion || ''} 
          placeholder="Dirección" 
          onChange={handleChange} 
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginBottom: '15px',
            width: '100%',
            fontSize: '1rem',
            backgroundColor: '#fafafa',
            color: '#333333'
          }}
        />
        
        <button 
          onClick={guardarPerfil}
          style={{
            backgroundColor: '#984F40',
            color: 'white',
            border: 'none',
            padding: '14px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
            fontSize: '16px',
            marginTop: '10px',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};

export default PerfilFerreteria;
