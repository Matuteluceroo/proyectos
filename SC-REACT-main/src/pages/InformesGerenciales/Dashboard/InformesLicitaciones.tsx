import { useEffect, useState } from 'react'
import { useObtenerHistorialProvincia } from '../../../services/connections/indicadores'
import {
  useObtenerIndicadoresProvinciasFecha,
  useObtenerLicitacionRegion,
  useObtenerLicitacionUsuarioFecha,
} from '../../../services/connections/licitaciones'
import {
  LicitacionesProvinciaChart,
  LicitacionesRegionLineChart,
} from '../Dashboard/LicitacionesCharts'

const obtenerMesActual = () => {
  const hoy = new Date()
  const mes = (hoy.getMonth() + 1).toString().padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}`
}

const InformesLicitaciones = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(obtenerMesActual)
  const [dataProvincia, setDataProvincia] = useState<
    { provincia: string; cantidad: number }[]
  >([])
  const [dataRegion, setDataRegion] = useState<
    { region: string; cantidad: number }[]
  >([])
  const [dataUsuario, setDataUsuario] = useState<
    { nombre: string; cantidad: number }[]
  >([])
  const [dataRegionLineal, setDataRegionLineal] = useState<any[]>([])
  const [regionSeleccionada, setRegionSeleccionada] = useState('NOA')
  const regiones = ['NOA', 'NEA', 'CUYO', 'CENTRO', 'PATAGONIA']
  const [dataHistorialCompleto, setDataHistorialCompleto] = useState<any[]>([])

  const fetchProvinciaFecha = useObtenerIndicadoresProvinciasFecha()
  const fetchRegion = useObtenerLicitacionRegion()
  const fetchUsuario = useObtenerLicitacionUsuarioFecha()
  const fetchRegionLineal = useObtenerLicitacionRegion()
  const obtenerHistorialProvincia = useObtenerHistorialProvincia()

  const transformarHistorialProvinciaLineal = (
    datos: any[],
    region: string
  ) => {
    const filtrado = datos.filter((item) => item.Region === region)
    console.log('FILTRADO: ', filtrado)
    const agrupado: Record<string, any> = {}
    filtrado.forEach(({ Provincia, AnioMes, Cantidad }) => {
      if (!agrupado[AnioMes]) agrupado[AnioMes] = { fecha: AnioMes }
      agrupado[AnioMes][Provincia] = Cantidad
    })

    return Object.values(agrupado).sort((a: any, b: any) =>
      a.fecha.localeCompare(b.fecha)
    )
  }

  useEffect(() => {
    const cargarHistorial = async () => {
      const data = await obtenerHistorialProvincia(fechaSeleccionada)
      setDataHistorialCompleto(data?.datos ?? [])
    }
    cargarHistorial()
  }, [fechaSeleccionada])

  const transformarDatosRegionLineal = (datos: any[]) => {
    const agrupado: Record<string, any> = {}
    datos.forEach(({ fecha, Region, Cantidad_Licitaciones }) => {
      if (!agrupado[fecha]) agrupado[fecha] = { fecha }
      agrupado[fecha][Region] = Cantidad_Licitaciones
    })
    return Object.values(agrupado)
  }
  const cargarDatos = async () => {
    const provincias = await fetchProvinciaFecha(fechaSeleccionada)
    const regiones = await fetchRegion()
    const usuarios = await fetchUsuario(fechaSeleccionada)

    setDataProvincia(
      (provincias || []).map((p: any) => ({
        provincia: p.Provincia,
        cantidad: p.Cantidad_Licitaciones,
      }))
    )

    setDataRegion(
      (regiones || []).map((r: any) => ({
        region: r.Region,
        cantidad: r.Cantidad_Licitaciones,
      }))
    )

    setDataUsuario(
      (usuarios || []).map((u: any) => ({
        nombre: u.Nombre,
        cantidad: u.Cantidad_Licitaciones,
      }))
    )
  }

  const cargarRegionLineal = async () => {
    try {
      const data = await fetchRegionLineal()
      if (!Array.isArray(data)) {
        console.warn(`Sin datos para ${fechaSeleccionada}`)
        setDataRegionLineal([])
        return
      }
      setDataRegionLineal(transformarDatosRegionLineal(data))
    } catch (err) {
      console.error('Error en cargarRegionLineal:', err)
      setDataRegionLineal([])
    }
  }

  useEffect(() => {
    if (!/^\d{4}-\d{2}$/.test(fechaSeleccionada)) return
    cargarDatos()
    cargarRegionLineal()
  }, [fechaSeleccionada])

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-md-6">
          <label>Mes a observar</label>
          <input
            type="month"
            className="form-control mb-3"
            max={obtenerMesActual()}
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
          />
          <LicitacionesProvinciaChart data={dataProvincia} />
        </div>

        <div className="col-md-6">
          <LicitacionesRegionLineChart data={dataRegionLineal} />
          {dataRegionLineal.length === 0 && (
            <p className="text-muted text-center mt-2">
              No hay datos disponibles para los últimos 6 meses desde{' '}
              {fechaSeleccionada}.
            </p>
          )}
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-12">
          {/* Botones para elegir región */}
          <div className="btn-group mb-3">
            {regiones.map((reg) => (
              <button
                key={reg}
                className={`btn btn-sm ${
                  regionSeleccionada === reg
                    ? 'btn-primary'
                    : 'btn-outline-primary'
                }`}
                onClick={() => setRegionSeleccionada(reg)}
              >
                {reg}
              </button>
            ))}
          </div>

          {/* Gráfico filtrado por región */}
          <LicitacionesRegionLineChart
            data={transformarHistorialProvinciaLineal(
              dataHistorialCompleto,
              regionSeleccionada
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default InformesLicitaciones
