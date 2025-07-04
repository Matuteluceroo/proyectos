export type DataLicitacion = {
  id: string | null
  codCliente: string
  cliente: string
  fecha: string
  hora: string
  objeto: string
  tipo: string
  nroLic: string
  estado?: string | null
  usuarios?: any[]
}
