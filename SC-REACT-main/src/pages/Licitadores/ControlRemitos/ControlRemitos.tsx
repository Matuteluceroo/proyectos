import React, { useEffect, useState } from 'react'
import Estructura from '../../../components/Estructura/Estructura'
import VirtualizedTable from '../../../components/VirtualizedTable/VirtualizedTable'
import { Column } from '../../../types/TableTypes'
import {
  useObtenerEstadoRemito,
  useObtenerImagenRemito,
} from '../../../services/connections/logistica'
import AlertErrores from '../../../components/Alert/AlertErrores'
import AlertaCuidado from '../../../components/Alert/AlertCuidado'
import Modal from '../../../components/Modal/Modal'

interface RemitoRow {
  fechaEnvio: string
  nroComprobante: string
  razonSocial: string
  estado: string
}

const ControlRemitos: React.FC = () => {
  const [rows, setRows] = useState<RemitoRow[]>([])
  const ObtenerEstadoRemito = useObtenerEstadoRemito()
  const obtenerImagenRemito = useObtenerImagenRemito()
  const [alertaCuidado, setAlertaCuidado] = useState(false)
  const [alertaError, setAlertaError] = useState(false)
  const [msgAlerta, setMsgAlerta] = useState('')
  const [tituloAlerta, setTituloAlerta] = useState('')
  const [imagenesRemito, setImagenesRemito] = useState<string[]>([])
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  useEffect(() => {
    const cargarRemitos = async () => {
      const data: RemitoRow[] = await ObtenerEstadoRemito()
      setRows(data)
    }

    cargarRemitos()
  }, [])

  const listaColums: Column[] = [
    { id: 'fechaEnvio', label: 'FECHA', width: '100px', options: true },
    {
      id: 'nroComprobante',
      label: 'NRO REMITO',
      width: '150px',
      options: true,
    },
    { id: 'razonSocial', label: 'RAZON SOCIAL', width: '200px', options: true },
    {
      id: 'nroSeguimiento',
      label: 'Nro Seguimiento',
      width: '250px',
      options: true,
    },
    {
      id: 'observaciones',
      label: 'Observaciones',
      width: '250px',
      options: true,
    },
    { id: 'estado', label: 'ESTADO', width: '150px', options: true },
  ]

  const handleClickFila = async (row: RemitoRow) => {
    try {
      const data = await obtenerImagenRemito({
        nro_remito: String(row.nroComprobante),
      })

      if (!data?.imagenes || data.imagenes.length === 0) {
        setAlertaCuidado(true)
        setTituloAlerta('NO SE ENCONTRO')
        setMsgAlerta('No se encontraron imágenes para este remito.')
        alert('')
        return
      }

      const imagenesBase64 = data.imagenes.map((img: any) => img.imagen)
      setImagenesRemito(imagenesBase64)
      setMostrarModal(true)
    } catch (error) {
      setAlertaError(true)
      setTituloAlerta('ALERTA')
      setMsgAlerta('No se pudo cargar la imagen del remito.')
    }
  }

  return (
    <Estructura>
      <div style={{ height: '75vh', margin: '5px' }}>
        <VirtualizedTable
          rows={rows}
          columns={listaColums}
          setRows={setRows}
          onClickRow={handleClickFila}
        />
        <Modal
          isOpen={mostrarModal}
          onClose={() => {
            setMostrarModal(false)
            setImagenesRemito([])
          }}
          title="Imágenes del Remito"
        >
          {imagenesRemito.length > 0 ? (
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {imagenesRemito.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Remito ${i + 1}`}
                  style={{
                    maxWidth: '100px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setImagenAmpliada(img)}
                />
              ))}
            </div>
          ) : (
            <p>No hay imágenes disponibles.</p>
          )}
        </Modal>
        {imagenAmpliada && (
          <Modal
            isOpen={!!imagenAmpliada}
            onClose={() => setImagenAmpliada(null)}
            title="Imagen ampliada"
          >
            <div style={{ textAlign: 'center' }}>
              <img
                src={imagenAmpliada}
                alt="Imagen ampliada"
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  borderRadius: '10px',
                }}
              />
            </div>
          </Modal>
        )}
      </div>
      <AlertaCuidado
        setIsOpen={setAlertaCuidado}
        isOpen={alertaCuidado}
        message={msgAlerta}
        titulo={tituloAlerta}
      />
      <AlertErrores
        setIsOpen={setAlertaError}
        isOpen={alertaError}
        message={msgAlerta}
        titulo={tituloAlerta}
      />
    </Estructura>
  )
}

export default ControlRemitos
