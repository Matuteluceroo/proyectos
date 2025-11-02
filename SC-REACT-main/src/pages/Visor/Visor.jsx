import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Estructura from "../../components/Estructura/Estructura";
import VisorContenido from "../../components/VisorContenido/VisorContenido.jsx";
import { useObtenerContenidoPorId } from "../../services/connections/contenido";

export default function Visor() {
  const { id } = useParams();
  const [contenido, setContenido] = useState(null);
  const [error, setError] = useState("");
  const obtenerContenidoPorId = useObtenerContenidoPorId();

  useEffect(() => {
    const fetchContenido = async () => {
      try {
        const data = await obtenerContenidoPorId(id);
        setContenido(data);
      } catch (err) {
        console.error("Error al cargar contenido:", err);
        setError("No se pudo cargar el contenido.");
      }
    };
    fetchContenido();
  }, [id]);

  return (
    <Estructura>
      <div style={{ padding: "1rem" }}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {contenido ? (
          <VisorContenido contenido={contenido} />
        ) : (
          <p>Cargando contenido...</p>
        )}
      </div>
    </Estructura>
  );
}
