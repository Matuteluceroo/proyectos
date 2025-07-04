import { SortConfig } from '../types/TableTypes'

export function formatearNumero(
  numero: number | string,
  cantidadDecimales: number = 2
): string {
  if (isNaN(Number(numero))) return ''
  const numeroRedondeado = Number(numero).toFixed(cantidadDecimales)
  const [parteEntera, parteDecimal] = numeroRedondeado.split('.')
  const parteEnteraFormateada = parteEntera.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    '.'
  )
  return `${parteEnteraFormateada},${parteDecimal}`
}
export function formatearFecha(fecha: string): string {
  const f = new Date(fecha)
  if (isNaN(f.getTime())) return ''
  return f.toISOString().slice(0, 10) // Devuelve "YYYY-MM-DD"
}

export const obtenerFechaYHoraActual = (): string => {
  const fecha = new Date()
  const dia = fecha.getDate()
  const mes = fecha.getMonth() + 1
  const año = fecha.getFullYear()
  const horas = fecha.getHours()
  const minutos = fecha.getMinutes()
  const segundos = fecha.getSeconds()

  const fechaFormateada = `${año}-${String(mes).padStart(2, '0')}-${String(
    dia
  ).padStart(2, '0')}`
  const horaFormateada = `${String(horas).padStart(2, '0')}:${String(
    minutos
  ).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`

  return `${fechaFormateada}-${horaFormateada}`
}

export function numeroALetrasConCentavos(input: number | string): string {
  const unidades = [
    '',
    'uno',
    'dos',
    'tres',
    'cuatro',
    'cinco',
    'seis',
    'siete',
    'ocho',
    'nueve',
  ]
  const decenas = [
    '',
    'diez',
    'veinte',
    'treinta',
    'cuarenta',
    'cincuenta',
    'sesenta',
    'setenta',
    'ochenta',
    'noventa',
  ]
  const especiales = [
    'once',
    'doce',
    'trece',
    'catorce',
    'quince',
    'dieciséis',
    'diecisiete',
    'dieciocho',
    'diecinueve',
  ]
  const centenas = [
    '',
    'ciento',
    'doscientos',
    'trescientos',
    'cuatrocientos',
    'quinientos',
    'seiscientos',
    'setecientos',
    'ochocientos',
    'novecientos',
  ]

  if (input == null || input === '') return 'Número no válido'

  let strNum =
    typeof input === 'number'
      ? input.toFixed(2).replace('.', ',')
      : String(input)
  const num = parseFloat(strNum.replace(/\./g, '').replace(',', '.'))
  if (isNaN(num)) return 'Número no válido'

  function convertirMenorAMil(n: number): string {
    let str = ''
    const c = Math.floor(n / 100)
    const d = Math.floor((n % 100) / 10)
    const u = n % 10

    if (n === 100) return 'cien'
    if (c > 0) str += `${centenas[c]} `
    if (d === 1 && u > 0) str += especiales[u - 1]
    else {
      if (d > 0) str += decenas[d]
      if (d > 0 && u > 0) str += ' y '
      if (u > 0) str += unidades[u]
    }
    return str.trim()
  }

  function seccion(
    n: number,
    divisor: number,
    singular: string,
    plural: string
  ): string {
    const cientos = Math.floor(n / divisor)
    const resto = n % divisor
    let letras =
      cientos > 0
        ? cientos === 1
          ? singular
          : `${convertirNumero(cientos)} ${plural}`
        : ''
    if (resto > 0) letras += ` ${convertirNumero(resto)}`
    return letras.trim()
  }

  function convertirNumero(n: number): string {
    if (n === 0) return 'cero'
    if (n < 1000) return convertirMenorAMil(n)
    if (n < 1_000_000) return seccion(n, 1000, 'mil', 'mil')
    return seccion(n, 1_000_000, 'un millón', 'millones')
  }

  const [ent, dec] = num.toFixed(2).split('.')
  const entero = parseInt(ent)
  const centavos = parseInt(dec)
  let resultado = convertirNumero(entero)
  if (centavos > 0) resultado += ` con ${convertirNumero(centavos)} centavos`
  return `pesos ${resultado}`
}
export const extraerNumerosRenglon = (
  renglon: string
): { principal: number; alternativo: number } => {
  const partes = renglon.split(' ')
  const principal = parseInt(partes[0])
  const alternativo = partes.includes('ALT') ? parseInt(partes[2] || '1') : 0
  return { principal, alternativo }
}

type Column = { id: string; options?: boolean }

export const sortData = <T>(
  data: T[],
  sortConfig: SortConfig,
  columns: Column[]
): T[] => {
  if (!sortConfig?.key) return data
  const col = columns.find((c) => c.id === sortConfig.key)
  if (!col?.options) return data

  const direction = sortConfig.direction === 'asc' ? 1 : -1

  return [...data].sort((a, b) => {
    const aVal = a[sortConfig.key as keyof T] as any
    const bVal = b[sortConfig.key as keyof T] as any

    // 1) Si uno de los dos es nulo o indefinido, los coloca al final/ principio
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1 * direction // a va después de b
    if (bVal == null) return -1 * direction // b va después de a

    // 2) Intenta fecha
    const aDate = new Date(aVal)
    const bDate = new Date(bVal)
    if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
      return (aDate.getTime() - bDate.getTime()) * direction
    }

    // 3) Si no es fecha, y no es string, conviértelo a cadena
    if (typeof aVal !== 'string' || typeof bVal !== 'string') {
      return String(aVal).localeCompare(String(bVal)) * direction
    }

    // 4) Ahora sí podemos hacer el split sin miedo
    const { principal: aP, alternativo: aA } = extraerNumerosRenglon(aVal)
    const { principal: bP, alternativo: bA } = extraerNumerosRenglon(bVal)

    // 5) Si no extrajimos números válidos, ordenamos alfabéticamente
    if (isNaN(aP) || isNaN(bP)) {
      return aVal.localeCompare(bVal) * direction
    }

    // 6) Finalmente el orden numérico compuesto
    return aP !== bP ? (aP - bP) * direction : (aA - bA) * direction
  })
}
