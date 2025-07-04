import React, { useState, useRef } from "react"
import * as XLSX from "xlsx"
import { FiSend } from "react-icons/fi"
import Alert from "../Alert/AlertCuidado"
import { obtenerFechaYHoraActual } from "../../services/functions"
import { useGenerarExcel } from "../../services/connections/documents.js"
import "./FileUpload.css"
import Button from "../Button/Button"
type FileUploadProps = {
  setData: (data: any) => void
  encabezados: any[]
  datosTabla: any[]
  paso: string
  usarEncabezados?: boolean
}

const FileUpload = ({
  setData,
  encabezados,
  datosTabla,
  paso,
  usarEncabezados,
}: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [alertaFile, setAlertaFile] = useState(false)
  const [msgAlertaFile, setMsgAlertaFile] = useState("")
  const [tituloAlertaFile, setTituloAlertaFile] = useState("")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setFile(file)
  }

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) setFile(file)
  }

  const handleAccept = () => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Extraigo raw JSON (sin cabeceras si usarEncabezados es false)
        let jsonData = XLSX.utils
          .sheet_to_json(
            worksheet,
            usarEncabezados ? { defval: "", raw: false } : { header: 1 }
          )
          .filter((row) => {
            if (usarEncabezados) {
              return Object.values(
                row as { [key: string]: string | number | undefined }
              ).some((val) => val !== "" && val != null)
            } else {
              return (
                (row as (string | number)[]).length > 0 &&
                (row as (string | number)[]).some(
                  (val) => val !== "" && val != null
                )
              )
            }
          })

        if (usarEncabezados) {
          jsonData = (jsonData as { [key: string]: any }[]).map((rowObj) => {
            const trimmedRow: { [key: string]: any } = {}
            for (const key in rowObj) {
              let cell = rowObj[key]
              if (typeof cell === "string") {
                cell = cell.trim()
              }

              // Validación específica para "Costo U."
              if (key === "Costo U.") {
                const limpio = String(cell)
                  .replace(/[^0-9.,]/g, "")
                  .replace(",", ".")

                trimmedRow[key] = limpio === "" ? "" : limpio
              } else {
                trimmedRow[key] = cell
              }
            }
            return trimmedRow
          })
        } else {
          jsonData = (jsonData as (string | number)[][]).map((rowArr) =>
            rowArr.map((cell) =>
              typeof cell === "string" ? cell.trim() : cell
            )
          )
        }
        if (setData) setData(jsonData)
      }
      reader.readAsBinaryString(file)
    } else {
      setAlertaFile(true)
      setTituloAlertaFile("ALERTA")
      setMsgAlertaFile("¡Por favor, selecciona un archivo!")
    }
  }
  const exportarExcel = async () => {
    const nombreExcel = "Importar " + paso + obtenerFechaYHoraActual()

    // Construir headers usando los 'label' visibles
    const headers = encabezados.reduce((acc, col) => {
      if (!col.id.startsWith("btn")) {
        acc[col.id] = col.label
      }
      return acc
    }, {})

    const datosFiltrados = datosTabla.map((row) => {
      const filaOrdenada: { [key: string]: string } = {}

      encabezados.forEach((col) => {
        if (!col.id.startsWith("btn")) {
          const key = col.id
          filaOrdenada[headers[key]] = row[key] ?? ""
        }
      })

      return filaOrdenada
    })

    const data = {
      data_renglones: datosFiltrados,
      headers,
    }

    await useGenerarExcel(data, nombreExcel)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAccept()
    }
  }

  return (
    <div tabIndex={0} onKeyDown={handleKeyDown} style={{ outline: "none" }}>
      <div
        style={{
          padding: "1.5rem",
          background: "#fff",
          borderRadius: "16px",
          maxWidth: "500px",
          margin: "auto",
        }}
      >
        <h2 style={{ fontWeight: "bold", fontSize: "20px" }}>
          📁 Subir archivo Excel
        </h2>
      </div>
      <div
        onDrop={handleFileDrop}
        className="drop-zone"
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        <div className="drop-icon">
          <FiSend size={40} />
        </div>
        <p className="drop-text">
          {file
            ? `Archivo seleccionado: ${file.name}`
            : "Arrastra un archivo aquí o haz clic para seleccionar"}
        </p>
      </div>
      <br />
      <div className="row justify-content-center">
        <div className="col-6">
          <Button
            onClick={handleAccept}
            className="btnHeader2"
            text=" Aceptar"
          />
        </div>
        <div className="col-4">
          <Button
            onClick={exportarExcel}
            className="btnFuncTabla"
            text="Exportar"
          />
        </div>
      </div>

      <Alert
        titulo={tituloAlertaFile}
        message={msgAlertaFile}
        duration={5000}
        setIsOpen={setAlertaFile}
        isOpen={alertaFile}
      />
    </div>
  )
}

export default FileUpload
