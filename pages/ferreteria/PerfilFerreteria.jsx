import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCamera } from 'react-icons/fa';
import '../../src/styles/forms.css';

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
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ color: '#984F40', textAlign: 'center' }}>Mi Perfil</h2>
      
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {(preview || perfil.fotoPerfil) ? (
            <img 
              src={preview || `https://construlink-inky.vercel.app/uploads/${perfil.fotoPerfil}`}
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
              {perfil?.nombre?.charAt(0) || 'F'}
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
          <label htmlFor="nombre" className="form-label">Nombre de la ferretería</label>
          <input 
            id="nombre"
            name="nombre" 
            value={perfil.nombre || ''} 
            placeholder="Nombre" 
            onChange={handleChange} 
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefono" className="form-label">Teléfono de contacto</label>
          <input 
            id="telefono"
            name="telefono" 
            value={perfil.telefono || ''} 
            placeholder="Teléfono" 
            onChange={handleChange} 
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="direccion" className="form-label">Dirección</label>
          <input 
            id="direccion"
            name="direccion" 
            value={perfil.direccion || ''} 
            placeholder="Dirección" 
            onChange={handleChange} 
            className="form-control"
          />
        </div>
        
        <button 
          onClick={guardarPerfil}
          className="form-button"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default PerfilFerreteria;
