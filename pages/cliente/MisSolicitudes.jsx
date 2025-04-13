// src/pages/cliente/MisSolicitudes.jsx
import { useEffect, useState } from 'react';
import { solicitudesAPI } from '../../services/api';
import { FaTools, FaUser, FaMapMarkedAlt, FaMoneyBillWave } from 'react-icons/fa';

const MisSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalSolicitudes, setTotalSolicitudes] = useState(0);
  const [maestrosMasSolicitados, setMaestrosMasSolicitados] = useState([]);

  useEffect(() => {
    const cargarSolicitudes = async () => {
      try {
        setLoading(true);
        const response = await solicitudesAPI.getMisSolicitudes();
        
        setSolicitudes(response.data);
        setTotalSolicitudes(response.data.length);
        
        const contadorMaestros = {};
        response.data.forEach(solicitud => {
          const maestroId = solicitud.maestroId?._id;
          if (maestroId) {
            if (!contadorMaestros[maestroId]) {
              contadorMaestros[maestroId] = {
                id: maestroId,
                nombre: solicitud.maestroId.nombre,
                count: 0
              };
            }
            contadorMaestros[maestroId].count += 1;
          }
        });
        
        const maestrosOrdenados = Object.values(contadorMaestros)
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);
        
        setMaestrosMasSolicitados(maestrosOrdenados);
        
      } catch (err) {
        console.error("Error al cargar solicitudes:", err);
        setError("No fue posible cargar tus solicitudes");
      } finally {
        setLoading(false);
      }
    };
    
    cargarSolicitudes();
  }, []);

  if (loading) {
    return <div className="text-center">Cargando solicitudes...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h2>Mis Solicitudes de Servicio</h2>
      
      <div className="card mb-4">
        <div className="card-body">
          <h4>Mis Estadísticas de Servicios</h4>
          <p><strong>Total de servicios solicitados:</strong> {totalSolicitudes}</p>
          
          {maestrosMasSolicitados.length > 0 && (
            <div>
              <h5>Maestros a los que más has solicitado servicios:</h5>
              <ul>
                {maestrosMasSolicitados.map(maestro => (
                  <li key={maestro.id}>
                    <strong>{maestro.nombre}</strong>: {maestro.count} {maestro.count > 1 ? 'servicios' : 'servicio'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {solicitudes.length === 0 ? (
        <div className="text-center p-4">
          <p>No has realizado ninguna solicitud de servicio todavía.</p>
        </div>
      ) : (
        <div className="product-grid">
          {solicitudes.map(s => (
            <div key={s._id} className="card">
              <div className="card-header">
                <FaTools className="me-2" /> {s.servicioId?.nombreServicio || "Servicio no disponible"}
              </div>
              <div className="p-3">
                <p><FaUser className="me-2" /> <strong>Maestro:</strong> {s.maestroId?.nombre || "No disponible"}</p>
                <p><FaMapMarkedAlt className="me-2" /> <strong>Dirección:</strong> {s.direccion}</p>
                <p><FaMoneyBillWave className="me-2" /> <strong>Método de pago:</strong> {s.metodoPago || "No especificado"}</p>
                <p><strong>Mensaje:</strong> {s.mensaje || "Sin mensaje"}</p>
                <p>
                  <strong>Estado:</strong> 
                  <span style={{ 
                    marginLeft: '5px',
                    padding: '4px 8px',
                    backgroundColor: s.estado === 'completada' ? '#2ecc71' : 
                                    s.estado === 'aceptada' ? '#3498db' : 
                                    s.estado === 'rechazada' ? '#e74c3c' : '#f39c12',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}>
                    {s.estado || "Pendiente"}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisSolicitudes;
