import { useState } from 'react';
import axios from 'axios';
import { FaCamera } from 'react-icons/fa';
import { getS3ImageUrl } from '../../services/api';

const PerfilCliente = ({ perfil: perfilProp, setPerfil: setPerfilProp, setEditando }) => {
  const [perfil, setPerfil] = useState({
    nombre: perfilProp?.nombre || '',
    telefono: perfilProp?.telefono || '',
    direccion: perfilProp?.direccion || '',
    fotoPerfil: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
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
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ color: '#984F40', textAlign: 'center' }}>Editar Perfil</h2>
      
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div className="avatar cliente-avatar">
            {(preview || perfilProp?.fotoPerfil) ? (
              <img 
                src={preview || `https://construlink-inky.vercel.app/uploads/${perfilProp.fotoPerfil}`}
                alt="Perfil" 
              />
            ) : (
              <div className="avatar-placeholder">
                {perfilProp?.nombre?.charAt(0)?.toUpperCase() || 'C'}
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
      </div>

      <div>
        <div className="form-group mb-3">
          <label htmlFor="nombre" style={{color: '#333333'}}>Nombre</label>
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
          <label htmlFor="telefono" style={{color: '#333333'}}>Teléfono</label>
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
          <label htmlFor="direccion" style={{color: '#333333'}}>Dirección</label>
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
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerfilCliente;
