import { GraficoBarras } from "../components/Graficos/GraficoBarras"

const GraficoBarrasDemo = () => {
  const datosEjemplo = [
    { nombre: "Producto A", cantidad: 40 },
    { nombre: "Producto B", cantidad: 25 },
  ]

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-around",
        alignItems: "flex-start",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <GraficoBarras
          key={index}
          data={datosEjemplo}
          dataKeyX="nombre"
          dataKeyY="cantidad"
          titulo={`Gráfico ${index + 1}`}
          width="30%"
          height="30vh"
        />
      ))}
    </div>
  )
}

export default GraficoBarrasDemo
