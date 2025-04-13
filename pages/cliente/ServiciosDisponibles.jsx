import { useEffect, useState } from 'react';
import { serviciosAPI, solicitudesAPI, userAPI } from '../../services/api';
import { FaStar, FaRegStar, FaComments, FaMoneyBill, FaCreditCard } from 'react-icons/fa';

const ServiciosDisponibles = ({ maestroId }) => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [mostrandoComentarios, setMostrandoComentarios] = useState(false);
  const [misServicios, setMisServicios] = useState([]);
  const [calificacion, setCalificacion] = useState(0);
  const [perfil, setPerfil] = useState(null);
  const [misComentarios, setMisComentarios] = useState({});
  
  const [solicitud, setSolicitud] = useState({
    direccion: '',
    contacto: '',
    mensaje: '',
    metodoPago: ''
  });

  const [comentandoServicio, setComentandoServicio] = useState(false);
  const [comentarioTexto, setComentarioTexto] = useState("");

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let serviciosData;
        if (maestroId) {
          const response = await serviciosAPI.getByMaestro(maestroId);
          serviciosData = response.data;
        } else {
          const response = await serviciosAPI.getAll();
          serviciosData = response.data;
        }
        
        setServicios(serviciosData);
        
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const misSolicitudesResponse = await solicitudesAPI.getMisSolicitudes();
            const serviciosAdquiridos = misSolicitudesResponse.data.map(solicitud => solicitud.servicioId?._id);
            setMisServicios(serviciosAdquiridos);
            
            const comentariosObj = {};
            for (const servicio of serviciosData) {
              if (servicio.comentarios && servicio.comentarios.length > 0) {
                const perfilResponse = await userAPI.getPerfil();
                const clienteId = perfilResponse.data._id;
                
                const comentado = servicio.comentarios.some(c => c.clienteId === clienteId);
                comentariosObj[servicio._id] = comentado;
              } else {
                comentariosObj[servicio._id] = false;
              }
            }
            
            setMisComentarios(comentariosObj);
          } catch (err) {
            console.error("Error al cargar servicios adquiridos:", err);
          }
        }
      } catch (err) {
        if (err.response) {
          setError(`Error: ${err.response.status} - ${err.response.data.msg || 'No se pudieron cargar los servicios'}`);
        } else if (err.request) {
          setError("No se pudo conectar con el servidor. Por favor, intente más tarde.");
        } else {
          setError("Error al preparar la solicitud. Por favor, intente más tarde.");
        }
      } finally {
        setLoading(false);
      }
    };

    const cargarPerfil = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const perfilResponse = await userAPI.getPerfil();
          setPerfil(perfilResponse.data);
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      }
    };

    fetchServicios();
    cargarPerfil();
  }, [maestroId]);
  
  const haAdquiridoServicio = (servicioId) => {
    return misServicios.includes(servicioId);
  };
  
  const yaComentado = (servicioId) => {
    return misComentarios[servicioId] || false;
  };
  
  const comentarServicio = async (servicioId) => {
    if (!haAdquiridoServicio(servicioId)) {
      alert("Solo puedes comentar servicios que hayas adquirido.");
      return;
    }
    
    if (yaComentado(servicioId)) {
      alert("Ya has comentado y calificado este servicio anteriormente.");
      return;
    }
    
    setServicioSeleccionado(servicios.find(s => s._id === servicioId));
    setCalificacion(0);
    setComentandoServicio(true);
  };

  const enviarComentarioYCalificacion = async () => {
    if (calificacion === 0) {
      alert("Por favor selecciona una calificación (1-5 estrellas)");
      return;
    }
    
    try {
      await serviciosAPI.comentar(servicioSeleccionado._id, {
        texto: comentarioTexto.trim() || "Sin comentario",
        calificacion
      });
    
      alert("Calificación enviada correctamente");
      
      const response = await serviciosAPI.getById(servicioSeleccionado._id);
      setServicios(prev => prev.map(s => s._id === servicioSeleccionado._id ? response.data : s));
      
      setCalificacion(0);
      setComentarioTexto("");
      setComentandoServicio(false);
      setServicioSeleccionado(null);
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      alert("Error al enviar la calificación");
    }
  };
  
  const mostrarComentarios = async (servicio) => {
    try {
      const response = await serviciosAPI.getById(servicio._id);
      setServicioSeleccionado(response.data);
      setMostrandoComentarios(true);
    } catch (error) {
      console.error("Error al obtener detalles del servicio:", error);
      setServicioSeleccionado(servicio);
      setMostrandoComentarios(true);
    }
  };
  
  const solicitarServicio = async (servicioId) => {
    setSolicitud({
      direccion: '',
      contacto: '',
      mensaje: '',
      metodoPago: ''
    });
    
    const servicio = servicios.find(s => s._id === servicioId);
    if (!servicio) return;
    
    setServicioSeleccionado(servicio);
    
    const modal = document.getElementById("solicitudModal");
    modal.style.display = "block";
  };
  
  const cerrarModal = () => {
    const modal = document.getElementById("solicitudModal");
    modal.style.display = "none";
    setServicioSeleccionado(null);
    setMostrandoComentarios(false);
  };
  
  const handleSolicitudChange = (e) => {
    setSolicitud({
      ...solicitud,
      [e.target.name]: e.target.value
    });
  };
  
  const enviarSolicitud = async () => {
    if (!solicitud.direccion || !solicitud.contacto || !solicitud.metodoPago) {
      alert("Por favor, completa todos los campos obligatorios");
      return;
    }
    
    try {
      await solicitudesAPI.crear({
        servicioId: servicioSeleccionado._id,
        direccion: solicitud.direccion,
        contacto: solicitud.contacto,
        mensaje: solicitud.mensaje,
        metodoPago: solicitud.metodoPago
      });

      alert("Solicitud enviada correctamente");
      cerrarModal();
      
      setMisServicios(prev => [...prev, servicioSeleccionado._id]);
    } catch (error) {
      console.error("Error al solicitar servicio:", error);
      alert("Error al enviar la solicitud: " + (error.response?.data?.msg || "Error desconocido"));
    }
  };
  
  const StarRating = ({ rating, setRating }) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, i) => (
          <span 
            key={i} 
            onClick={() => setRating(i + 1)}
            style={{ cursor: 'pointer', color: i < rating ? '#ffc107' : '#F4F1F1', fontSize: '1.5rem' }}
          >
            {i < rating ? <FaStar /> : <FaRegStar />}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <p>Cargando servicios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-sm"
          style={{ backgroundColor: '#984F40', color: 'white', marginTop: '10px' }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="product-grid">
        {servicios.map(s => (
          <div key={s._id} className="card">
            <h3>{s.nombreServicio}</h3>
            <p><strong>Tipo:</strong> {s.tipo}</p>
            <p><strong>Descripción:</strong> {s.descripcion}</p>
            <p><strong>Precio:</strong> ${s.precio}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button 
                onClick={() => mostrarComentarios(s)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                <FaComments style={{ marginRight: '5px' }} />
                Ver Comentarios ({s.comentarios?.length || 0})
              </button>
              {haAdquiridoServicio(s._id) ? (
                <button 
                  onClick={() => comentarServicio(s._id)}
                  className={`btn btn-secondary ${yaComentado(s._id) ? 'disabled' : ''}`}
                  style={{ flex: 1, opacity: yaComentado(s._id) ? 0.6 : 1 }}
                  disabled={yaComentado(s._id)}
                  title={yaComentado(s._id) ? "Ya has comentado este servicio" : ""}
                >
                  {yaComentado(s._id) ? 'Ya Comentado' : 'Comentar'}
                </button>
              ) : (
                <button 
                  onClick={() => solicitarServicio(s._id)}
                  className="btn"
                  style={{ flex: 1 }}
                >
                  Solicitar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {servicios.length === 0 && (
        <div className="text-center p-4">
          <p>No hay servicios disponibles actualmente.</p>
        </div>
      )}
      
      <div id="comentariosModal" className="modal" style={{ 
        display: mostrandoComentarios ? 'block' : 'none',
        position: 'fixed',
        zIndex: 1000,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        overflow: 'auto',
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}>
        <div className="modal-content" style={{
          backgroundColor: '#F4F1F1',
          margin: '15% auto',
          padding: '20px',
          border: '1px solid #7C7676',
          width: '80%',
          maxWidth: '600px',
          borderRadius: '8px'
        }}>
          <span className="close" onClick={cerrarModal} style={{
            color: '#aaa',
            float: 'right',
            fontSize: '28px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>&times;</span>
          {servicioSeleccionado && (
            <div>
              <h3>Comentarios para {servicioSeleccionado.nombreServicio}</h3>
              
              {servicioSeleccionado.comentarios && servicioSeleccionado.comentarios.length > 0 ? (
                <div>
                  {servicioSeleccionado.comentarios.map((comentario, index) => (
                    <div key={index} style={{ 
                      border: '1px solid #ddd', 
                      padding: '10px', 
                      margin: '10px 0',
                      borderRadius: '5px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>{comentario.cliente || "Cliente anónimo"}</strong>
                        <div>
                          {[...Array(5)].map((_, i) => (
                            <span key={i} style={{ color: i < comentario.calificacion ? '#ffc107' : '#F4F1F1' }}>
                              {i < comentario.calificacion ? <FaStar /> : <FaRegStar />}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p style={{ marginTop: '5px' }}>
                        {comentario.texto === "Sin comentario" ? 
                          <em style={{ color: '#7C7676' }}>Solo dejó calificación</em> : 
                          comentario.texto
                        }
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#7C7676', marginBottom: 0 }}>
                        {comentario.fecha ? new Date(comentario.fecha).toLocaleString() : "Fecha no disponible"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No hay comentarios para este servicio.</p>
              )}
              
              {haAdquiridoServicio(servicioSeleccionado._id) && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Añadir un comentario</h4>
                  <div style={{ marginBottom: '10px' }}>
                    <label>Tu calificación:</label>
                    <StarRating rating={calificacion} setRating={setCalificacion} />
                  </div>
                  <button 
                    className="btn" 
                    style={{ marginTop: '10px' }} 
                    onClick={() => {
                      cerrarModal();
                      comentarServicio(servicioSeleccionado._id);
                    }}
                  >
                    Comentar este servicio
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div id="solicitudModal" className="modal" style={{ 
        display: 'none',
        position: 'fixed',
        zIndex: 1000,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        overflow: 'auto',
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}>
        <div className="modal-content" style={{
          backgroundColor: '#F4F1F1',
          margin: '10% auto',
          padding: '20px',
          border: '1px solid #7C7676',
          width: '80%',
          maxWidth: '600px',
          borderRadius: '8px'
        }}>
          <span className="close" onClick={cerrarModal} style={{
            color: '#aaa',
            float: 'right',
            fontSize: '28px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>&times;</span>
          {servicioSeleccionado && (
            <div>
              <h3>Solicitar Servicio: {servicioSeleccionado.nombreServicio}</h3>
              <p><strong>Precio:</strong> ${servicioSeleccionado.precio}</p>
              
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label htmlFor="direccion">Dirección para el servicio: *</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  className="form-control"
                  value={solicitud.direccion}
                  onChange={handleSolicitudChange}
                  required
                />
              </div>
              
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label htmlFor="contacto">Tu contacto: *</label>
                <input
                  type="text"
                  id="contacto"
                  name="contacto"
                  className="form-control"
                  value={solicitud.contacto}
                  onChange={handleSolicitudChange}
                  required
                />
              </div>
              
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label htmlFor="mensaje">Mensaje para el maestro:</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  className="form-control"
                  value={solicitud.mensaje}
                  onChange={handleSolicitudChange}
                  rows="3"
                />
              </div>
              
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label htmlFor="metodoPago">Método de pago: *</label>
                <select
                  id="metodoPago"
                  name="metodoPago"
                  className="form-control"
                  value={solicitud.metodoPago}
                  onChange={handleSolicitudChange}
                  required
                >
                  <option value="">Seleccione un método de pago</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia bancaria</option>
                  <option value="tarjeta">Tarjeta de crédito/débito</option>
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">Daviplata</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  onClick={cerrarModal}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={enviarSolicitud}
                  className="btn"
                  style={{ flex: 1 }}
                >
                  Enviar Solicitud
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comentandoServicio && (
        <div className="modal" style={{ 
          display: 'block',
          position: 'fixed',
          zIndex: 1000,
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          overflow: 'auto',
          backgroundColor: 'rgba(0,0,0,0.4)',
        }}>
          <div className="modal-content" style={{
            backgroundColor: '#F4F1F1',
            margin: '15% auto',
            padding: '20px',
            border: '1px solid #7C7676',
            width: '80%',
            maxWidth: '500px',
            borderRadius: '8px'
          }}>
            <span className="close" onClick={() => setComentandoServicio(false)} style={{
              color: '#aaa',
              float: 'right',
              fontSize: '28px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>&times;</span>
            
            <h3>Calificar Servicio</h3>
            <h4>{servicioSeleccionado?.nombreServicio}</h4>
            
            <div style={{ marginBottom: '20px' }}>
              <label><strong>Tu calificación:</strong> <span className="text-danger">*</span></label>
              <div style={{ marginTop: '10px' }}>
                <StarRating rating={calificacion} setRating={setCalificacion} />
              </div>
              {calificacion === 0 && <small style={{ color: 'red' }}>La calificación es obligatoria</small>}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label><strong>Tu comentario:</strong> (opcional)</label>
              <textarea 
                className="form-control"
                value={comentarioTexto}
                onChange={(e) => setComentarioTexto(e.target.value)}
                placeholder="Escribe tu comentario aquí (opcional)"
                rows="4"
                style={{ marginTop: '10px' }}
              />
            </div>
            
            <div className="d-flex gap-2">
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => setComentandoServicio(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn" 
                style={{ flex: 1 }}
                onClick={enviarComentarioYCalificacion}
                disabled={calificacion === 0}
              >
                Enviar Calificación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiciosDisponibles;
