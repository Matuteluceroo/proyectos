import { useNavigate } from "react-router-dom"
import Button from "../../../components/Button/Button"
import BotonAccion from "../../../components/Button/BotonAgregar"

type ButtonNavegarLicitacion = {
  idLicitacion?: number | null
  estado?: string
}

const hiddenOfEstado = (estado: string, opc: string) => {
  if (estado === "OFERTA PRESENTADA" && opc.toUpperCase() !== "PREGANADOS")
    return true
  if (estado === "COTIZADO" && opc.toUpperCase() === "PREGANADOS") return true
  if (estado === "EN CURSO" && opc.toUpperCase() === "PREGANADOS") return true
  if (estado === "INICIADA" && opc.toUpperCase() !== "VER DEMANDA") return true

  return false
}

export const ButtonIrLicitacion = ({
  idLicitacion = null,
  estado = "",
}: ButtonNavegarLicitacion) => {
  const navigate = useNavigate()

  const irALicitacion = (id: number | null) => {
    if (id !== null) {
      navigate(`/licitacion_demanda?id=${id}`)
    } else {
      navigate("/licitacion_demanda")
    }
  }

  return idLicitacion === null ? (
    <BotonAccion
      className="boton-accion"
      text="Crear licitacion"
      onClick={() => irALicitacion(null)}
    />
  ) : (
    <Button
      text="Ver Demanda"
      title="Ver Demanda"
      className="btnFuncTabla"
      isHidden={() => hiddenOfEstado(estado, "Ver Demanda")}
      onClick={() => irALicitacion(idLicitacion)}
    />
  )
}

export const ButtonElegirCotizacion = ({
  idLicitacion = null,
  estado = "",
}: ButtonNavegarLicitacion) => {
  const navigate = useNavigate()

  const irASeleccionCostos = (idLicitacion: number | null) => {
    if (idLicitacion !== null) {
      navigate(`/seleccion_costos?id=${idLicitacion}`)
    }
  }

  return (
    <Button
      text={"Elegir Cotización"}
      title="Elegir Cotización"
      className="btnFuncTabla"
      isHidden={() => hiddenOfEstado(estado, "Elegir Cotización")}
      onClick={() => irASeleccionCostos(idLicitacion)}
    />
  )
}

export const ButtonPreganados = ({
  idLicitacion = null,
  estado = "",
}: ButtonNavegarLicitacion) => {
  const navigate = useNavigate()

  const irAPreganados = (idLicitacion: number | null) => {
    if (idLicitacion !== null) {
      navigate(`/preganados?id=${idLicitacion}`)
    }
  }

  return (
    <Button
      text={"Preganados"}
      title="Preganados"
      className="btnFuncTabla"
      isHidden={() => hiddenOfEstado(estado, "PREGANADOS")}
      onClick={() => irAPreganados(idLicitacion)}
    />
  )
}

export const ButtonVerLicitacion = ({
  idLicitacion = null,
  estado = "",
}: ButtonNavegarLicitacion) => {
  const navigate = useNavigate()

  const irAVerLicitacion = (idLicitacion: number | null) => {
    if (idLicitacion !== null) {
      navigate(`/vista_licitacion?id=${idLicitacion}`)
    }
  }

  return (
    <Button
      text={"Ver Licitación"}
      title="Ver Licitación"
      className="btnFuncTabla"
      isHidden={() => hiddenOfEstado(estado, "PREGANADOS")}
      onClick={() => irAVerLicitacion(idLicitacion)}
    />
  )
}
