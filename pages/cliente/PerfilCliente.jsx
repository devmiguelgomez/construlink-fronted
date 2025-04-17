import { useState } from 'react';
import axios from 'axios';
import { FaCamera } from 'react-icons/fa';
import '../../src/styles/forms.css';

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
          {(preview || perfilProp?.fotoPerfil) ? (
            <img 
              src={preview || `https://construlink-inky.vercel.app/uploads/${perfilProp.fotoPerfil}`}
              alt="Perfil" 
              style={{ 
                width: '150px', 
                height: '150px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: '3px solid #F4F1F1',
                boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
              }} 
            />
          ) : (
            <div 
              style={{ 
                width: '150px', 
                height: '150px', 
                borderRadius: '50%', 
                backgroundColor: '#f1c40f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              {perfilProp?.nombre?.charAt(0) || 'C'}
            </div>
          )}
          <label htmlFor="fotoPerfil" style={{ 
            position: 'absolute', 
            bottom: '5px', 
            right: '5px',
            backgroundColor: '#984F40',
            color: 'white',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
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
        <div className="form-group">
          <label htmlFor="nombre" className="form-label">Nombre</label>
          <input 
            type="text"
            id="nombre"
            name="nombre" 
            className="form-control"
            value={perfil.nombre || ''} 
            onChange={handleChange} 
            placeholder="Su nombre completo"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="telefono" className="form-label">Teléfono</label>
          <input 
            type="text"
            id="telefono"
            name="telefono" 
            className="form-control"
            value={perfil.telefono || ''} 
            onChange={handleChange} 
            placeholder="Número de contacto"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="direccion" className="form-label">Dirección</label>
          <input 
            type="text"
            id="direccion"
            name="direccion" 
            className="form-control"
            value={perfil.direccion || ''} 
            onChange={handleChange} 
            placeholder="Su dirección"
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
            className="form-button"
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
