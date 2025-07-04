import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi"

interface VariacionProps {
  mesAnterior: string
  valorAnterior: number
  mesActual: string
  valorActual: number
  variacionPorc: number
}

export const VariacionLicitaciones = ({
  mesAnterior,
  valorAnterior,
  mesActual,
  valorActual,
  variacionPorc,
}: VariacionProps) => {
  const aumento = valorActual > valorAnterior
  const color = aumento ? "#38b000" : "#d90429"
  const Icono = aumento ? FiArrowUpRight : FiArrowDownRight

  return (
    <div
      style={{
        background: "transparent",
        borderRadius: "16px",
        padding: "0",
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <h4
        style={{ color: "#60a5fa", fontSize: "20px", marginBottom: "0.5rem" }}
      >
        Variación de Participación
      </h4>

      <div
        style={{
          fontSize: "22px",
          marginBottom: "0.5rem",
          color: "white",
        }}
      >
        {mesAnterior}: <strong>{valorAnterior}</strong>{" "}
        &nbsp;&nbsp;→&nbsp;&nbsp; {mesActual}: <strong>{valorActual}</strong>
      </div>

      <div
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Icono size={24} />
        {variacionPorc > 0 ? "+" : ""}
        {variacionPorc}%
      </div>
    </div>
  )
}
