import { useEffect, useState } from 'react'
import { useLeerSugerencias } from '../../services/connections/reportes'
import VirtualizedTable from '../../components/VirtualizedTable/VirtualizedTable'
import Estructura from '../../components/Estructura/Estructura'
import './Reportes.css'

const Sugerencias = () => {
  const [listaSugerencias, setListaSugerencias] = useState<any[]>([])
  const leerSugerencias = useLeerSugerencias()
  useEffect(() => {
    const listarSugerencias = async () => {
      const listaSugerencias = await leerSugerencias()
      setListaSugerencias(listaSugerencias.sugerencias)
    }
    listarSugerencias()
  }, [])

  const columnasSugerencias = [
    { id: 'nombreUsuario', label: 'USUARIO', width: '200px', options: true },
    {
      id: 'nombre',
      label: 'NOMBRE',
      width: '350px',
      options: true,
    },
    { id: 'mensaje', label: 'MENSAJE', width: '350px', options: true },
  ]

  return (
    <Estructura rutaVolver="/administracion">
      <div
        className="d-flex flex-column"
        style={{ height: '100vh' }}
      >
        <div className="col-8 d-flex justify-content-center align-items-center">
          <h1 className="headerTitle text-center m-0">SUGERENCIAS</h1>
        </div>
        <div style={{ height: '85vh' }}>
          <VirtualizedTable
            columns={columnasSugerencias}
            rows={listaSugerencias}
            setRows={setListaSugerencias}
          />
        </div>
      </div>
    </Estructura>
  )
}

export default Sugerencias
