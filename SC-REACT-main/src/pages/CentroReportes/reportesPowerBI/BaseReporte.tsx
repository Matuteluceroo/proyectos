import React, { useState } from "react"
import { useParams } from "react-router-dom"
import "./BaseReporte.css"

interface LinkItem {
  title: string
  link: string
}

const listaLinks: LinkItem[] = [
  {
    title: "LICITACIONES",
    link: "https://app.powerbi.com/view?r=eyJrIjoiODJkMmYzOGQtMmY3ZS00ZjI1LWIzMjUtOTAyY2FjZWNmMzgwIiwidCI6ImVmZmVjMTViLWU5YjQtNDZlYy1hMWJhLWIwZTU3MTViN2I2MCJ9",
  },
  {
    title: "BIDMASTER",
    link: "https://app.powerbi.com/view?r=eyJrIjoiNzRlNGIyMzAtMmQ4OC00NzE0LWFlMjYtYjFmNGNjZDhhZjRlIiwidCI6ImVmZmVjMTViLWU5YjQtNDZlYy1hMWJhLWIwZTU3MTViN2I2MCJ9",
  },
  {
    title: "ANALISIS",
    link: "https://app.powerbi.com/view?r=eyJrIjoiNzRlNGIyMzAtMmQ4OC00NzE0LWFlMjYtYjFmNGNjZDhhZjRlIiwidCI6ImVmZmVjMTViLWU5YjQtNDZlYy1hMWJhLWIwZTU3MTViN2I2MCJ9",
  },
  {
    title: "INFORME_COMPARATIVOS_COMPLETOS",
    link: "https://app.powerbi.com/view?r=eyJrIjoiNjM1MzE5MGQtMzJlMC00MzFkLWExMWItZjYxMGZmNjU1MDNmIiwidCI6ImVmZmVjMTViLWU5YjQtNDZlYy1hMWJhLWIwZTU3MTViN2I2MCJ9",
  },
  {
    title: "Estado_Carga_Comparativos",
    link: "https://app.powerbi.com/view?r=eyJrIjoiOWZlZTY5ZjMtMzIyNC00MmE3LTg5YmMtNWVhMzU2M2RmOGFlIiwidCI6ImVmZmVjMTViLWU5YjQtNDZlYy1hMWJhLWIwZTU3MTViN2I2MCJ9",
  },
  {
    title: "INFORME_VENTAS_COBROS",
    link: "https://app.powerbi.com/view?r=eyJrIjoiZGYyZGMxM2ItYjE2My00ZTQ2LWJjMjktMmM1NGUxMDlkOWRkIiwidCI6ImVmZmVjMTViLWU5YjQtNDZlYy1hMWJhLWIwZTU3MTViN2I2MCJ9",
  },
]

const ReporteBase: React.FC = () => {
  const { selectedLink } = useParams<{ selectedLink: string }>()

  const getLinkByTitle = (title: string | undefined): LinkItem | undefined =>
    listaLinks.find(
      (linkObj) => title && linkObj.title.toLowerCase() === title.toLowerCase()
    )

  const [selected] = useState<LinkItem | undefined>(
    getLinkByTitle(selectedLink)
  )

  if (!selected) {
    return <div>No se encontró un reporte para: {selectedLink}</div>
  }

  return (
    <iframe
      title={selected.title}
      src={selected.link}
      className="tablero_power_BI"
    />
  )
}

export default ReporteBase
