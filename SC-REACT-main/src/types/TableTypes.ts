export type Column = {
  id: string
  label: string
  width?: string
  value?: (row: any) => any
  editable?: boolean | ((row: any) => boolean)
  cellStyle?: (row: any) => React.CSSProperties | null
  visible?: boolean
  options?: boolean
  backgroundColor?: string | ((row: any) => string)
  type?: 'text' | 'number' | 'checkbox' | 'month' | 'nsd' | 'date'
  ico?: string
  onclick?: (row: any, rowIndex: number) => void
}

export type SortConfig = {
  key: string | null
  direction: 'asc' | 'desc' | null
}

export type VirtualizedTableProps = {
  nombreTabla?: string
  columns: Column[]
  rows: any[] // Puedes definir un tipo más específico para `row`
  setRows: React.Dispatch<React.SetStateAction<any[]>>
  onCellChange?: (row: any, columnId: string, newValue: any) => void
  initialFilters?: { [key: string]: string[] }
  onClickRow?: (row: any, e?: any) => void
  onFiltersChange?: (
    filters: { [key: string]: string[] },
    filteredRows: any[]
  ) => void
}

export type HeaderTableProps = {
  columns: Column[]
  filters: { [key: string]: string[] }
  setFilters: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>
  setSortConfig: React.Dispatch<
    React.SetStateAction<{
      key: string | null
      direction: 'asc' | 'desc' | null
    }>
  >
  rows: any[] // Puedes definir un tipo específico para `row` si lo tienes
  filteredRows: any[] // Igualmente, si tienes un tipo para `row`, defínelo aquí
}

export type MultiFilterDropdownProps = {
  columnName: string
  columnId: string
  columnType?: string
  allValues: string[] // Asumimos que "allValues" es un arreglo de cadenas de texto
  filteredRows: any[] // Podrías definir un tipo específico para cada fila, por ejemplo, si tienes un tipo de `row`
  selectedValues: string[] // Valores seleccionados (si es un filtro de cadenas)
  onChange: (values: string[]) => void // Función que maneja el cambio de valores seleccionados
  setSortConfig: (config: { key: string; direction: 'asc' | 'desc' }) => void
  registerOpener?: (open: () => void) => void // Función opcional para abrir el dropdown
}

export type VirtualizedBodyTableProps = {
  width: number
  height: number
  rows: any[] // puedes definir un tipo específico para `row` si lo deseas
  columns: Column[]
  onCellChange?: (row: any, columnId: string, value: any) => void
  onClickRow: (row: any, e?: any) => void
  onAddRow?: (cellIndex: number) => void
}

export type CellTableCompProps = {
  row: any
  col: Column
  rowIndex: number
  onCellChange?: (row: any, columnId: string, value: any) => void
  onAddRow?: (cellIndex: number) => void
}
