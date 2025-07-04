import React, { useState } from "react"
import { AiFillStar, AiOutlineStar } from "react-icons/ai"

interface ContenedorGraficoProps {
  titulo: string
  children: React.ReactNode
  initialFavorite?: boolean
  onToggleFavorite?: (isFavorite: boolean) => void
  width?: string | number
  height?: string | number
  extraContent?: React.ReactNode // <- NUEVO
}

const ContenedorGraficos: React.FC<ContenedorGraficoProps> = ({
  titulo,
  width,
  height,
  children,
  initialFavorite = false,
  onToggleFavorite,
  extraContent,
}) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)

  const toggleFavorite = () => {
    const nuevo = !isFavorite
    setIsFavorite(nuevo)
    onToggleFavorite?.(nuevo)
  }

  return (
    <div className="chart-card" style={{ width, height }}>
      <div className="chart-card-header">
        <button
          className="chart-card-header__star"
          onClick={toggleFavorite}
          aria-label={
            isFavorite ? "Quitar de favoritos" : "Marcar como favorito"
          }
        >
          {isFavorite ? (
            <AiFillStar color="#f4c542" size={22} />
          ) : (
            <AiOutlineStar size={22} />
          )}
        </button>
        <h4 className="chart-card-header__title">{titulo}</h4>
      </div>

      {/* Contenido adicional: filtros, botones, etc. */}
      {extraContent && <div className="chart-card-extra">{extraContent}</div>}

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default ContenedorGraficos
