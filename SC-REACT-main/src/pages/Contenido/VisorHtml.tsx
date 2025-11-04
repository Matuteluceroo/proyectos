import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Estructura from "../../components/Estructura/Estructura";
import { useBuscarHTML } from "../../services/connections/documentos";
import "./VisorHtml.css";

export default function VisorHtml() {
  const { id } = useParams<{ id: string }>();
  const buscarHTML = useBuscarHTML();
  const [contenido, setContenido] = useState<string>("");
  const [datos, setDatos] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const data = await buscarHTML(Number(id));
        setContenido(data.html);
        setDatos(data);
      } catch (err) {
        console.error("❌ Error al obtener el contenido:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Estructura>
        <p>Cargando contenido...</p>
      </Estructura>
    );
  }

  if (!datos) {
    return (
      <Estructura>
        <p>No se encontró el contenido solicitado.</p>
      </Estructura>
    );
  }

  return (
    <Estructura>
      <div className="visor-wrapper">
        <h1 className="visor-titulo">{datos.titulo}</h1>
        {datos.descripcion && (
          <p className="visor-descripcion">{datos.descripcion}</p>
        )}
        <div
          className="visor-html"
          dangerouslySetInnerHTML={{ __html: contenido }}
        />
      </div>
    </Estructura>
  );
}
