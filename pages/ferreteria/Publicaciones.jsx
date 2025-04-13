import { useState, useEffect } from 'react';
import { productosAPI } from '../../services/api';
import { FaUpload, FaTrash, FaEdit, FaComments, FaStar, FaRegStar, FaEye, FaShoppingCart } from 'react-icons/fa';

const Publicaciones = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [nuevaPublicacion, setNuevaPublicacion] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    cantidadDisponible: '',
    contacto: '',
    foto: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrandoComentarios, setMostrandoComentarios] = useState(false);

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  const cargarPublicaciones = async () => {
    try {
      const response = await productosAPI.getMisProductos();
      setPublicaciones(response.data);
    } catch (err) {
      console.error('Error al cargar publicaciones:', err);
      setError('No se pudieron cargar las publicaciones');
    }
  };

  const handleChange = (e) => {
    setNuevaPublicacion({ ...nuevaPublicacion, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setNuevaPublicacion({ ...nuevaPublicacion, foto: e.target.files[0] });
  };

  const calcularPromedio = (comentarios) => {
    if (!comentarios || comentarios.length === 0) return 0;
    const suma = comentarios.reduce((acc, c) => acc + (c.calificacion || 0), 0);
    return (suma / comentarios.length).toFixed(1);
  };

  const crearPublicacion = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('nombre', nuevaPublicacion.nombre);
      formData.append('descripcion', nuevaPublicacion.descripcion);
      formData.append('precio', nuevaPublicacion.precio);
      formData.append('cantidadDisponible', nuevaPublicacion.cantidadDisponible || 1);
      formData.append('contacto', nuevaPublicacion.contacto || '');
      
      if (nuevaPublicacion.foto) {
        formData.append('imagen', nuevaPublicacion.foto);
      }

      const response = await productosAPI.crearConImagen(formData);
      
      console.log('Respuesta del servidor:', response.data);
      
      setNuevaPublicacion({
        nombre: '',
        descripcion: '',
        precio: '',
        cantidadDisponible: '',
        contacto: '',
        foto: null
      });
      
      cargarPublicaciones();
      
      alert('Publicación creada con éxito');
    } catch (error) {
      console.error('Error al crear publicación:', error);
      setError('Error al crear la publicación: ' + (error.response?.data?.msg || error.message));
    } finally {
      setLoading(false);
    }
  };

  const eliminarPublicacion = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta publicación?')) {
      try {
        await productosAPI.eliminar(id);
        cargarPublicaciones();
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar la publicación');
      }
    }
  };

  const verComentarios = async (producto) => {
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

  const cerrarModal = () => {
    setMostrandoComentarios(false);
    setProductoSeleccionado(null);
  };

  return (
    <div className="publicaciones-container">
      <div className="nuevo-producto-card card mb-4">
        <h3 className="mb-3">Crear nueva publicación</h3>
        
        {error && <div className="alert alert-danger mb-3">{error}</div>}
        
        <div className="form-group mb-3">
          <label htmlFor="nombre">Nombre del producto</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            className="form-control"
            value={nuevaPublicacion.nombre}
            onChange={handleChange}
            placeholder="Ej: Cemento Portland"
          />
        </div>
        
        <div className="form-group mb-3">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            className="form-control"
            value={nuevaPublicacion.descripcion}
            onChange={handleChange}
            placeholder="Descripción detallada del producto"
            rows="3"
          ></textarea>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="precio">Precio (COP)</label>
              <input
                type="number"
                id="precio"
                name="precio"
                className="form-control"
                value={nuevaPublicacion.precio}
                onChange={handleChange}
                placeholder="Ej: 25000"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="cantidadDisponible">Cantidad disponible</label>
              <input
                type="number"
                id="cantidadDisponible"
                name="cantidadDisponible"
                className="form-control"
                value={nuevaPublicacion.cantidadDisponible}
                onChange={handleChange}
                placeholder="Ej: 50"
              />
            </div>
          </div>
        </div>
        
        <div className="form-group mb-3">
          <label htmlFor="contacto">Contacto</label>
          <input
            type="text"
            id="contacto"
            name="contacto"
            className="form-control"
            value={nuevaPublicacion.contacto}
            onChange={handleChange}
            placeholder="Teléfono o información de contacto"
          />
        </div>
        
        <div className="form-group mb-4">
          <label htmlFor="foto">
            <FaUpload className="me-2" /> Imagen del producto
          </label>
          <input
            type="file"
            id="foto"
            className="form-control"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>
        
        <button 
          onClick={crearPublicacion}
          className="btn"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Creando...' : 'Crear Publicación'}
        </button>
      </div>

      <h3 className="mb-3">Mis Publicaciones</h3>
      
      <div className="product-grid">
        {publicaciones.map(p => (
          <div key={p._id} className="card">
            {p.imagen && (
              <div className="card-image">
                <img src={`https://construlink-mu.vercel.app/uploads/${p.imagen}`} alt={p.nombre} />
              </div>
            )}
            <div className="p-3">
              <h4>{p.nombre}</h4>
              <p><strong>Descripción:</strong> {p.descripcion}</p>
              <p><strong>Precio:</strong> ${p.precio}</p>
              <p><strong>Disponibles:</strong> {p.cantidadDisponible} unidades</p>
              
              {/* Estadísticas de visualizaciones y ventas */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaEye style={{ marginRight: '5px', color: '#3498db' }} />
                  <span>{p.visualizaciones || 0} visualizaciones</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaShoppingCart style={{ marginRight: '5px', color: '#27ae60' }} />
                  <span>{p.totalVendidos || 0} vendidos</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                <div style={{ marginRight: '10px' }}>
                  <strong>Calificación: </strong>
                  <span>{calcularPromedio(p.comentarios)}</span>
                </div>
                <div>
                  {[...Array(5)].map((_, i) => {
                    const promedio = calcularPromedio(p.comentarios);
                    return (
                      <span key={i} style={{ color: i < promedio ? '#ffc107' : '#F4F1F1' }}>
                        {i < promedio ? <FaStar /> : <FaRegStar />}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              <div className="d-flex gap-2 mt-3">
                <button 
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => verComentarios(p)}
                >
                  <FaComments className="me-1" /> 
                  Ver Comentarios ({p.comentarios?.length || 0})
                </button>
                <button 
                  className="btn" 
                  style={{ flex: 1, backgroundColor: '#e74c3c' }}
                  onClick={() => eliminarPublicacion(p._id)}
                >
                  <FaTrash className="me-1" /> Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {publicaciones.length === 0 && (
          <div className="text-center p-4 w-100">
            <p>No has creado ninguna publicación todavía.</p>
          </div>
        )}
      </div>

      {mostrandoComentarios && (
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
                            <em style={{ color: '#7C7676' }}>El cliente solo dejó calificación</em> : 
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Publicaciones;
