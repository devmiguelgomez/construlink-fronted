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

  const getS3ImageUrl = (imageName) => {
    return `https://construlink-inky.vercel.app/uploads/${imageName}`;
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
            <div className="p-3">
              <h3 style={{color: '#111111', fontWeight: 'bold'}}>{p.nombre}</h3>
              <p style={{color: '#333333'}}><strong style={{color: '#111111'}}>Descripción:</strong> {p.descripcion}</p>
              <p style={{color: '#333333'}}><strong style={{color: '#111111'}}>Disponible:</strong> {p.cantidadDisponible}</p>
              <p style={{color: '#333333'}}><strong style={{color: '#111111'}}>Contacto:</strong> {p.contacto}</p>
              <p style={{color: '#333333'}}><strong style={{color: '#111111'}}>Precio:</strong> ${p.precio}</p>
              
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
          </div>
        ))}
      </div>
      
      {productos.length === 0 && (
        <div className="text-center p-4">
          <p style={{color: '#333333', fontSize: '1.1rem'}}>No hay productos disponibles</p>
        </div>
      )}
      
      {/* Modal de comentarios */}
      <div id="comentariosModal" className="modal" style={{ 
        display: mostrandoComentarios ? 'block' : 'none',
      }}>
        <div className="modal-content">
          <span className="close" onClick={cerrarModal}>&times;</span>
          {productoSeleccionado && (
            <div>
              <h3>Comentarios para {productoSeleccionado.nombre}</h3>
              
              {productoSeleccionado.comentarios && productoSeleccionado.comentarios.length > 0 ? (
                <div>
                  {productoSeleccionado.comentarios.map((comentario, index) => (
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
                          <em className="comment-no-text">Solo dejó calificación</em>
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
                <p style={{ color: '#333333' }}>No hay comentarios para este producto.</p>
              )}
              
              {haCompradoProducto(productoSeleccionado._id) && !yaComentado(productoSeleccionado._id) && (
                <div style={{ marginTop: '20px', color: '#333333' }}>
                  <h4>Añadir un comentario</h4>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ color: '#333333', display: 'block', marginBottom: '5px' }}>Tu calificación:</label>
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
      
      {/* Modal para añadir comentarios */}
      {comentandoProducto && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span className="close" onClick={() => setComentandoProducto(false)}>&times;</span>
            
            <h3>Calificar Producto</h3>
            <h4 style={{ color: '#333333' }}>{productoSeleccionado?.nombre}</h4>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#333333', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                <strong>Tu calificación:</strong> <span className="required-mark">*</span>
              </label>
              <div style={{ marginTop: '10px' }}>
                <StarRating rating={calificacion} setRating={setCalificacion} />
              </div>
              {calificacion === 0 && <small style={{ color: 'red' }}>La calificación es obligatoria</small>}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#333333', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                <strong>Tu comentario:</strong> (opcional)
              </label>
              <textarea 
                className="form-control"
                value={comentarioTexto}
                onChange={(e) => setComentarioTexto(e.target.value)}
                placeholder="Escribe tu comentario aquí (opcional)"
                rows="4"
                style={{ marginTop: '10px', color: '#333333', backgroundColor: '#fafafa' }}
              />
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-btn modal-btn-secondary" 
                onClick={() => setComentandoProducto(false)}
              >
                Cancelar
              </button>
              <button 
                className="modal-btn modal-btn-primary" 
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
