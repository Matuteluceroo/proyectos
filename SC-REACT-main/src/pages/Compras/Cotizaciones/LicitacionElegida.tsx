import React, { useEffect, useState } from "react"
import InfoItem from "../../../components/InfoItem/InfoItem"
import VirtualizedTable from "../../../components/VirtualizedTable/VirtualizedTable"
import { Column } from "../../../types/TableTypes"

interface RenglonLicitacion {
  renglon: number
  cantidad: number
  descripcion: string
  alternativo: number
  [key: string]: any // Si hay más campos
}

interface DataLicitacionVisible {
  cliente: string
  fecha: string
  nroLic: string
  renglones: RenglonLicitacion[]
}

interface Props {
  dataLicitacionVisible: DataLicitacionVisible | null
}

const LicitacionElegida: React.FC<Props> = ({ dataLicitacionVisible }) => {
  const [filasLicitacionElegida, setFilasLicitacionElegida] = useState<
    RenglonLicitacion[]
  >([])

  const columnsSelectedLic: Column[] = [
    {
      id: "renglon",
      label: "R",
      width: "50px",
      editable: false,
      type: "number",
    },
    {
      id: "cantidad",
      label: "Cantidad",
      width: "70px",
      editable: false,
      type: "number",
    },
    {
      id: "descripcion",
      label: "Descripcion",
      width: "320px",
      editable: false,
    },
  ]

  useEffect(() => {
    const llenarData = async () => {
      if (dataLicitacionVisible) {
        const renglonesFiltrados = dataLicitacionVisible.renglones.filter(
          (reng) => reng.alternativo === 0
        )
        setFilasLicitacionElegida(renglonesFiltrados)
      }
    }
    llenarData()
  }, [dataLicitacionVisible])

  if (!dataLicitacionVisible) return null

  return (
    <div className="d-flex flex-column h-100 px-3 py-2">
      <div className="mb-3">
        <div className="d-flex flex-wrap gap-3">
          <InfoItem fieldName="CLIENTE" value={dataLicitacionVisible.cliente} />
          <InfoItem fieldName="FECHA" value={dataLicitacionVisible.fecha} />
          <InfoItem fieldName="N° C/L" value={dataLicitacionVisible.nroLic} />
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto" style={{ minHeight: "200px" }}>
        <VirtualizedTable
          columns={columnsSelectedLic}
          rows={filasLicitacionElegida}
          setRows={setFilasLicitacionElegida}
        />
      </div>
    </div>
  )
}

export default LicitacionElegida
