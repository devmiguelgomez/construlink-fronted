import { useEffect, useState } from 'react';
import { pedidosAPI, getS3ImageUrl } from '../../services/api';
import { FaBox, FaUser, FaMapMarkerAlt, FaPhone, FaMoneyBillWave, FaTruck, FaCheck } from 'react-icons/fa';

const PedidosRecibidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setLoading(true);
        const response = await pedidosAPI.getPedidosRecibidos();
        console.log('Pedidos recibidos:', response.data);
        setPedidos(response.data);
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
        setError('No fue posible cargar los pedidos');
      } finally {
        setLoading(false);
      }
    };
    
    cargarPedidos();
  }, []);

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      const response = await pedidosAPI.cambiarEstado(pedidoId, nuevoEstado);
      
      // Actualizar estado local
      setPedidos(prevPedidos => 
        prevPedidos.map(p => 
          p._id === pedidoId ? { ...p, estado: nuevoEstado } : p
        )
      );
      
      alert(`Pedido actualizado a "${nuevoEstado}" exitosamente`);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('Error al actualizar el estado del pedido');
    }
  };

  if (loading) {
    return <div className="text-center">Cargando pedidos...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h2>Pedidos Recibidos</h2>
      
      {pedidos.length === 0 ? (
        <div className="alert alert-info mt-4">
          No has recibido pedidos todavía.
        </div>
      ) : (
        <div className="pedidos-grid">
          {pedidos.map(pedido => (
            <div key={pedido._id} className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center" style={{ 
                backgroundColor: 
                  pedido.estado === 'completado' ? '#28a745' : 
                  pedido.estado === 'en proceso' ? '#17a2b8' : 
                  pedido.estado === 'cancelado' ? '#dc3545' : '#ffc107',
                color: 'white'
              }}>
                <div><FaBox className="me-2" /> Pedido #{pedido._id.substring(0, 8)}</div>
                <span>{pedido.estado || "pendiente"}</span>
              </div>
              
              <div className="card-body">
                {pedido.producto?.imagen && (
                  <div className="text-center mb-3">
                    <img 
                      src={getS3ImageUrl(pedido.producto.imagen)} 
                      alt={pedido.producto?.nombre}
                      style={{ maxHeight: '100px', maxWidth: '100%' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.png';
                      }}
                    />
                  </div>
                )}
                
                <h5 className="card-title">{pedido.producto?.nombre || "Producto no disponible"}</h5>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p><strong>Cantidad:</strong> {pedido.cantidad}</p>
                    <p><strong>Precio unitario:</strong> ${pedido.producto?.precio}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Total:</strong> ${pedido.producto?.precio * pedido.cantidad}</p>
                    <p><strong>Método de pago:</strong> {pedido.metodoPago}</p>
                  </div>
                </div>
                
                <div className="cliente-info p-3 mb-3" style={{ backgroundColor: '#F4F1F1', borderRadius: '5px' }}>
                  <h6><FaUser className="me-2" />Información del cliente</h6>
                  <p className="mb-1"><strong>Cliente:</strong> {pedido.cliente?.nombre || "Cliente"}</p>
                  <p className="mb-1"><FaMapMarkerAlt className="me-2" /><strong>Dirección:</strong> {pedido.direccionEntrega}</p>
                  <p className="mb-1"><FaPhone className="me-2" /><strong>Contacto:</strong> {pedido.contactoCliente}</p>
                </div>
                
                {/* Botones de acción según estado */}
                {pedido.estado === 'pendiente' && (
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary flex-grow-1"
                      onClick={() => cambiarEstado(pedido._id, 'en proceso')}
                    >
                      <FaTruck className="me-1" /> Iniciar proceso
                    </button>
                    <button 
                      className="btn btn-danger flex-grow-1"
                      onClick={() => cambiarEstado(pedido._id, 'cancelado')}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                
                {pedido.estado === 'en proceso' && (
                  <button 
                    className="btn btn-success w-100"
                    onClick={() => cambiarEstado(pedido._id, 'completado')}
                  >
                    <FaCheck className="me-1" /> Marcar como completado
                  </button>
                )}
              </div>
              
              <div className="card-footer text-muted">
                Fecha del pedido: {new Date(pedido.createdAt || pedido.fecha).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PedidosRecibidos;
