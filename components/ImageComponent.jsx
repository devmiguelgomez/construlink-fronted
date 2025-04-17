import React, { useState } from 'react';
import { getS3ImageUrl } from '../services/api';

/**
 * Componente para mostrar imágenes con fallbacks
 * @param {string} imageKey - Clave de la imagen en Cloudinary o URL completa
 * @param {string} alt - Texto alternativo para la imagen
 * @param {string} placeholder - Imagen de placeholder a mostrar si la imagen principal no carga
 * @param {object} style - Estilos adicionales para la imagen
 */
const ImageComponent = ({ imageKey, alt = "", placeholder = "/placeholder.png", style = {} }) => {
  const [error, setError] = useState(false);
  
  const imageUrl = error ? placeholder : getS3ImageUrl(imageKey);
  
  return (
    <img 
      src={imageUrl} 
      alt={alt}
      style={style}
      onError={() => setError(true)}
    />
  );
};

export default ImageComponent;
