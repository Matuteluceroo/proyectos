import React, { useEffect, useRef } from 'react'
import { List, CellMeasurer, CellMeasurerCache } from 'react-virtualized'
import CellTableComp from './CellTableComp'
import { VirtualizedBodyTableProps } from '../../types/TableTypes'
import './VirtualizedTable.css'

const VirtualizedBodyTable = React.forwardRef(
  (
    {
      width,
      height,
      rows,
      columns,
      onCellChange,
      onClickRow,
    }: VirtualizedBodyTableProps,
    ref
  ) => {
    const listRef = useRef<List>(null)

    useEffect(() => {
      listRef.current?.recomputeRowHeights()
    }, [rows.length])

    const cache = new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 40,
      fixedHeight: false,
    })

    React.useImperativeHandle(ref, () => ({
      scrollToRow: (index: number) => {
        requestAnimationFrame(() => {
          const totalHeight = rows.reduce(
            (sum, _, i) => sum + cache.getHeight(i, 0),
            0
          )
          if (totalHeight <= height) {
            // Si no hay scroll, scroll automático al elemento
            const fila = document.querySelectorAll('.table-row')[
              index
            ] as HTMLElement
            if (fila) {
              fila.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          } else {
            // Si hay scroll, usar scroll virtualizado
            for (let i = 0; i <= index; i++) {
              if (!cache.has(i, 0)) {
                listRef.current?.recomputeRowHeights(i)
              }
            }
            let offset = 0
            for (let i = 0; i < index; i++) {
              offset += cache.getHeight(i, 0)
            }
            listRef.current?.scrollToPosition(offset)
          }
        })
      },
    }))

    return (
      <List
        ref={listRef}
        width={width}
        height={height}
        rowCount={rows.length}
        rowHeight={cache.rowHeight}
        deferredMeasurementCache={cache}
        rowRenderer={({ index, key, style, parent }) => {
          const row = rows[index]
          return (
            <CellMeasurer
              key={key}
              cache={cache}
              parent={parent}
              rowIndex={index}
              columnIndex={0}
            >
              <div
                className="table-row"
                style={{ ...style, display: 'flex', width }}
                onClick={(e) => onClickRow(row, e)}
              >
                {columns.map((col) =>
                  col.visible === false ? null : (
                    <CellTableComp
                      key={col.id}
                      col={col}
                      row={row}
                      rowIndex={index}
                      totalRows={rows.length}
                      onCellChange={onCellChange}
                      onAddRow={(cellIndex) => {
                        const event = new CustomEvent('add-row', {
                          detail: { cellIndex },
                        })
                        window.dispatchEvent(event)
                      }}
                    />
                  )
                )}
              </div>
            </CellMeasurer>
          )
        }}
      />
    )
  }
)

export default VirtualizedBodyTable
