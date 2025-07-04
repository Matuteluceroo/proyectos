import React, { useState, useEffect } from 'react'
import './RangoFecha.css'

/**
 * Props:
 *  - start: valor inicial (string "YYYY-MM-DD")
 *  - end:   valor final   (string "YYYY-MM-DD")
 *  - onChange: fn({ start, end }) al cambiar cualquiera
 */
function formatYMD(date: Date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function RangoFecha({
  start,
  end,
  onChange,
}: {
  start: string
  end: string
  onChange?: (range: { start: string; end: string }) => void
}) {
  // calculamos hoy y el primer día de este mes
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [range, setRange] = useState<{
    start: string
    end: string
  }>(() => ({
    start: start === '' ? formatYMD(firstOfMonth) : start,
    end: end === '' ? formatYMD(today) : end,
  }))

  useEffect(() => {
    onChange?.(range)
  }, [range])

  return (
    <div className="drp-container">
      <div className="drp-field">
        <label>Desde</label>
        <input
          type="date"
          value={range.start}
          onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
        />
      </div>
      <div className="drp-separator">→</div>
      <div className="drp-field">
        <label>Hasta</label>
        <input
          type="date"
          value={range.end}
          onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
          min={range.start}
          max={formatYMD(today)}
        />
      </div>
    </div>
  )
}
