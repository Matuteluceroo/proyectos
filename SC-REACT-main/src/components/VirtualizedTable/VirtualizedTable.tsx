import React, {
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react"
import AutoSizer from "react-virtualized-auto-sizer"
import HeaderTable from "./HeaderTable"
import VirtualizedBodyTable from "./VirtualizedBodyTable"
import { sortData } from "../../services/functions"
import "./VirtualizedTable.css"
import { SortConfig, VirtualizedTableProps } from "../../types/TableTypes"
import { useResizeDetector } from "react-resize-detector"

const VirtualizedTable = forwardRef(
  (
    {
      nombreTabla,
      columns,
      rows,
      onCellChange,
      initialFilters = {},
      setRows,
      onClickRow = () => {},
      onFiltersChange,
    }: VirtualizedTableProps,
    ref
  ) => {
    const bodyRef = useRef<any>(null)
    const { height: headerHeight, ref: headerRef } = useResizeDetector()
    const [filters, setFilters] = useState(() => {
      if (nombreTabla) {
        try {
          const saved = JSON.parse(
            localStorage.getItem("filters_" + nombreTabla)?.toString() || "{}"
          )
          if (!saved) return initialFilters
          const hayFiltrosActivos = Object.values(saved).some(
            (arr) => Array.isArray(arr) && arr.length > 0
          )

          return hayFiltrosActivos ? saved : initialFilters
        } catch (e) {
          return initialFilters
        }
      }
      return initialFilters
    })
    const [sortConfig, setSortConfig] = useState<SortConfig>({
      key: null,
      direction: null,
    })

    useEffect(() => {
      if (nombreTabla) {
        localStorage.setItem("filters_" + nombreTabla, JSON.stringify(filters))
      }
    }, [filters, nombreTabla])

    const internalCellChange = (
      changinRow: any,
      columnId: string,
      newValue: any
    ) => {
      if (onCellChange) return onCellChange(changinRow, columnId, newValue)
      if (changinRow === undefined) return
      if (setRows) {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row === changinRow ? { ...row, [columnId]: newValue } : row
          )
        )
      }
    }

    const filteredSortedRows = useMemo(() => {
      let filtered = rows

      for (let i = 0; i < columns.length; i++) {
        if (columns[i].options) {
          const valueFunction = columns[i]?.value
          if (typeof valueFunction === "function") {
            for (let j = 0; j < filtered.length; j++) {
              const newValue = valueFunction(filtered[j])
              filtered[j].estado = newValue
            }
          }
        }
      }

      Object.entries(filters).forEach(([key, selectedValues]) => {
        if (Array.isArray(selectedValues) && selectedValues.length > 0) {
          filtered = filtered.filter((row) =>
            selectedValues.includes(row[key]?.toString())
          )
        }
      })
      filtered = sortData(filtered, sortConfig, columns)

      return filtered
    }, [rows, filters, sortConfig, columns])

    const totalTableWidth = columns.reduce((acc, col) => {
      const w = parseInt(col.width?.replace("px", "") || "100")
      return acc + w
    }, 0)

    useImperativeHandle(ref, () => ({
      getData: () => rows,
      getFilteredData: () => filteredSortedRows,
      getFilters: () => filters,
      setFilters: (newFilters: any) => setFilters(newFilters),
      scrollToRow: (index: number) => {
        bodyRef.current?.scrollToRow(index)
      },
    }))

    useEffect(() => {
      if (onFiltersChange) onFiltersChange(filters, filteredSortedRows)
    }, [filters, filteredSortedRows])

    useEffect(() => {
      const handler = (e: Event) => {
        const { cellIndex } = (e as CustomEvent).detail
        setRows((prev) => {
          const nuevaFila = {} // ← reemplazá con tu generador de fila vacía
          const newRows = [...prev, nuevaFila]

          // Esperá al próximo frame, scrollea, y luego enfocá
          requestAnimationFrame(() => {
            bodyRef.current?.scrollToRow(newRows.length - 1)

            requestAnimationFrame(() => {
              const table = document.querySelectorAll(".table-row")
              const nuevaFila = table[table.length - 1]
              const nuevaCelda =
                nuevaFila?.querySelectorAll("textarea, input")[cellIndex]
              if (nuevaCelda instanceof HTMLElement) {
                nuevaCelda.focus()
                if (nuevaCelda instanceof HTMLTextAreaElement) {
                  const len = nuevaCelda.value.length
                  nuevaCelda.setSelectionRange(len, len)
                }
              }
            })
          })

          return newRows
        })
      }

      window.addEventListener("add-row", handler)
      return () => window.removeEventListener("add-row", handler)
    }, [])

    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        {!filteredSortedRows ? (
          <div className="alert alert-warning" role="alert">
            No hay datos en la tabla.
          </div>
        ) : (
          <>
            <HeaderTable
              ref={headerRef}
              columns={columns}
              filters={filters}
              setFilters={setFilters}
              setSortConfig={setSortConfig}
              rows={rows}
              filteredRows={filteredSortedRows}
            />

            <div style={{ minWidth: "250px", width: "100%", height: "100%" }}>
              <AutoSizer>
                {({ height }) => (
                  <VirtualizedBodyTable
                    ref={bodyRef}
                    height={headerHeight ? height - headerHeight : height}
                    width={totalTableWidth}
                    columns={columns}
                    rows={filteredSortedRows}
                    onCellChange={internalCellChange}
                    onClickRow={onClickRow}
                    onAddRow={(cellIndex) => {
                      window.dispatchEvent(
                        new CustomEvent("add-row", { detail: { cellIndex } })
                      )
                    }}
                  />
                )}
              </AutoSizer>
            </div>
          </>
        )}
      </div>
    )
  }
)
export default VirtualizedTable
