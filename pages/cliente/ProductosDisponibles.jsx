// src/pages/cliente/ProductosDisponibles.jsx
import { useEffect, useState } from 'react';
import { productosAPI, pedidosAPI, userAPI } from '../../services/api';
import { FaStar, FaRegStar, FaComments } from 'react-icons/fa';

const ProductosDisponibles = ({ ferreteriaId }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrandoComentarios, setMostrandoComentarios] = useState(false);
  const [misPedidos, setMisPedidos] = useState([]);
  const [calificacion, setCalificacion] = useState(0);
  const [comentandoProducto, setComentandoProducto] = useState(false);
  const [comentarioTexto, setComentarioTexto] = useState("");
  const [misComentarios, setMisComentarios] = useState({});

  const [pedido, setPedido] = useState({
    direccion: '',
    contacto: '',
    cantidad: 1,
    metodoPago: ''
  });

  const cargarProductos = async () => {
    try {
      setLoading(true);
      
      let productosData;
      if (ferreteriaId) {
        const response = await productosAPI.getByFerreteria(ferreteriaId);
        productosData = response.data;
      } else {
        const response = await productosAPI.getAll();
        productosData = response.data;
      }
      
      const productosDisponibles = productosData.filter(p => p.cantidadDisponible > 0);
      setProductos(productosDisponibles);
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const misPedidosResponse = await pedidosAPI.getMisPedidos();
          const productosComprados = misPedidosResponse.data.map(pedido => pedido.producto?._id);
          setMisPedidos(productosComprados);

          const comentariosObj = {};
          for (const producto of productosData) {
            if (producto.comentarios && producto.comentarios.length > 0) {
              const perfilResponse = await userAPI.getPerfil();
              const clienteId = perfilResponse.data._id;
              const comentado = producto.comentarios.some(c => c.clienteId === clienteId);
              comentariosObj[producto._id] = comentado;
            } else {
              comentariosObj[producto._id] = false;
            }
          }
          
          setMisComentarios(comentariosObj);
        } catch (err) {
          console.error("Error al cargar pedidos:", err);
        }
      }
    } catch (err) {
      console.error("Error al obtener productos:", err);
      setError("No fue posible cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [ferreteriaId]);

  const haCompradoProducto = (productoId) => {
    return misPedidos.includes(productoId);
  };
  
  const yaComentado = (productoId) => {
    return misComentarios[productoId] || false;
  };
  
  const comentarProducto = async (productoId) => {
    if (!haCompradoProducto(productoId)) {
      alert("Solo puedes comentar productos que hayas comprado.");
      return;
    }
    
    if (yaComentado(productoId)) {
      alert("Ya has comentado y calificado este producto anteriormente.");
      return;
    }
    
    setProductoSeleccionado(productos.find(p => p._id === productoId));
    setCalificacion(0);
    setComentandoProducto(true);
  };

  const enviarComentarioYCalificacion = async () => {
    if (calificacion === 0) {
      alert("Por favor selecciona una calificación (1-5 estrellas)");
      return;
    }
    
    try {
      await productosAPI.comentar(productoSeleccionado._id, {
        texto: comentarioTexto.trim() || "Sin comentario",
        calificacion
      });
    
      alert("Calificación enviada correctamente");
      
      const updatedProducto = await productosAPI.getById(productoSeleccionado._id);
      setProductos(prev => prev.map(p => p._id === productoSeleccionado._id ? updatedProducto.data : p));
      
      setCalificacion(0);
      setComentarioTexto("");
      setComentandoProducto(false);
      setProductoSeleccionado(null);
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      alert("Error al enviar la calificación");
    }
  };
  
  const mostrarComentarios = async (producto) => {
    try {
      const response = await productosAPI.getById(producto._id);
      console.log("Producto con comentarios:", response.data);
      setProductoSeleccionado(response.data);
      setMostrandoComentarios(true);
    } catch (error) {
      console.error("Error al obtener detalles del producto:", error);
      setProductoSeleccionado(producto);
      setMostrandoComentarios(true);
    }
  };
  
  const hacerPedido = async (productoId) => {
    const producto = productos.find(p => p._id === productoId);
    if (!producto) return;
    
    setProductoSeleccionado(producto);
    setPedido({
      direccion: '',
      contacto: '',
      cantidad: 1,
      metodoPago: ''
    });
    
    const modal = document.getElementById("pedidoModal");
    modal.style.display = "block";
  };
  
  const cerrarModal = () => {
    const modal = document.getElementById("pedidoModal");
    const comentariosModal = document.getElementById("comentariosModal");
    
    if (modal) modal.style.display = "none";
    if (comentariosModal) comentariosModal.style.display = "none";
    
    setProductoSeleccionado(null);
    setMostrandoComentarios(false);
  };
  
  const handlePedidoChange = (e) => {
    setPedido({
      ...pedido,
      [e.target.name]: e.target.value
    });
  };
  
  const enviarPedido = async () => {
    if (!pedido.direccion || !pedido.contacto || !pedido.metodoPago) {
      alert("Por favor, completa todos los campos obligatorios");
      return;
    }
    
    const cantidadNum = parseInt(pedido.cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      alert("Por favor, ingresa una cantidad válida");
      return;
    }

    if (cantidadNum > productoSeleccionado.cantidadDisponible) {
      alert(`Solo hay ${productoSeleccionado.cantidadDisponible} unidades disponibles`);
      return;
    }
    
    try {
      console.log("Enviando pedido:", {
        productoId: productoSeleccionado._id,
        cantidad: cantidadNum,
        direccionEntrega: pedido.direccion,
        contactoCliente: pedido.contacto,
        metodoPago: pedido.metodoPago
      });

      await pedidosAPI.crear({
        productoId: productoSeleccionado._id, 
        cantidad: cantidadNum, 
        direccionEntrega: pedido.direccion, 
        contactoCliente: pedido.contacto,
        metodoPago: pedido.metodoPago
      });

      setProductos(prevProductos => 
        prevProductos.map(p => 
          p._id === productoSeleccionado._id 
            ? { ...p, cantidadDisponible: p.cantidadDisponible - cantidadNum }
            : p
        ).filter(p => p.cantidadDisponible > 0)
      );
      
      setMisPedidos(prev => [...prev, productoSeleccionado._id]);

      alert("Pedido enviado correctamente");
      cerrarModal();
    } catch (error) {
      console.error("Error al hacer pedido:", error);
      alert("Error al enviar el pedido: " + (error.response?.data?.msg || "Error desconocido"));
    }
  };
  
  const StarRating = ({ rating, setRating }) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, i) => (
          <span 
            key={i} 
            onClick={() => setRating(i + 1)}
            style={{ cursor: 'pointer', color: i < rating ? '#ffc107' : '#e4e5e9', fontSize: '1.5rem' }}
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
        <p>Cargando productos...</p>
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
    <section>
      <div className="product-grid">
        {productos.map(p => (
          <div className="card" key={p._id}>
            {p.imagen && (
              <div className="card-image">
                <img src={`https://construlink-inky.vercel.app/uploads/${p.imagen}`} alt={p.nombre} />
              </div>
            )}
            <h3>{p.nombre}</h3>
            <p><strong>Descripción:</strong> {p.descripcion}</p>
            <p><strong>Disponible:</strong> {p.cantidadDisponible}</p>
            <p><strong>Contacto:</strong> {p.contacto}</p>
            <p><strong>Precio:</strong> ${p.precio}</p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button 
                onClick={() => mostrarComentarios(p)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                <FaComments style={{ marginRight: '5px' }} />
                Ver Comentarios ({p.comentarios?.length || 0})
              </button>
              
              {haCompradoProducto(p._id) ? (
                <button 
                  onClick={() => comentarProducto(p._id)}
                  className={`btn btn-secondary ${yaComentado(p._id) ? 'disabled' : ''}`}
                  style={{ flex: 1, opacity: yaComentado(p._id) ? 0.6 : 1 }}
                  disabled={yaComentado(p._id)}
                  title={yaComentado(p._id) ? "Ya has comentado este producto" : ""}
                >
                  {yaComentado(p._id) ? 'Ya Comentado' : 'Comentar'}
                </button>
              ) : (
                <button 
                  onClick={() => hacerPedido(p._id)}
                  className="btn"
                  style={{ flex: 1 }}
                  disabled={p.cantidadDisponible <= 0}
                >
                  {p.cantidadDisponible > 0 ? 'Pedir producto' : 'Agotado'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {productos.length === 0 && (
        <div className="text-center p-4">
          <p>No hay productos disponibles</p>
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
          {productoSeleccionado && (
            <div>
              <h3>Comentarios para {productoSeleccionado.nombre}</h3>
              
              {productoSeleccionado.comentarios && productoSeleccionado.comentarios.length > 0 ? (
                <div>
                  {productoSeleccionado.comentarios.map((comentario, index) => (
                    <div key={index} style={{ 
                      border: '1px solid #F4F1F1', 
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
                <p>No hay comentarios para este producto.</p>
              )}
              
              {haCompradoProducto(productoSeleccionado._id) && (
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
                      comentarProducto(productoSeleccionado._id);
                    }}
                  >
                    Comentar este producto
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div id="pedidoModal" className="modal" style={{ 
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
          {productoSeleccionado && (
            <div>
              <h3>Realizar Pedido: {productoSeleccionado.nombre}</h3>
              <p><strong>Precio:</strong> ${productoSeleccionado.precio}</p>
              <p><strong>Disponible:</strong> {productoSeleccionado.cantidadDisponible} unidades</p>
              
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label htmlFor="cantidad">Cantidad: *</label>
                <input
                  type="number"
                  id="cantidad"
                  name="cantidad"
                  className="form-control"
                  value={pedido.cantidad}
                  onChange={handlePedidoChange}
                  min="1"
                  max={productoSeleccionado.cantidadDisponible}
                  required
                />
              </div>
              
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label htmlFor="direccion">Dirección de entrega: *</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  className="form-control"
                  value={pedido.direccion}
                  onChange={handlePedidoChange}
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
                  value={pedido.contacto}
                  onChange={handlePedidoChange}
                  required
                />
              </div>
              
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label htmlFor="metodoPago">Método de pago: *</label>
                <select
                  id="metodoPago"
                  name="metodoPago"
                  className="form-control"
                  value={pedido.metodoPago}
                  onChange={handlePedidoChange}
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
              
              <div className="form-group" style={{ marginTop: '10px' }}>
                <p><strong>Total a pagar:</strong> ${productoSeleccionado.precio * pedido.cantidad}</p>
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
                  onClick={enviarPedido}
                  className="btn"
                  style={{ flex: 1 }}
                >
                  Confirmar Pedido
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comentandoProducto && (
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
            <span className="close" onClick={() => setComentandoProducto(false)} style={{
              color: '#aaa',
              float: 'right',
              fontSize: '28px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>&times;</span>
            
            <h3>Calificar Producto</h3>
            <h4>{productoSeleccionado?.nombre}</h4>
            
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
                onClick={() => setComentandoProducto(false)}
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
    </section>
  );
};

export default ProductosDisponibles;
