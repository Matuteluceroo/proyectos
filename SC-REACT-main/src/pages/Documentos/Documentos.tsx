import { useState, useEffect, useRef } from "react";
import Estructura from "../../components/Estructura/Estructura";
import FormReutilizable from "../../components/DynamicForm/FormReutilizable";
import {
  FormReutilizableRef,
  Field,
} from "../../components/DynamicForm/FormReutilizableTypes";
import { useSocket } from "../../services/SocketContext";
import Button from "../../components/Button/Button";
import { useEnviarContenido } from "../../services/connections/contenido";
import AlertErrores from "../../components/Alert/AlertErrores";
import Alert from "../../components/Alert/Alert";
import TablaContenidos from "./TablaContenidos"; // la tabla que armamos
import "./Documentos.css"; // 🎨 Estilos del layout balanceado

export default function Documentos() {
  const formRef = useRef<FormReutilizableRef>(null);
  const [tituloAlerta, setTituloAlerta] = useState("");
  const [alerta, setAlerta] = useState(false);
  const [msgAlerta, setMsgAlerta] = useState("");
  const [alertaError, setAlertaError] = useState(false);
  const { currentUser } = useSocket();
  const enviarContenido = useEnviarContenido();
  const fields: Field[] = [
    {
      nombreCampo: "titulo",
      labelText: "Título",
      type: "text",
      placeholder: "Ingrese el título",
    },
    {
      nombreCampo: "descripcion",
      labelText: "Descripción",
      type: "textarea",
      placeholder: "Ingrese la descripción",
    },
    {
      nombreCampo: "id_tipo",
      labelText: "Tipo de Contenido",
      type: "select",
      options: [
        { value: 1, label: "PDF" },
        { value: 2, label: "Video" },
        { value: 3, label: "Imagen" },
      ],
      placeholder: "Seleccione tipo",
    },
    {
      nombreCampo: "id_usuario",
      labelText: "Usuario",
      type: "text",
      defaultValue: currentUser?.usuario || "",
      placeholder: "Usuario actual",
      disabled: true,
    },
    {
      nombreCampo: "archivo",
      labelText: "Archivo",
      type: "fileCont",
    },
    {
      nombreCampo: "tags",
      labelText: "Tags",
      type: "text",
      placeholder: "Ejemplo: cosecha;herramientas;manual",
    },
  ];

  const handleSubmit = async () => {
    if (formRef.current) {
      const data = formRef.current.getFormData();
      try {
        await enviarContenido({
          titulo: data.titulo,
          descripcion: data.descripcion,
          id_tipo: data.id_tipo,
          id_usuario: data.id_usuario, // recordá que el back va a resolver el ID real
          archivo: data.archivo, // viene de fileCont
          tags: data.tags,
        });

        setTituloAlerta("¡Éxito!");
        setMsgAlerta("Contenido guardado correctamente.");
        setAlerta(true);
      } catch (error) {
        setTituloAlerta("Error");
        setMsgAlerta("No se pudo guardar el contenido.");
        setAlertaError(true);
      }
    }
  };
  return (
    <Estructura>
      <div className="documentos-dashboard">
        {/* Header principal */}
        <div className="documentos-header">
          <h1 className="documentos-title">📚 GESTIÓN DE DOCUMENTOS</h1>
          <p className="documentos-subtitle">Sistema de administración de contenido citrícola</p>
        </div>

        <div className="documentos-layout">
          {/* Panel de subida de contenido */}
          <div className="documentos-upload-panel">
            <div className="documentos-card">
              <div className="documentos-card-header">
                <h2 className="documentos-card-title">
                  📤 <span>Subir Contenido</span>
                </h2>
              </div>
              <div className="documentos-card-body">
                <FormReutilizable ref={formRef} fields={fields} />
                <Button
                  className="documentos-btn-primary"
                  onClick={handleSubmit}
                  text={"📁 Guardar Contenido"}
                />
              </div>
            </div>
          </div>

          {/* Panel de lista de contenidos */}
          <div className="documentos-list-panel">
            <div className="documentos-card">
              <div className="documentos-card-header">
                <h2 className="documentos-card-title">
                  📋 <span>Lista de Contenidos</span>
                </h2>
              </div>
              <div className="documentos-card-body">
                <TablaContenidos />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Alert
        titulo={tituloAlerta}
        message={msgAlerta}
        duration={5000}
        setIsOpen={setAlerta}
        isOpen={alerta}
      />
      <AlertErrores
        setIsOpen={setAlertaError}
        isOpen={alertaError}
        message={msgAlerta}
        titulo={tituloAlerta}
      />
    </Estructura>
  );
}
