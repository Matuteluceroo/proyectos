import { useState, useMemo, useEffect } from "react";
import Modal from "../../components/Modal/Modal"; // ajustá el path si corresponde
import VirtualizedTable from "../../components/VirtualizedTable/VirtualizedTable";
import { useObtenerContenidos } from "../../services/connections/contenido";
import { useObtenerArchivosDeContenido } from "../../services/connections/contenido";
import ContenidoModal from "./ContenidoModal"; // ajustá el path

export default function TablaContenidos() {
  const obtenerContenidos = useObtenerContenidos();
  const [rows, setRows] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const obtenerArchivos = useObtenerArchivosDeContenido();
  const [files, setFiles] = useState<
    { tipo: "PDF" | "IMAGEN" | "VIDEO"; fileName: string; url: string }[]
  >([]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await obtenerContenidos();
      if (data) setRows(data);
    };
    fetchData();
  }, []);

  const columns = [
    { id: "id", label: "ID", width: "50px" },
    { id: "titulo", label: "Título", width: "150px" },
    { id: "descripcion", label: "Descripción", width: "200px" },
    { id: "nombre", label: "Tipo", width: "100px" },
    { id: "autor", label: "Autor", width: "150px" },
  ];
  // estado del modal

  const handleClickRow = (row: any, e?: React.MouseEvent) => {
    // id puede llamarse distinto según tu dataset
    const rowId =
      row?.id ??
      row?.id_contenido ??
      row?.id_conocimiento ??
      row?.idContenido ??
      row?.idConocimiento;

    console.log("[handleClickRow] row:", row);
    console.log("[handleClickRow] rowId elegido:", rowId);

    if (!rowId) {
      console.warn("[handleClickRow] fila sin id -> no abro modal");
      return;
    }
    setSelectedRow({ ...row, _resolvedId: rowId });
    setIsOpen(true);
  };

  return (
    <>
      <VirtualizedTable
        nombreTabla="contenidos"
        columns={columns}
        rows={rows}
        setRows={setRows}
        onClickRow={handleClickRow}
      />

      <ContenidoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        row={selectedRow}
      />
    </>
  );
}
