import React, { useState, forwardRef } from "react"
import MultiFilterDropdown from "./MultiFilterDropdown"
import "./VirtualizedTable.css"
import { HeaderTableProps } from "../../types/TableTypes"

const HeaderTable = forwardRef<HTMLDivElement, HeaderTableProps>(
  (
    { columns, filters, setFilters, setSortConfig, rows, filteredRows },
    ref
  ) => {
    const [filterOpeners, setFilterOpeners] = useState<{
      [key: string]: () => void
    }>({})

    const getUniqueValues = (colId: string) => {
      try {
        const fuente = filters[colId]?.length ? rows : filteredRows
        return [
          ...new Set(
            (fuente || []).map((row) => row[colId]?.toString()).filter(Boolean)
          ),
        ]
      } catch {
        return []
      }
    }

    const handleSortClick = (colId: string) => {
      setSortConfig((prev) => {
        if (prev.key === colId) {
          if (prev.direction === "asc") return { key: colId, direction: "desc" }
          if (prev.direction === "desc") return { key: null, direction: null }
        }
        return { key: colId, direction: "asc" }
      })
    }

    return (
      <div className="header-table" ref={ref}>
        {columns.map((col) =>
          col.visible === false ? null : (
            <div
              key={col.id}
              className={`header-cell ${
                filters[col.id]?.length ? "header-cell-filtered" : ""
              }`}
              style={{ width: col.width, minWidth: col.width }}
              onClick={() => {
                if (col.options && filterOpeners[col.id]) {
                  filterOpeners[col.id]()
                } else {
                  handleSortClick(col.id)
                }
              }}
            >
              <div className="header-label">{col.label}</div>

              {col.options && (
                <MultiFilterDropdown
                  columnName={col.label}
                  columnId={col.id}
                  columnType={col.type}
                  allValues={getUniqueValues(col.id)}
                  filteredRows={filteredRows}
                  selectedValues={filters[col.id] || []}
                  onChange={(newVals) =>
                    setFilters((prev) => ({ ...prev, [col.id]: newVals }))
                  }
                  setSortConfig={setSortConfig}
                  registerOpener={(opener) =>
                    setFilterOpeners((prev) => ({ ...prev, [col.id]: opener }))
                  }
                />
              )}
            </div>
          )
        )}
      </div>
    )
  }
)

export default HeaderTable
