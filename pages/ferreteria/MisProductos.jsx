import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEye, FaShoppingCart } from 'react-icons/fa';

const MisProductos = () => {
  const [productos, setProductos] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: '', descripcion: '', cantidadDisponible: '', contacto: '', precio: '' });

  const cargar = async () => {
    const res = await axios.get('https://construlink-mu.vercel.app/productos/mis-productos', {
      headers: { Authorization: localStorage.getItem('token') }
    });
    setProductos(res.data);
  };

  useEffect(() => { cargar(); }, []);

  const crear = async () => {
    await axios.post('https://construlink-mu.vercel.app/api/productos', nuevo, {
      headers: { Authorization: localStorage.getItem('token') }
    });
    cargar();
  };

  const eliminar = async (id) => {
    await axios.delete(`https://construlink-mu.vercel.app/api/productos/${id}`, {
      headers: { Authorization: localStorage.getItem('token') }
    });
    cargar();
  };

  return (
    <div>
      <h2>Mis Productos</h2>
      <input placeholder="Nombre" onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} />
      <input placeholder="Descripción" onChange={e => setNuevo({ ...nuevo, descripcion: e.target.value })} />
      <input placeholder="Cantidad" onChange={e => setNuevo({ ...nuevo, cantidadDisponible: e.target.value })} />
      <input placeholder="Contacto" onChange={e => setNuevo({ ...nuevo, contacto: e.target.value })} />
      <input placeholder="Precio" type="number" onChange={e => setNuevo({ ...nuevo, precio: e.target.value })} />
      <button onClick={crear}>Crear Producto</button>

      {productos.map(p => (
        <div key={p._id} className="card">
          <h3>{p.nombre}</h3>
          <p>{p.descripcion}</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaEye style={{ marginRight: '5px', color: '#3498db' }} />
              <span>{p.visualizaciones || 0} visualizaciones</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaShoppingCart style={{ marginRight: '5px', color: '#27ae60' }} />
              <span>{p.totalVendidos || 0} vendidos</span>
            </div>
          </div>
          
          <button onClick={() => eliminar(p._id)}>Eliminar</button>
        </div>
      ))}
    </div>
  );
};

export default MisProductos;
