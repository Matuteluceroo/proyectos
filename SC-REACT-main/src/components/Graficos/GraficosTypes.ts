export type FilterConfig = {
  /** clave en tu dato objeto, p.ej. "Region" */
  field: string
  /** etiqueta a mostrar encima, p.ej. "Filtrar por región" */
  label: string
}

/** Valores únicos precalculados según el dataset */
export type FilterOptions = Record<string, string[]>

/** Estado de qué valores están seleccionados por filtro */
export type SelectedFilters = Record<string, string[]>

export type PivotOptions<
  T,
  X extends keyof T,
  S extends keyof T,
  V extends keyof T
> = {
  /** ej. 'AnioMes' */
  xKey: X
  /** ej. 'Provincia' */
  seriesKey: S
  /** ej. 'Cantidad' */
  valueKey: V
}
