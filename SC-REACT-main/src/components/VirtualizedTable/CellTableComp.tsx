import React, { useState } from "react"
import { CellTableCompProps } from "../../types/TableTypes"

const CellTableComp = ({
  row,
  col,
  rowIndex,
  onCellChange,
  totalRows,
  onAddRow, // nuevo callback
}: CellTableCompProps & {
  totalRows: number
  onAddRow?: (cellIndex: number) => void
}) => {
  const [isFocused, setIsFocused] = useState(false)

  const baseBackground =
    typeof col.backgroundColor === "function"
      ? col.backgroundColor(row)
      : col.editable
      ? "white"
      : "#f5f5f5" // antes era #d4d4d4

  const backgroundColor = isFocused ? "#f0f0f0" : baseBackground

  const value = col.value ? col.value(row) ?? "" : row[col.id] ?? ""

  if (col.id.startsWith("btn")) {
    return (
      <div
        className="cell"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: col.width,
          minWidth: col.width,
          maxWidth: col.width,
          padding: "6px",
          border: "1px solid #e0e0e0",
          borderRadius: "4px",
          backgroundColor,
        }}
      >
        <button
          onClick={() => col.onclick?.(row, rowIndex)}
          className="cellBtn"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <img
            src={col.ico}
            alt={col.label}
            style={{
              width: "30px",
              height: "30px",
              objectFit: "contain",
            }}
          />
        </button>
      </div>
    )
  }

  const cellStyle =
    typeof col.cellStyle === "function" ? col.cellStyle(row) : {}

  const cellEditable =
    typeof col.editable === "function" ? col.editable(row) : col.editable

  return (
    <div
      className="cell"
      style={{
        width: col.width,
        minWidth: col.width,
        maxWidth: col.width,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflow: "hidden",
        padding: "6px",
        boxSizing: "border-box",
        backgroundColor,
        ...cellStyle,
      }}
    >
      {cellEditable ? (
        col.type === "checkbox" ? (
          <input
            type="checkbox"
            checked={row[col.id]}
            onChange={(e) => {
              onCellChange?.(row, col.id, e.target.checked)
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        ) : col.type === "month" ? (
          <input
            type="month"
            value={row[col.id]}
            onChange={(e) => {
              if (onCellChange) {
                onCellChange?.(row, col.id, e.target.value)
              }
            }}
            className="inpCell"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        ) : (
          <textarea
            value={value || ""}
            onChange={(e) => {
              if (col.type === "number") {
                const caracter = e.target.value
                if (!/^\d*\.?\d*$/.test(caracter)) return
              }
              onCellChange?.(row, col.id, e.target.value)
            }}
            onKeyDown={(e) => {
              const current = e.currentTarget
              const parent = current.closest(".table-row")
              if (!parent) return

              const cells = Array.from(
                parent.querySelectorAll("textarea, input")
              )
              const currentIndex = cells.indexOf(current)

              const focusNext = (element: HTMLElement | undefined) => {
                element?.focus()
                if (element instanceof HTMLTextAreaElement) {
                  element.setSelectionRange(
                    element.value.length,
                    element.value.length
                  )
                }
              }

              if (e.key === "Enter") {
                e.preventDefault()
                if (rowIndex === totalRows - 1) {
                  // Última fila → disparar creación
                  onAddRow?.(currentIndex)
                } else {
                  // Fila intermedia → bajar a la siguiente
                  const nextRow = parent.nextElementSibling as HTMLElement
                  const nextCell =
                    nextRow?.querySelectorAll("textarea, input")[currentIndex]
                  focusNext(nextCell as HTMLElement)
                }
              }

              if (e.key === "ArrowUp") {
                e.preventDefault()
                const upRow = parent.previousElementSibling as HTMLElement
                const upCell =
                  upRow?.querySelectorAll("textarea, input")[currentIndex]
                focusNext(upCell as HTMLElement)
              }

              if (e.key === "ArrowDown") {
                e.preventDefault()
                const downRow = parent.nextElementSibling as HTMLElement
                const downCell =
                  downRow?.querySelectorAll("textarea, input")[currentIndex]
                focusNext(downCell as HTMLElement)
              }
            }}
            style={{
              width: "100%",
              height: "auto",
              minHeight: "40px",
              resize: "none",
              border: "none",
              outline: "none",
              background: "transparent",
              font: "inherit",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false)
              const trimmed = e.target.value.trim()

              if (trimmed !== (row[col.id] ?? "")) {
                onCellChange?.(row, col.id, trimmed)
              }
            }}
          />
        )
      ) : (
        <div
          style={{
            width: "100%",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            font: "inherit",
          }}
        >
          {value}
        </div>
      )}
    </div>
  )
}

export default React.memo(CellTableComp)
