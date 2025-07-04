import React from "react"
import Button from "../../../components/Button/Button"

interface AuxiliarCotizacionesProps {
  open: boolean
  setOpen: (value: boolean) => void
  setDataAuxComponent: (value: any) => void
  dataAuxComponent: {
    Component: React.ElementType
    btnCerrarFunc: () => void
  } | null
}

const AuxiliarCotizaciones: React.FC<AuxiliarCotizacionesProps> = ({
  open,
  setOpen,
  setDataAuxComponent,
  dataAuxComponent,
}) => {
  if (!open || !dataAuxComponent) return null

  const ComponentToRender = dataAuxComponent.Component

  return (
    <div
      className="col-5 d-flex flex-column"
      style={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Botón cerrar optimizado visualmente */}
      <div className="mb-2">
        <Button
          className="btnFuncTablaLargo btn-sm w-100 text-center"
          text={"CERRAR"}
          onClick={() => {
            dataAuxComponent.btnCerrarFunc()
            setOpen(false)
            setDataAuxComponent(null)
          }}
          title="Cerrar"
        />
      </div>

      {/* Contenedor del componente a renderizar, scroll interno */}
      <div
        style={{
          flex: "1",
          overflowY: "auto",
          padding: "0 5px", // Padding lateral reducido para mejor visualización
        }}
      >
        <ComponentToRender />
      </div>
    </div>
  )
}

export default AuxiliarCotizaciones
