import React, { useEffect, useState } from "react";
import VirtualizedTable from "../../components/VirtualizedTable/VirtualizedTable";
import { useObtenerContenidos } from "../../services/connections/contenido";

const TablaContenidos: React.FC = () => {
  const obtenerContenidos = useObtenerContenidos();
  const [rows, setRows] = useState<any[]>([]);

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

  return (
    <div style={{ height: "500px" }}>
      <VirtualizedTable
        nombreTabla="contenidos"
        columns={columns}
        rows={rows}
        setRows={setRows}
      />
    </div>
  );
};

export default TablaContenidos;
