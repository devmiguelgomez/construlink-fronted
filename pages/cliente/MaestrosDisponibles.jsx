import { useEffect, useState } from 'react';
import { maestrosAPI, getS3ImageUrl } from '../../services/api';
import { FaTools, FaMapMarkerAlt, FaPhone, FaStar, FaInfoCircle } from 'react-icons/fa';

const MaestrosDisponibles = ({ onSeleccionarMaestro }) => {
  const [maestros, setMaestros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarMaestros = async () => {
      try {
        setLoading(true);
        const response = await maestrosAPI.getAll();
        setMaestros(response.data);
      } catch (err) {
        console.error("Error al obtener maestros:", err);
        setError("No fue posible cargar los maestros disponibles");
      } finally {
        setLoading(false);
      }
    };
    
    cargarMaestros();
  }, []);

  if (loading) {
    return <div className="text-center">Cargando maestros disponibles...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="product-grid">
      {maestros.length === 0 ? (
        <div className="text-center p-4 w-100">
          <p style={{color: '#333333'}}>No hay maestros disponibles actualmente.</p>
        </div>
      ) : (
        maestros.map(maestro => (
          <div key={maestro._id} className="card">
            <div className="text-center p-3">
              <div className="avatar mb-3" style={{ width: '100px', height: '100px', margin: '0 auto' }}>
                {maestro.fotoPerfil ? (
                  <img 
                    src={getS3ImageUrl(maestro.fotoPerfil)} 
                    alt={maestro.nombre} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/user-placeholder.png';
                    }}
                  />
                ) : (
                  <div className="avatar-placeholder" style={{ fontSize: '2.5rem' }}>
                    {maestro.nombre.charAt(0)}
                  </div>
                )}
              </div>
              <h3 style={{color: '#333333'}}>{maestro.nombre}</h3>
              {maestro.especialidad && (
                <div className="badge bg-secondary mb-2" style={{backgroundColor: '#984F40', color: '#FFFFFF'}}>
                  <FaTools className="me-1" /> {maestro.especialidad}
                </div>
              )}
            </div>
            
            <div className="p-3">
              {maestro.direccion && (
                <p style={{color: '#333333'}}><FaMapMarkerAlt className="me-2" style={{color: '#984F40'}} /> {maestro.direccion}</p>
              )}
              {maestro.telefono && (
                <p style={{color: '#333333'}}><FaPhone className="me-2" style={{color: '#984F40'}} /> {maestro.telefono}</p>
              )}
              
              <div className="mt-3 mb-3">
                {maestro.rating ? (
                  <div>
                    <strong style={{color: '#333333'}}>Calificación: {maestro.rating.toFixed(1)}</strong>
                    <div>
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} style={{ 
                          color: i < Math.floor(maestro.rating) ? '#ffc107' : '#e4e5e9',
                          marginRight: '2px'
                        }} />
                      ))}
                      <span className="ms-1" style={{color: '#333333'}}>({maestro.totalReviews || 0} reseñas)</span>
                    </div>
                  </div>
                ) : (
                  <div style={{color: '#666666'}}>
                    <FaInfoCircle className="me-1" /> Sin calificaciones
                  </div>
                )}
              </div>
              
              <button 
                className="btn"
                style={{ width: '100%' }}
                onClick={() => onSeleccionarMaestro(maestro)}
              >
                Ver Servicios
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MaestrosDisponibles;
