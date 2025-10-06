import Modal from "../Modal/Modal";
import { useState, useEffect } from "react";
import { MultiFilterDropdownProps } from "../../types/TableTypes";
import "./VirtualizedTable.css";

const MultiFilterDropdown = ({
  columnName,
  columnId,
  columnType,
  allValues,
  filteredRows,
  selectedValues = [],
  onChange,
  setSortConfig,
  registerOpener,
}: MultiFilterDropdownProps) => {
  // Guarda si un grupo (yearMonth) está abierto o cerrado
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (registerOpener) {
      registerOpener(() => setIsOpen(true));
    }
  }, []);

  const toggleValue = (val: any) => {
    const next = selectedValues.includes(val)
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val];
    onChange(next);
  };

  const toggleGroup = (yearMonth: string, dates: string[]) => {
    // ¿Todas las fechas de este grupo ya están en selectedValues?
    const allSelected = dates.every((date) => selectedValues.includes(date));

    let next: string[];
    if (allSelected) {
      // Si estaban todas, las quitamos
      next = selectedValues.filter((v) => !dates.includes(v));
    } else {
      // Si no estaban todas, las añadimos
      // además de las que ya estaban seleccionadas
      next = Array.from(new Set([...selectedValues, ...dates]));
    }

    onChange(next);
  };

  const toggleGroupVisibility = (yearMonth: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [yearMonth]: !prev[yearMonth], // invierte el valor actual (undefined→true)
    }));
  };

  const groupByYearOrMonth = (values: string[]) => {
    const grouped: { yearMonth: string; dates: string[] }[] = [];
    values.forEach((val) => {
      const d = new Date(val);
      if (isNaN(d.getTime())) return; // saltar valores no fecha
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const g = grouped.find((x) => x.yearMonth === ym);
      if (g) g.dates.push(val);
      else grouped.push({ yearMonth: ym, dates: [val] });
    });
    return grouped;
  };

  const filteredValues = allValues.filter((val) =>
    val.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ListaValoresFiltros = () => {
    if (columnType === "date") {
      const groupedValues = groupByYearOrMonth(filteredValues);
      return (
        <div style={{ maxHeight: "350px", overflowY: "auto" }}>
          {groupedValues.length === 0 ? (
            <div style={{ padding: "5px", fontSize: "12px" }}>
              No hay resultados
            </div>
          ) : (
            groupedValues.map((group) => {
              const { yearMonth, dates } = group;
              const allSelected = dates.every((date) =>
                selectedValues.includes(date)
              );
              const isOpen = Boolean(openGroups[yearMonth]); // abierto o no

              return (
                <div key={yearMonth}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: 10,
                      marginBottom: 5,
                    }}
                  >
                    {/* Checkbox de seleccionar todo el mes */}
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => toggleGroup(yearMonth, dates)}
                    />

                    {/* Icono de desplegar/plegar */}
                    <span
                      onClick={() => toggleGroupVisibility(yearMonth)}
                      style={{
                        cursor: "pointer",
                        userSelect: "none",
                        margin: "0 8px",
                      }}
                    >
                      {isOpen ? "▼" : "▶"}
                    </span>

                    {/* Texto del año-mes también despliega/plega */}
                    <span
                      onClick={() => toggleGroupVisibility(yearMonth)}
                      style={{ cursor: "pointer", fontWeight: "bold" }}
                    >
                      {yearMonth}
                    </span>
                  </div>

                  {/* Si está abierto, mostramos las fechas */}
                  {isOpen &&
                    dates
                      .sort((a, b) =>
                        a.localeCompare(b, "es", {
                          numeric: true,
                          sensitivity: "base",
                        })
                      )
                      .map((val) => (
                        <label
                          key={val}
                          style={{ display: "block", margin: "4px 0 4px 32px" }} // indentado mayor
                        >
                          <input
                            type="checkbox"
                            checked={selectedValues.includes(val)}
                            onChange={() => toggleValue(val)}
                          />
                          {val}
                        </label>
                      ))}
                </div>
              );
            })
          )}
        </div>
      );
    } else {
      return (
        <div style={{ maxHeight: "350px", overflowY: "auto" }}>
          {filteredValues.length === 0 ? (
            <div style={{ padding: "5px", fontSize: "12px" }}>
              No hay resultados
            </div>
          ) : (
            [...filteredValues]
              .sort((a, b) =>
                a.localeCompare(b, "es", { numeric: true, sensitivity: "base" })
              )

              .map((val) => (
                <label key={val} style={{ display: "block", margin: "4px 0" }}>
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(val)}
                    onChange={() => toggleValue(val)}
                  />
                  {val}
                </label>
              ))
          )}
        </div>
      );
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Filtrar ${columnName}`}
        minWidth="auto"
        maxWidth="90vw"
      >
        <div className="modal-filtro">
          <div className="botones-orden">
            <button
              className="boton-orden"
              onClick={() => {
                setSortConfig({ key: columnId, direction: "asc" });
                setIsOpen(false);
              }}
            >
              ↑ Ascendente
            </button>
            <button
              className="boton-orden"
              onClick={() => {
                setSortConfig({ key: columnId, direction: "desc" });
                setIsOpen(false);
              }}
            >
              ↓ Descendente
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <input
              className="buscador-filtro"
              type="text"
              placeholder="Buscar..."
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchTerm.trim() !== "") {
                  e.preventDefault();
                  const entrada = searchTerm.trim().toLowerCase();
                  const encontrados = (filteredRows || [])
                    .map((row) => row[columnId]?.toString())
                    .filter(Boolean)
                    .filter((val) => val.toLowerCase().includes(entrada));
                  if (encontrados.length > 0) {
                    onChange([...new Set([...selectedValues, ...encontrados])]);
                  }
                  setSearchTerm("");
                }
              }}
            />
            <button className="eliminar-btn" onClick={() => onChange([])}>
              Limpiar Filtros
            </button>
          </div>

          {/* Lista de valores */}
          <ListaValoresFiltros />
        </div>
      </Modal>
    </>
  );
};

export default MultiFilterDropdown;
