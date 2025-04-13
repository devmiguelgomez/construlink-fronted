import { useEffect, useState } from 'react';
import { ferreteriasAPI, getS3ImageUrl } from '../../services/api';
import { FaStore, FaMapMarkerAlt, FaPhone, FaStar, FaInfoCircle } from 'react-icons/fa';

const FerreteriasDisponibles = ({ onSeleccionarFerreteria }) => {
  const [ferreterias, setFerreterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarFerreterias = async () => {
      try {
        setLoading(true);
        const response = await ferreteriasAPI.getAll();
        setFerreterias(response.data);
      } catch (err) {
        console.error("Error al obtener ferreterías:", err);
        setError("No fue posible cargar las ferreterías disponibles");
      } finally {
        setLoading(false);
      }
    };
    
    cargarFerreterias();
  }, []);

  if (loading) {
    return <div className="text-center">Cargando ferreterías disponibles...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="product-grid">
      {ferreterias.length === 0 ? (
        <div className="text-center p-4 w-100">
          <p>No hay ferreterías disponibles actualmente.</p>
        </div>
      ) : (
        ferreterias.map(ferreteria => (
          <div key={ferreteria._id} className="card">
            <div className="text-center p-3">
              <div className="avatar mb-3" style={{ width: '100px', height: '100px', margin: '0 auto' }}>
                {ferreteria.fotoPerfil ? (
                  <img 
                    src={getS3ImageUrl(ferreteria.fotoPerfil)} 
                    alt={ferreteria.nombre} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/store-placeholder.png';
                    }}
                  />
                ) : (
                  <div className="avatar-placeholder" style={{ fontSize: '2.5rem' }}>
                    <FaStore />
                  </div>
                )}
              </div>
              <h3>{ferreteria.nombre}</h3>
            </div>
            
            <div className="p-3">
              {ferreteria.direccion && (
                <p><FaMapMarkerAlt className="me-2" /> {ferreteria.direccion}</p>
              )}
              {ferreteria.telefono && (
                <p><FaPhone className="me-2" /> {ferreteria.telefono}</p>
              )}
              
              <div className="mt-3 mb-3">
                {ferreteria.rating ? (
                  <div>
                    <strong>Calificación: {ferreteria.rating.toFixed(1)}</strong>
                    <div>
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} style={{ 
                          color: i < Math.floor(ferreteria.rating) ? '#ffc107' : '#e4e5e9',
                          marginRight: '2px'
                        }} />
                      ))}
                      <span className="ms-1">({ferreteria.totalReviews || 0} reseñas)</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted">
                    <FaInfoCircle className="me-1" /> Sin calificaciones
                  </div>
                )}
              </div>
              
              <button 
                className="btn"
                style={{ width: '100%' }}
                onClick={() => onSeleccionarFerreteria(ferreteria)}
              >
                Ver Productos
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FerreteriasDisponibles;
