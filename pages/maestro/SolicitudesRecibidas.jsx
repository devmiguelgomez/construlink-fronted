import { useEffect, useState } from 'react';
import { solicitudesAPI } from '../../services/api';
import { FaUser, FaTools, FaMapMarkerAlt, FaPhone, FaCheck, FaTimes } from 'react-icons/fa';

const SolicitudesRecibidas = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarSolicitudes = async () => {
      try {
        setLoading(true);
        const response = await solicitudesAPI.getSolicitudesRecibidas();
        console.log('Solicitudes recibidas:', response.data);
        setSolicitudes(response.data);
      } catch (err) {
        console.error('Error al cargar solicitudes:', err);
        setError('No fue posible cargar las solicitudes');
      } finally {
        setLoading(false);
      }
    };
    
    cargarSolicitudes();
  }, []);

  const actualizarEstado = async (solicitudId, nuevoEstado) => {
    try {
      const response = await solicitudesAPI.cambiarEstado(solicitudId, nuevoEstado);
      
      // Actualizar el estado local después de la respuesta exitosa
      setSolicitudes(prevSolicitudes => 
        prevSolicitudes.map(s => 
          s._id === solicitudId ? { ...s, estado: nuevoEstado } : s
        )
      );
      
      alert(`Solicitud ${nuevoEstado} exitosamente`);
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert('Error al cambiar el estado de la solicitud');
    }
  };

  if (loading) {
    return <div className="text-center">Cargando solicitudes...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h2>Solicitudes de Servicio Recibidas</h2>
      
      {solicitudes.length === 0 ? (
        <div className="alert alert-info mt-4">
          No has recibido solicitudes de servicio todavía.
        </div>
      ) : (
        <div className="solicitudes-grid">
          {solicitudes.map(solicitud => (
            <div key={solicitud._id} className="card mb-3">
              <div className="card-header" style={{ 
                backgroundColor: solicitud.estado === 'aceptada' ? '#28a745' : 
                                 solicitud.estado === 'rechazada' ? '#dc3545' : 
                                 solicitud.estado === 'completada' ? '#17a2b8' : '#ffc107',
                color: 'white'
              }}>
                <FaTools className="me-2" />
                {solicitud.servicioId?.nombreServicio || "Servicio no disponible"}
              </div>
              <div className="card-body">
                <h5 className="card-title">
                  <FaUser className="me-2" /> Cliente: {solicitud.clienteId?.nombre || "Cliente"}
                </h5>
                <p className="card-text">
                  <FaMapMarkerAlt className="me-2" /> Dirección: {solicitud.direccion}
                </p>
                <p className="card-text">
                  <FaPhone className="me-2" /> Contacto: {solicitud.contacto}
                </p>
                {solicitud.mensaje && (
                  <p className="card-text">
                    Mensaje: {solicitud.mensaje}
                  </p>
                )}
                <p className="card-text">
                  Método de pago: {solicitud.metodoPago}
                </p>
                <p className="card-text">
                  Estado actual: 
                  <span className="badge" style={{ 
                    backgroundColor: solicitud.estado === 'aceptada' ? '#28a745' : 
                                    solicitud.estado === 'rechazada' ? '#dc3545' : 
                                    solicitud.estado === 'completada' ? '#17a2b8' : '#ffc107',
                    color: 'white',
                    marginLeft: '5px',
                    padding: '5px 10px'
                  }}>
                    {solicitud.estado || "pendiente"}
                  </span>
                </p>
                
                {/* Mostrar botones de acción según estado */}
                {solicitud.estado === 'pendiente' && (
                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn btn-success flex-grow-1"
                      onClick={() => actualizarEstado(solicitud._id, 'aceptada')}
                    >
                      <FaCheck className="me-1" /> Aceptar
                    </button>
                    <button
                      className="btn btn-danger flex-grow-1"
                      onClick={() => actualizarEstado(solicitud._id, 'rechazada')}
                    >
                      <FaTimes className="me-1" /> Rechazar
                    </button>
                  </div>
                )}
                {solicitud.estado === 'aceptada' && (
                  <button
                    className="btn btn-info w-100 mt-3"
                    onClick={() => actualizarEstado(solicitud._id, 'completada')}
                  >
                    <FaCheck className="me-1" /> Marcar como completada
                  </button>
                )}
              </div>
              <div className="card-footer text-muted">
                Fecha de solicitud: {new Date(solicitud.fecha || solicitud.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SolicitudesRecibidas;
