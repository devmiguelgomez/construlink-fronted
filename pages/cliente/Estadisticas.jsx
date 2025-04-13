import { useEffect, useState } from 'react';
import { estadisticasAPI } from '../../services/api';
import { FaChartBar, FaShoppingBag, FaTools, FaDollarSign, FaShoppingCart, FaHandshake } from 'react-icons/fa';

const Estadisticas = () => {
  const [estadisticas, setEstadisticas] = useState({
    totalPedidos: 0,
    totalSolicitudes: 0,
    gastoTotal: 0,
    productosMasComprados: [],
    maestrosMasSolicitados: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setLoading(true);
        
        // Usar el servicio de API centralizado
        const data = await estadisticasAPI.getEstadisticasCliente();
        
        // Procesar datos de pedidos
        const pedidos = data.pedidos;
        const totalPedidos = pedidos.length;
        
        let gastoTotal = 0;
        pedidos.forEach(pedido => {
          if (pedido.producto?.precio && pedido.cantidad) {
            gastoTotal += pedido.producto.precio * pedido.cantidad;
          }
        });
        
        // Calcular productos más comprados
        const contadorProductos = {};
        pedidos.forEach(pedido => {
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
        
        const productosMasComprados = Object.values(contadorProductos)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        // Procesar datos de solicitudes
        const solicitudes = data.solicitudes;
        const totalSolicitudes = solicitudes.length;
        
        // Calcular maestros más solicitados
        const contadorMaestros = {};
        solicitudes.forEach(solicitud => {
          const maestroId = solicitud.maestroId?._id;
          if (maestroId) {
            if (!contadorMaestros[maestroId]) {
              contadorMaestros[maestroId] = {
                id: maestroId,
                nombre: solicitud.maestroId.nombre || "Maestro",
                count: 0
              };
            }
            contadorMaestros[maestroId].count += 1;
          }
        });
        
        const maestrosMasSolicitados = Object.values(contadorMaestros)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        // Actualizar el estado
        setEstadisticas({
          totalPedidos,
          totalSolicitudes,
          gastoTotal,
          productosMasComprados,
          maestrosMasSolicitados
        });
      } catch (err) {
        console.error("Error al cargar estadísticas:", err);
        setError("No fue posible cargar tus estadísticas");
      } finally {
        setLoading(false);
      }
    };
    
    cargarEstadisticas();
  }, []);

  if (loading) {
    return <div className="text-center">Cargando estadísticas...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
        <h2 className="text-center mb-4">Mis Estadísticas</h2>
        
        {/* Tarjeta principal para resumen de actividad */}
        <div className="card mb-4">
            <div className="card-header" style={{ backgroundColor: '#984F41', color: 'white' }}>
                <h4><FaChartBar className="me-2" /> Resumen de Actividad</h4>
            </div>
            <div className="card-body">
                <div className="row">
                    {/* Productos comprados */}
                    <div className="col-md-4 mb-3">
                        <div className="card h-100" style={{ borderColor: '#FFFAFA', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            <div className="card-body text-center">
                                <div className="d-flex justify-content-center align-items-center">
                                    <FaShoppingCart size={28} color="#a65048" className="me-2" />
                                    <h5 className="m-0">Productos Comprados</h5>
                                </div>
                                <h3 style={{ color: '#333', fontWeight: 'bold', marginTop: '10px' }}>
                                    {estadisticas.totalPedidos}
                                </h3>
                            </div>
                        </div>
                    </div>
                    
                    {/* Servicios solicitados */}
                    <div className="col-md-4 mb-3">
                        <div className="card h-100" style={{ borderColor: '#FFFAFA', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            <div className="card-body text-center">
                                <div className="d-flex justify-content-center align-items-center">
                                    <FaHandshake size={28} color="#a65048" className="me-2" />
                                    <h5 className="m-0">Servicios Solicitados</h5>
                                </div>
                                <h3 style={{ color: '#333', fontWeight: 'bold', marginTop: '10px' }}>
                                    {estadisticas.totalSolicitudes}
                                </h3>
                            </div>
                        </div>
                    </div>
                    
                    {/* Gasto total */}
                    <div className="col-md-4 mb-3">
                        <div className="card h-100" style={{ borderColor: '#FFFAFA', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            <div className="card-body text-center">
                                <div className="d-flex justify-content-center align-items-center">
                                    <FaDollarSign size={28} color="#a65048" className="me-2" />
                                    <h5 className="m-0">Gasto Total</h5>
                                </div>
                                <h3 style={{ color: '#333', fontWeight: 'bold', marginTop: '10px' }}>
                                    ${estadisticas.gastoTotal.toLocaleString()}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="row">
            {/* Productos más comprados */}
            <div className="col-md-6 mb-4">
                <div className="card h-100">
                    <div className="card-header d-flex align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
                        <FaShoppingBag size={20} style={{ color: "#a65048", marginRight: "10px" }} />
                        <h4 className="mb-0">Productos Más Comprados</h4>
                    </div>
                    <div className="card-body">
                        {estadisticas.productosMasComprados.length > 0 ? (
                            <ul className="list-group list-group-flush">
                                {estadisticas.productosMasComprados.map((producto, index) => (
                                    <li key={producto.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <span className="badge rounded-pill me-2" style={{ backgroundColor: '#a65048' }}>{index + 1}</span>
                                            <span style={{ fontWeight: '500' }}>{producto.nombre}</span>
                                        </div>
                                        <span className="badge rounded-pill" style={{ backgroundColor: '#6c757d' }}>
                                            {producto.cantidad} unid. ({producto.count} {producto.count > 1 ? 'compras' : 'compra'})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-muted">No has realizado ninguna compra todavía.</p>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Maestros más solicitados */}
            <div className="col-md-6 mb-4">
                <div className="card h-100">
                    <div className="card-header d-flex align-items-center" style={{ backgroundColor: '#984F41', color: 'white' }}>
                        <FaTools size={20} style={{ color: "#FFFAFA", marginRight: "10px" }} />
                        <h4 className="mb-0">Maestros Más Solicitados</h4>
                    </div>
                    <div className="card-body">
                        {estadisticas.maestrosMasSolicitados.length > 0 ? (
                            <ul className="list-group list-group-flush">
                                {estadisticas.maestrosMasSolicitados.map((maestro, index) => (
                                    <li key={maestro.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <span className="badge rounded-pill me-2" style={{ backgroundColor: '#a65048' }}>{index + 1}</span>
                                            <span style={{ fontWeight: '500' }}>{maestro.nombre}</span>
                                        </div>
                                        <span className="badge rounded-pill" style={{ backgroundColor: '#6c757d' }}>
                                            {maestro.count} {maestro.count > 1 ? 'servicios' : 'servicio'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-muted">No has solicitado ningún servicio todavía.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Estadisticas;
