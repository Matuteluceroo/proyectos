import { useState, useEffect } from "react"
import { DeudasClientes, DeudasProvincias } from "./GraficosDeudas"
import {
  useObtenerDeudaCliente,
  useObtenerDeudaProvincia,
} from "../../../services/connections/facturas"
import DateRangePicker from "../../../components/RangoFecha/RangoFecha"
import { GraficoBarras } from "../../../components/Graficos/GraficoBarras"

const InformesCobranzas = () => {
  const [period, setPeriod] = useState({ start: "", end: "" })
  const [dataDeudasClientes, setDataDeudasClientes] = useState<any>([])
  const [dataDeudasProvincias, setDataDeudasProvincias] = useState<any>([])

  const obtenerDeudaCliente = useObtenerDeudaCliente()
  const obtenerDeudaProvincia = useObtenerDeudaProvincia()

  useEffect(() => {
    if (period.start === "" || period.end === "") return
    const llenarData = async () => {
      const deudaClientes = await obtenerDeudaCliente({
        fechaDesde: period.start,
        fechaHasta: period.end,
      })

      /* const deudaProvincias = [
        {
          PROVINCIA: "MENDOZA",
          CANTIDAD_FACTURAS: 107,
          DEUDA_PROVINCIA: 460476597.19,
          PORCENTAJE_DEUDA_TOTAL: 29.48,
        },
        {
          PROVINCIA: "SANTA FE",
          CANTIDAD_FACTURAS: 75,
          DEUDA_PROVINCIA: 422636061.62,
          PORCENTAJE_DEUDA_TOTAL: 27.06,
        },
        {
          PROVINCIA: "CORDOBA",
          CANTIDAD_FACTURAS: 41,
          DEUDA_PROVINCIA: 185375645.76,
          PORCENTAJE_DEUDA_TOTAL: 11.87,
        },
        {
          PROVINCIA: "SAN LUIS",
          CANTIDAD_FACTURAS: 3,
          DEUDA_PROVINCIA: 171579441.5,
          PORCENTAJE_DEUDA_TOTAL: 10.98,
        },
        {
          PROVINCIA: "LA PAMPA",
          CANTIDAD_FACTURAS: 9,
          DEUDA_PROVINCIA: 144401754.96,
          PORCENTAJE_DEUDA_TOTAL: 9.24,
        },
        {
          PROVINCIA: "JUJUY",
          CANTIDAD_FACTURAS: 42,
          DEUDA_PROVINCIA: 86211411.72,
          PORCENTAJE_DEUDA_TOTAL: 5.52,
        },
        {
          PROVINCIA: "SAN JUAN",
          CANTIDAD_FACTURAS: 3,
          DEUDA_PROVINCIA: 43496737.44,
          PORCENTAJE_DEUDA_TOTAL: 2.78,
        },
        {
          PROVINCIA: "TUCUMAN",
          CANTIDAD_FACTURAS: 22,
          DEUDA_PROVINCIA: 36790251.7,
          PORCENTAJE_DEUDA_TOTAL: 2.36,
        },
        {
          PROVINCIA: "CHACO",
          CANTIDAD_FACTURAS: 1,
          DEUDA_PROVINCIA: 4825800,
          PORCENTAJE_DEUDA_TOTAL: 0.31,
        },
        {
          PROVINCIA: "ENTRE RIOS",
          CANTIDAD_FACTURAS: 5,
          DEUDA_PROVINCIA: 4669393.2,
          PORCENTAJE_DEUDA_TOTAL: 0.3,
        },
        {
          PROVINCIA: "SALTA",
          CANTIDAD_FACTURAS: 1,
          DEUDA_PROVINCIA: 1218755.1,
          PORCENTAJE_DEUDA_TOTAL: 0.08,
        },
        {
          PROVINCIA: "NEUQUEN",
          CANTIDAD_FACTURAS: 1,
          DEUDA_PROVINCIA: 355995.3,
          PORCENTAJE_DEUDA_TOTAL: 0.02,
        },
      ]
      const deudaClientes = [
        {
          PROVINCIA: "MENDOZA",
          COD_CLIENT: "HME014",
          RAZON_SOCI: "MINISTERIO SALUD MENDOZA",
          DEUDA_CLIENTE: 283926402.2,
          PORCENTAJE_DEUDA_TOTAL: 18.18,
          CANTIDAD_FACTURAS: 11,
          PROMEDIO_POR_FACTURA: 25811491.11,
        },
        {
          PROVINCIA: "SANTA FE",
          COD_CLIENT: "HSF013",
          RAZON_SOCI: "MINISTERIO DE SALUD SANTA FE",
          DEUDA_CLIENTE: 271594740,
          PORCENTAJE_DEUDA_TOTAL: 17.39,
          CANTIDAD_FACTURAS: 5,
          PROMEDIO_POR_FACTURA: 54318948,
        },
        {
          PROVINCIA: "SAN LUIS",
          COD_CLIENT: "HSL001",
          RAZON_SOCI: "ESTADO PROVINCIA DE SAN LUIS",
          DEUDA_CLIENTE: 171579441.5,
          PORCENTAJE_DEUDA_TOTAL: 10.98,
          CANTIDAD_FACTURAS: 3,
          PROMEDIO_POR_FACTURA: 57193147.17,
        },
        {
          PROVINCIA: "CORDOBA",
          COD_CLIENT: "HCB002",
          RAZON_SOCI: "MINISTERIO DE SALUD - FARMACIA CENTRAL ",
          DEUDA_CLIENTE: 163049776,
          PORCENTAJE_DEUDA_TOTAL: 10.44,
          CANTIDAD_FACTURAS: 7,
          PROMEDIO_POR_FACTURA: 23292825.14,
        },
        {
          PROVINCIA: "LA PAMPA",
          COD_CLIENT: "HP0001",
          RAZON_SOCI: "MIN SALUD LA PAMPA",
          DEUDA_CLIENTE: 144401754.96,
          PORCENTAJE_DEUDA_TOTAL: 9.24,
          CANTIDAD_FACTURAS: 9,
          PROMEDIO_POR_FACTURA: 16044639.44,
        },
        {
          PROVINCIA: "SAN JUAN",
          COD_CLIENT: "HSJ002",
          RAZON_SOCI: "GOBIERNO PCIA SAN JUAN ADM CTRAL",
          DEUDA_CLIENTE: 41211428.2,
          PORCENTAJE_DEUDA_TOTAL: 2.64,
          CANTIDAD_FACTURAS: 1,
          PROMEDIO_POR_FACTURA: 41211428.2,
        },
        {
          PROVINCIA: "JUJUY",
          COD_CLIENT: "HJ0008",
          RAZON_SOCI: "HOSPITAL SAN ROQUE",
          DEUDA_CLIENTE: 39219369.02,
          PORCENTAJE_DEUDA_TOTAL: 2.51,
          CANTIDAD_FACTURAS: 9,
          PROMEDIO_POR_FACTURA: 4357707.67,
        },
        {
          PROVINCIA: "MENDOZA",
          COD_CLIENT: "HME003",
          RAZON_SOCI: "HOSPITAL CENTRAL",
          DEUDA_CLIENTE: 33051785.28,
          PORCENTAJE_DEUDA_TOTAL: 2.12,
          CANTIDAD_FACTURAS: 11,
          PROMEDIO_POR_FACTURA: 3004707.75,
        },
        {
          PROVINCIA: "SANTA FE",
          COD_CLIENT: "HSF011",
          RAZON_SOCI: "MUNICIPALIDAD DE ROSARIO",
          DEUDA_CLIENTE: 30619307.1,
          PORCENTAJE_DEUDA_TOTAL: 1.96,
          CANTIDAD_FACTURAS: 17,
          PROMEDIO_POR_FACTURA: 1801135.71,
        },
        {
          PROVINCIA: "JUJUY",
          COD_CLIENT: "HJ0024",
          RAZON_SOCI: "MINISTERIO DE SALUD JUJUY",
          DEUDA_CLIENTE: 26702893.01,
          PORCENTAJE_DEUDA_TOTAL: 1.71,
          CANTIDAD_FACTURAS: 12,
          PROMEDIO_POR_FACTURA: 2225241.08,
        },
      ] */

      const deudaProvincias = await obtenerDeudaProvincia({
        fechaDesde: period.start,
        fechaHasta: period.end,
      })
      console.log(JSON.stringify(deudaProvincias))
      setDataDeudasProvincias(deudaProvincias)
      setDataDeudasClientes(deudaClientes)
    }
    llenarData()
  }, [period])

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "16px",
          padding: "1.2rem 1.5rem",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)",
          marginBottom: "1.5rem",
          color: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "1rem",
            boxShadow: "inset 0 0 6px rgba(255,255,255,0.05)",
            minWidth: "260px",
            color: "#e2e8f0",
            fontSize: "0.9rem",
          }}
        >
          <label
            style={{
              marginBottom: "0.5rem",
              color: "#94a3b8",
              fontWeight: 700,
            }}
          >
            Seleccionar fechas
          </label>
          <DateRangePicker
            start={period.start}
            end={period.end}
            onChange={(newRange: any) => setPeriod(newRange)}
          />
        </div>
      </div>
      <GraficoBarras
        data={dataDeudasClientes}
        dataKeyX="RAZON_SOCI"
        dataKeyY="DEUDA_CLIENTE"
        titulo="Deuda por Cliente"
        width="100%"
        height="80vh"
      />
      <GraficoBarras
        data={dataDeudasProvincias}
        dataKeyX="PROVINCIA"
        dataKeyY="DEUDA_PROVINCIA"
        titulo="Deuda por Provincia"
        width="100%"
        height="80vh"
      />
    </div>
  )
}

export default InformesCobranzas
