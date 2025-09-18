import React from 'react'
import './Loader.css'
import logoM from '../../assets/logo.png' // Ahora TypeScript sabe que esto es una cadena de texto (la URL del SVG)

const Loader: React.FC = () => {
  // Añadimos el tipo 'React.FC' para indicar que es un componente funcional
  return (
    <div className="loader-container">
      <img
        src={logoM}
        alt="Cargando..."
        className="logo-spinner"
      />
      <div className="loader-text">Cargando...</div>
    </div>
  )
}

export default Loader
