// src/pages/cliente/MisPedidos.jsx
import { useEffect, useState } from 'react';
import { pedidosAPI, getS3ImageUrl } from '../../services/api';
import { FaBox, FaStore, FaCalendarAlt, FaMoneyBillWave, FaTruck } from 'react-icons/fa';

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [productosMasComprados, setProductosMasComprados] = useState([]);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setLoading(true);
        console.log('Cargando pedidos del cliente...');
        
        const response = await pedidosAPI.getMisPedidos();
        
        console.log('Pedidos cargados:', response.data);
        setPedidos(response.data);
        
        // Calcular el total de pedidos
        setTotalPedidos(response.data.length);
        
        // Calcular los productos más comprados
        const contadorProductos = {};
        response.data.forEach(pedido => {
          const productoId = pedido.producto?._id;
          if (productoId) {
            if (!contadorProductos[productoId]) {
              contadorProductos[productoId] = {
                id: productoId,
                nombre: pedido.producto.nombre,
                count: 0,
                cantidad: 0
              };
            }
            contadorProductos[productoId].count += 1;
            contadorProductos[productoId].cantidad += pedido.cantidad;
          }
        });
        
        // Convertir el objeto en array y ordenar por cantidad de compras
        const productosOrdenados = Object.values(contadorProductos)
          .sort((a, b) => b.count - a.count)
          .slice(0, 3); // Top 3 productos
        
        setProductosMasComprados(productosOrdenados);
        
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
        setError('No fue posible cargar tus pedidos');
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, []);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return '#FFA500'; // naranja
      case 'en proceso': return '#3498db'; // azul
      case 'completado': return '#2ecc71'; // verde
      case 'cancelado': return '#e74c3c'; // rojo
      default: return '#7C7676'; // gris
    }
  };

  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <p>Cargando tus pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-center mb-4">Mis Pedidos</h2>
      
      {/* Estadísticas de Compras */}
      <div className="card mb-4">
        <div className="card-body">
          <h4>Mis Estadísticas de Compras</h4>
          <p><strong>Total de pedidos realizados:</strong> {totalPedidos}</p>
          
          {productosMasComprados.length > 0 && (
            <div>
              <h5>Productos que más has comprado:</h5>
              <ul>
                {productosMasComprados.map(producto => (
                  <li key={producto.id}>
                    <strong>{producto.nombre}</strong>: {producto.count} {producto.count > 1 ? 'veces' : 'vez'} 
                    (Total: {producto.cantidad} {producto.cantidad > 1 ? 'unidades' : 'unidad'})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {pedidos.length === 0 ? (
        <div className="text-center p-4">
          <p>No has realizado ningún pedido todavía.</p>
        </div>
      ) : (
        <div className="product-grid">
          {pedidos.map(pedido => (
            <div key={pedido._id} className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <FaBox className="me-2" /> Pedido #{pedido._id.substring(0, 8)}
                </div>
                <span 
                  style={{ 
                    backgroundColor: getEstadoColor(pedido.estado),
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '0.8rem'
                  }}
                >
                  {pedido.estado}
                </span>
              </div>
              
              <div className="p-3">
                {pedido.producto?.imagen && (
                  <div className="mb-3 text-center">
                    <img 
                      src={getS3ImageUrl(pedido.producto.imagen)} 
                      alt={pedido.producto?.nombre}
                      style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.png';
                      }}
                    />
                  </div>
                )}
                <h4>{pedido.producto?.nombre || "Producto no disponible"}</h4>
                <p><strong>Cantidad:</strong> {pedido.cantidad}</p>
                <p><strong>Precio:</strong> ${pedido.producto?.precio || "N/A"}</p>
                <p><strong>Total:</strong> ${pedido.producto?.precio ? pedido.producto.precio * pedido.cantidad : "N/A"}</p>
                
                <div className="mt-3">
                  <p>
                    <FaStore className="me-2" /> 
                    <strong>Ferretería:</strong> {pedido.ferreteria?.nombre || 'No disponible'}
                  </p>
                  <p>
                    <FaCalendarAlt className="me-2" /> 
                    <strong>Fecha:</strong> {formatFecha(pedido.createdAt || pedido.fecha)}
                  </p>
                  <p>
                    <FaTruck className="me-2" /> 
                    <strong>Dirección de entrega:</strong> {pedido.direccionEntrega}
                  </p>
                  <p>
                    <FaMoneyBillWave className="me-2" /> 
                    <strong>Estado:</strong> {pedido.estado || "Pendiente"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisPedidos;
