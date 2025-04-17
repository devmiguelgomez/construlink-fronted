import { useEffect, useState } from 'react';
import { serviciosAPI } from '../../services/api';
import { FaStar, FaRegStar, FaComments, FaTrash, FaEye, FaHandshake } from 'react-icons/fa';

const MisServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [nuevoServicio, setNuevoServicio] = useState({ 
    nombreServicio: '', 
    descripcion: '', 
    tipo: '', 
    precio: '' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [mostrandoComentarios, setMostrandoComentarios] = useState(false);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      const response = await serviciosAPI.getMisServicios();
      console.log("Servicios cargados:", response.data);
      setServicios(response.data);
    } catch (err) {
      console.error('Error al cargar servicios:', err);
      setError('No se pudieron cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const crearServicio = async () => {
    if (!nuevoServicio.nombreServicio || !nuevoServicio.precio) {
      alert('Por favor, completa al menos el nombre y precio del servicio');
      return;
    }

    try {
      await serviciosAPI.crear(nuevoServicio);
      
      setNuevoServicio({ 
        nombreServicio: '', 
        descripcion: '', 
        tipo: '', 
        precio: '' 
      });
      
      cargarServicios();
      alert('Servicio creado exitosamente');
    } catch (error) {
      console.error('Error al crear servicio:', error);
      alert('Error al crear el servicio');
    }
  };

  const eliminarServicio = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      try {
        await serviciosAPI.eliminar(id);
        cargarServicios();
        alert('Servicio eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el servicio');
      }
    }
  };

  const verComentarios = async (servicio) => {
    try {
      const response = await serviciosAPI.getById(servicio._id);
      console.log("Servicio con comentarios:", response.data);
      setServicioSeleccionado(response.data);
      setMostrandoComentarios(true);
    } catch (error) {
      console.error("Error al obtener detalles del servicio:", error);
      setServicioSeleccionado(servicio);
      setMostrandoComentarios(true);
    }
  };

  const cerrarModal = () => {
    setMostrandoComentarios(false);
    setServicioSeleccionado(null);
  };

  const calcularPromedio = (comentarios) => {
    if (!comentarios || comentarios.length === 0) return 0;
    const suma = comentarios.reduce((acc, c) => acc + (c.calificacion || 0), 0);
    return (suma / comentarios.length).toFixed(1);
  };

  if (loading) return <div>Cargando servicios...</div>;

  return (
    <div>
      <div className="card mb-4">
        <div className="card-header">
          <h3>Crear nuevo servicio</h3>
        </div>
        <div className="card-body">
          <div className="form-group mb-3">
            <label htmlFor="nombreServicio">Nombre del servicio</label>
            <input
              type="text"
              id="nombreServicio"
              className="form-control"
              value={nuevoServicio.nombreServicio}
              onChange={(e) => setNuevoServicio({...nuevoServicio, nombreServicio: e.target.value})}
              placeholder="Ej: Instalación de drywall"
            />
          </div>
          
          <div className="form-group mb-3">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              className="form-control"
              value={nuevoServicio.descripcion}
              onChange={(e) => setNuevoServicio({...nuevoServicio, descripcion: e.target.value})}
              placeholder="Descripción detallada del servicio"
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-group mb-3">
            <label htmlFor="tipo">Tipo de servicio</label>
            <select
              id="tipo"
              className="form-control"
              value={nuevoServicio.tipo}
              onChange={(e) => setNuevoServicio({...nuevoServicio, tipo: e.target.value})}
            >
              <option value="">Seleccione un tipo</option>
              <option value="Obra blanca">Obra blanca</option>
              <option value="Obra gris">Obra gris</option>
              <option value="Plomería">Plomería</option>
              <option value="Electricidad">Electricidad</option>
              <option value="Carpintería">Carpintería</option>
              <option value="Pintura">Pintura</option>
              <option value="Jardinería">Jardinería</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          
          <div className="form-group mb-3">
            <label htmlFor="precio">Precio (COP)</label>
            <input
              type="number"
              id="precio"
              className="form-control"
              value={nuevoServicio.precio}
              onChange={(e) => setNuevoServicio({...nuevoServicio, precio: e.target.value})}
              placeholder="Ej: 150000"
            />
          </div>
          
          <button 
            className="btn" 
            style={{ width: '100%' }} 
            onClick={crearServicio}
          >
            Crear Servicio
          </button>
        </div>
      </div>

      <h3>Mis Servicios</h3>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {servicios.length > 0 ? (
        <div className="product-grid">
          {servicios.map(s => (
            <div key={s._id} className="card">
              <h4>{s.nombreServicio}</h4>
              <p><strong>Tipo:</strong> {s.tipo || 'No especificado'}</p>
              <p><strong>Descripción:</strong> {s.descripcion || 'Sin descripción'}</p>
              <p><strong>Precio:</strong> ${s.precio || 0}</p>
              
              {/* Estadísticas de visualizaciones y solicitudes */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaEye style={{ marginRight: '5px', color: '#3498db' }} />
                  <span style={{ color: '#333333', fontWeight: 500 }}>{s.visualizaciones || 0} visualizaciones</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaHandshake style={{ marginRight: '5px', color: '#27ae60' }} />
                  <span style={{ color: '#333333', fontWeight: 500 }}>{s.totalSolicitudes || 0} solicitudes</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                <div style={{ marginRight: '10px' }}>
                  <strong>Calificación: </strong>
                  <span>{calcularPromedio(s.comentarios)}</span>
                </div>
                <div>
                  {[...Array(5)].map((_, i) => {
                    const promedio = calcularPromedio(s.comentarios);
                    return (
                      <span key={i} style={{ color: i < promedio ? '#ffc107' : '#F4F1F1' }}>
                        {i < promedio ? <FaStar /> : <FaRegStar />}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              <div style={{ display: 'flex', marginTop: '15px', gap: '10px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => verComentarios(s)}
                >
                  <FaComments style={{ marginRight: '5px' }} /> 
                  Ver Comentarios ({s.comentarios?.length || 0})
                </button>
                <button 
                  className="btn" 
                  style={{ flex: 1, backgroundColor: '#e74c3c' }}
                  onClick={() => eliminarServicio(s._id)}
                >
                  <FaTrash style={{ marginRight: '5px' }} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          No tienes servicios registrados. ¡Crea tu primer servicio!
        </div>
      )}

      {/* Modal para ver comentarios */}
      {mostrandoComentarios && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span className="close" onClick={cerrarModal}>&times;</span>
            {servicioSeleccionado && (
              <div>
                <h3>Comentarios para {servicioSeleccionado.nombreServicio}</h3>
                
                {servicioSeleccionado.comentarios && servicioSeleccionado.comentarios.length > 0 ? (
                  <div>
                    {servicioSeleccionado.comentarios.map((comentario, index) => (
                      <div key={index} className="comment-container">
                        <div className="comment-header">
                          <strong className="comment-author">{comentario.cliente || "Cliente anónimo"}</strong>
                          <div className="comment-rating">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < comentario.calificacion ? "star-filled" : "star-empty"}>
                                {i < comentario.calificacion ? <FaStar /> : <FaRegStar />}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="comment-body">
                          {comentario.texto === "Sin comentario" ? (
                            <em className="comment-no-text">El cliente solo dejó calificación</em>
                          ) : (
                            <p className="comment-text">{comentario.texto}</p>
                          )}
                        </div>
                        <p className="comment-date">
                          {comentario.fecha ? new Date(comentario.fecha).toLocaleString() : "Fecha no disponible"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#333333' }}>No hay comentarios para este servicio.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MisServicios;
