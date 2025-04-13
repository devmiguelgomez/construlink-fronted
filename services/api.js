import axios from 'axios';

const API_BASE_URL = 'https://construlink-mu.vercel.app/api';

// Crear una instancia de axios con la URL base
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para añadir el token de autorización a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============= AUTENTICACIÓN =============
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.get('/auth/verify'),
};

// ============= USUARIOS =============
export const userAPI = {
  getPerfil: () => api.get('/users/perfil'),
  actualizarPerfil: (data) => api.put('/users/actualizar-perfil', data),
  actualizarFotoPerfil: (formData) => api.post('/users/actualizar-foto', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// ============= FERRETERÍAS =============
export const ferreteriasAPI = {
  getAll: () => api.get('/users/ferreterias'),
  getById: (id) => api.get(`/users/ferreteria/${id}`),
};

// ============= PRODUCTOS =============
export const productosAPI = {
  getAll: () => api.get('/productos/todos'),
  getByFerreteria: (ferreteriaId) => api.get(`/productos/ferreteria/${ferreteriaId}`),
  getMisProductos: () => api.get('/productos/mis-productos'),
  getById: (id) => api.get(`/productos/${id}`),
  crear: (data) => api.post('/productos', data),
  crearConImagen: (formData) => api.post('/productos/con-imagen', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  actualizar: (id, data) => api.put(`/productos/${id}`, data),
  eliminar: (id) => api.delete(`/productos/${id}`),
  comentar: (id, data) => api.post(`/productos/${id}/comentario`, data),
};

// ============= PEDIDOS =============
export const pedidosAPI = {
  crear: (data) => api.post('/pedidos', data),
  getMisPedidos: () => api.get('/pedidos/mis-pedidos'),
  getPedidosRecibidos: () => api.get('/pedidos/recibidos'),
  cambiarEstado: (id, estado) => api.put(`/pedidos/${id}/estado`, { estado }),
};

// ============= MAESTROS =============
export const maestrosAPI = {
  getAll: () => api.get('/users/maestros'),
  getById: (id) => api.get(`/users/maestro/${id}`),
};

// ============= SERVICIOS =============
export const serviciosAPI = {
  getAll: () => api.get('/servicios/todos'),
  getByMaestro: (maestroId) => api.get(`/servicios/maestro/${maestroId}`),
  getMisServicios: () => api.get('/servicios/mis-servicios'),
  getById: (id) => api.get(`/servicios/${id}`),
  crear: (data) => api.post('/servicios', data),
  actualizar: (id, data) => api.put(`/servicios/${id}`, data),
  eliminar: (id) => api.delete(`/servicios/${id}`),
  comentar: (id, data) => api.post(`/servicios/${id}/comentario`, data),
};

// ============= SOLICITUDES DE SERVICIO =============
export const solicitudesAPI = {
  crear: (data) => api.post('/solicitudes', data),
  getMisSolicitudes: () => api.get('/solicitudes/cliente'),
  getSolicitudesRecibidas: () => api.get('/solicitudes/maestro'),
  cambiarEstado: (id, estado) => api.put(`/solicitudes/${id}/estado`, { estado }),
};

// ============= ESTADISTICAS =============
export const estadisticasAPI = {
  getEstadisticasCliente: async () => {
    try {
      const [pedidosResponse, solicitudesResponse] = await Promise.all([
        api.get('/pedidos/mis-pedidos'),
        api.get('/solicitudes/cliente')
      ]);
      
      return {
        pedidos: pedidosResponse.data,
        solicitudes: solicitudesResponse.data
      };
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      throw error;
    }
  },
  
  getEstadisticasMaestro: async () => {
    try {
      const [serviciosResponse, solicitudesResponse] = await Promise.all([
        api.get('/servicios/mis-servicios'),
        api.get('/solicitudes/maestro')
      ]);
      
      return {
        servicios: serviciosResponse.data,
        solicitudes: solicitudesResponse.data
      };
    } catch (error) {
      console.error("Error al obtener estadísticas de maestro:", error);
      throw error;
    }
  },
  
  getEstadisticasFerreteria: async () => {
    try {
      const [productosResponse, pedidosResponse] = await Promise.all([
        api.get('/productos/mis-productos'),
        api.get('/pedidos/recibidos')
      ]);
      
      return {
        productos: productosResponse.data,
        pedidos: pedidosResponse.data
      };
    } catch (error) {
      console.error("Error al obtener estadísticas de ferretería:", error);
      throw error;
    }
  }
};

// Función para manejar URLs de imágenes
export const getS3ImageUrl = (imageKey) => {
  if (!imageKey) return null;
  
  // Si ya es una URL completa
  if (imageKey.startsWith('http')) return imageKey;
  
  // Si es un archivo local
  return `https://construlink-mu.vercel.app/uploads/${imageKey}`;
};

export default api;
