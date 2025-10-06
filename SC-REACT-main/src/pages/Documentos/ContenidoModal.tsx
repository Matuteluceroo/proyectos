import React, { useEffect, useMemo, useState } from "react";
import Modal from "../../components/Modal/Modal"; // 👈 ajustá el path si tu Modal vive en otro lado
import { useObtenerArchivosDeContenido } from "../../services/connections/contenido";

type Archivo = {
  tipo: "PDF" | "IMAGEN" | "VIDEO";
  fileName: string;
  url: string; // relativo tipo /api/contenidos/archivo/...
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  row: any | null; // la fila seleccionada (de tu tabla)
  maxWidth?: string;
};

const ContenidoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  row,
  maxWidth = "900px",
}) => {
  const obtenerArchivos = useObtenerArchivosDeContenido();
  const [files, setFiles] = useState<Archivo[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [errorFiles, setErrorFiles] = useState<string | null>(null);

  // Elegimos el id de la fila (por si tu dataset usa otros nombres)
  const contenidoId = useMemo(() => {
    if (!row) return null;
    return (
      row?.id ??
      row?.id_contenido ??
      row?.id_conocimiento ??
      row?.idContenido ??
      row?.idConocimiento ??
      null
    );
  }, [row]);

  // Cargar archivos cuando el modal abra
  useEffect(() => {
    const run = async () => {
      if (!isOpen || !contenidoId) return;
      setLoadingFiles(true);
      setErrorFiles(null);
      try {
        const data = await obtenerArchivos(String(contenidoId));
        setFiles((data?.files as Archivo[]) ?? []);
      } catch (e: any) {
        setErrorFiles(e?.message ?? "No se pudieron cargar los archivos");
      } finally {
        setLoadingFiles(false);
      }
    };
    run();
  }, [isOpen, contenidoId, obtenerArchivos]);

  // Título del modal
  const title = useMemo(() => {
    if (!row) return "Detalle";
    const base = row.titulo ?? row.nombre ?? row.id ?? contenidoId ?? "Detalle";
    return `Contenido: ${base}`;
  }, [row, contenidoId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type="ofTable"
      selectedId={contenidoId ?? row?.id}
      maxWidth={maxWidth}
    >
      {/* --- Cabecera de datos básicos --- */}
      {row && (
        <div style={{ display: "grid", gap: 8, marginBottom: 8 }}>
          <div>
            <strong>ID:</strong> {String(contenidoId ?? row.id ?? "—")}
          </div>
          <div>
            <strong>Título:</strong> {row.titulo ?? "—"}
          </div>
          <div>
            <strong>Descripción:</strong> {row.descripcion ?? "—"}
          </div>
          <div>
            <strong>Tipo:</strong> {row.nombre ?? row.tipo ?? "—"}
          </div>
          <div>
            <strong>Autor:</strong> {row.autor ?? "—"}
          </div>
          <div>
            <strong>Fecha:</strong> {row.fecha_creacion ?? row.fecha ?? "—"}
          </div>
        </div>
      )}

      {/* --- Estado de carga/errores --- */}
      {loadingFiles && <div>Cargando archivos…</div>}
      {errorFiles && <div style={{ color: "tomato" }}>{errorFiles}</div>}

      {/* --- Estado vacío --- */}
      {!loadingFiles && !errorFiles && files.length === 0 && (
        <div>No hay archivos para este contenido.</div>
      )}

      {/* --- Archivos --- */}
      {!loadingFiles && !errorFiles && files.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          {files.map((f) => {
            const key = `${f.tipo}-${f.fileName}`;

            // Enlace seguro para abrir en otra pestaña
            const Enlace = () => (
              <a href={f.url} target="_blank" rel="noreferrer" download={false}>
                Abrir {f.tipo.toLowerCase()}
              </a>
            );

            if (f.tipo === "IMAGEN") {
              return (
                <div key={key} style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontSize: 12 }}>{f.fileName}</div>
                  <img
                    src={f.url} // ✅ directo (sin Link/navigate)
                    alt={f.fileName}
                    loading="lazy"
                    onError={(e) => (e.currentTarget.style.opacity = "0.4")}
                    style={{ maxWidth: "100%", borderRadius: 8 }}
                  />
                  <Enlace />
                </div>
              );
            }

            if (f.tipo === "PDF") {
              return (
                <div key={key} style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontSize: 12 }}>{f.fileName}</div>
                  <iframe
                    title={f.fileName}
                    src={f.url} // ✅ directo
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: 500,
                      border: "1px solid #333",
                      borderRadius: 8,
                    }}
                  />
                  <Enlace />
                </div>
              );
            }

            // VIDEO
            return (
              <div key={key} style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 12 }}>{f.fileName}</div>
                <video
                  src={f.url} // ✅ directo
                  controls
                  preload="metadata"
                  onError={() =>
                    console.warn("Error cargando video:", f.fileName)
                  }
                  style={{ width: "100%", borderRadius: 8 }}
                />
                <Enlace />
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

    export default ContenidoModal;                  
