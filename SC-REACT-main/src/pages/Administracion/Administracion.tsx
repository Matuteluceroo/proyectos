import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  MouseEvent,
} from "react";
import Button from "../../components/Button/Button";
import {
  useObtenerUsuarios,
  useObtenerUsuariosEnLinea,
  useAgregarUsuario,
  useModificarUsuario,
  useEliminarUsuario,
  useRestartPassword,
  useAgregarRolUsuario,
  useEliminarRolUsuario,
} from "../../services/connections/usuarios.js";
import editarIco from "../../assets/edit.svg";
import eliminarIco from "../../assets/trash.svg";
import messageIco from "../../assets/message.svg";
import Deleteable from "../../components/DeleteableElement/Deleteable";
import Estructura from "../../components/Estructura/Estructura";
import VirtualizedTable from "../../components/VirtualizedTable/VirtualizedTable";
import FormReutilizable from "../../components/DynamicForm/FormReutilizable";
import type { FormReutilizableRef } from "../../components/DynamicForm/FormReutilizableTypes";
import Alert from "../../components/Alert/Alert";
import AlertErrores from "../../components/Alert/AlertErrores";
import AlertCuidado from "../../components/Alert/AlertCuidado";
import { Rol } from "../../services/connections/usuarios.js";
import { useNavigate } from "react-router-dom";
import ModalNotificaciones from "../../components/ModalNotificaciones/ModalNotificaciones";
import AlertOptions from "../../components/Alert/AlertOptions";

const LISTA_ROLES: Rol[] = [
  "LICITADOR",
  "ADMINISTRADOR",
  "EMPLEADO",
  "EXPERTO",
  "SIN_ROL",
];

type UsuarioType = {
  id: number;
  userName: string;
  rol: Rol;
  nombre: string;
  idZona: string;
  otros: string;
  online?: boolean;
  rolesDeUsuario?: { rol: Rol; idUsuario: number }[];
};

type FormData = {
  id: number | null;
  userName: string;
  rol: Rol;
  nombre: string;
  idZona: string;
  otros: string;
};

const Administracion: React.FC = () => {
  const [alertConfirm, setAlertConfirm] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<UsuarioType | null>(null);

  const obtenerUsuarios = useObtenerUsuarios();
  const obtenerUsuariosEnLinea = useObtenerUsuariosEnLinea();
  const agregarUsuario = useAgregarUsuario();
  const modificarUsuario = useModificarUsuario();
  const eliminarUsuario = useEliminarUsuario();
  const restartPassword = useRestartPassword();
  const agregarRolUsuario = useAgregarRolUsuario();
  const eliminarRolUsuario = useEliminarRolUsuario();
  const navigate = useNavigate();
  const formRef = useRef<FormReutilizableRef>(null);
  const [usuarios, setUsuarios] = useState<UsuarioType[]>([]);
  const [hiddenBtnsOnEdit, setHiddenBtnOnEdit] = useState(true);
  const [rolesDeUsuario, setRolesDeUsuario] = useState<
    { rol: Rol; idUsuario: number }[]
  >([]);

  const [alerta, setAlerta] = useState({
    isOpen: false,
    titulo: "",
    message: "",
  });
  const [alertaError, setAlertaError] = useState({
    isOpen: false,
    titulo: "",
    message: "",
  });
  const [alertaCuidado, setAlertaCuidado] = useState({
    isOpen: false,
    titulo: "",
    message: "",
  });
  const [modalNotificacionOpen, setModalNotificacionOpen] = useState({
    isOpen: false,
    receptorName: "",
  });

  const [formData, setFormData] = useState<FormData>({
    id: null,
    userName: "",
    rol: "EMPLEADO",
    nombre: "",
    idZona: "",
    otros: "",
  });

  const cargarUsuarios = async () => {
    const dataUsuarios = await obtenerUsuarios();
    const usuariosEnLinea = await obtenerUsuariosEnLinea();

    dataUsuarios.forEach((user: UsuarioType) => {
      if (
        usuariosEnLinea.some(
          (onLine: any) => user.userName === onLine.userData.usuario
        )
      ) {
        user.online = true;
      }
    });

    setUsuarios(dataUsuarios);
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const crearUsuario = async () => {
    if (formData.userName.trim() === "" || formData.nombre.trim() === "") {
      setAlertaCuidado({
        isOpen: true,
        titulo: "Cuidado",
        message: "Debe llenar los campos Usuario y Nombre",
      });
      return;
    }
    if (!formRef.current) return;

    const datosForm = formRef.current.getFormData();

    try {
      const val = await agregarUsuario({
        userName: datosForm.userName ?? "",
        nombre: datosForm.nombre ?? "",
        idZona: datosForm.idZona ?? "",
        otros: datosForm.otros ?? "",
        rol: formData.rol,
      });

      if (!val) {
        setAlertaError({
          isOpen: true,
          titulo: "Error",
          message: "Hubo un error al agregar el usuario",
        });
        return;
      }
      setAlerta({
        isOpen: true,
        titulo: "¡Éxito!",
        message: "Usuario agregado exitosamente",
      });
      cancelarEdicion();
      cargarUsuarios();
    } catch {
      setAlertaError({
        isOpen: true,
        titulo: "Error",
        message: "Hubo un error al agregar el usuario",
      });
    }
  };

  const editarUsuario = async () => {
    if (!formData.userName || !formData.nombre) {
      setAlertaCuidado({
        isOpen: true,
        titulo: "Cuidado",
        message: "Debe llenar los campos Usuario y Nombre",
      });
      return;
    }
    const currentID = formData.id;
    if (currentID && formRef.current) {
      const dataParaEditar = formRef.current.getFormData();
      const datosCompletos = {
        userName: dataParaEditar.userName ?? "",
        nombre: dataParaEditar.nombre ?? "",
        idZona: dataParaEditar.idZona ?? "",
        otros: dataParaEditar.otros ?? "",
        rol: formData.rol,
        id: currentID,
      };

      await modificarUsuario({
        idUsuario: currentID,
        datos: datosCompletos,
      });

      setAlerta({
        isOpen: true,
        titulo: "¡Éxito!",
        message: "USUARIO MODIFICADO",
      });
      await cargarUsuarios();
    } else {
      setAlertaError({
        isOpen: true,
        titulo: "Error",
        message: "ERROR AL MODIFICAR EL USUARIO",
      });
    }
  };

  const cancelarEdicion = () => {
    setHiddenBtnOnEdit(true);
    const defaultForm: FormData = {
      id: null,
      userName: "",
      rol: "LICITADOR",
      nombre: "",
      idZona: "",
      otros: "",
    };
    setFormData(defaultForm);
    formRef.current?.setAllFields(defaultForm);
  };

  const reiniciarPassword = async () => {
    if (
      window.confirm("¿Estás seguro de que deseas reestablecer la contraseña?")
    ) {
      if (formData.id == null) {
        console.error("No se puede reiniciar contraseña: id es null");
        return;
      }
      await restartPassword({ idUsuario: formData.id });

      setAlerta({
        isOpen: true,
        titulo: "¡Éxito!",
        message: "CONTRASEÑA ACTUALIZADA",
      });
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const llenarCampos = (row: UsuarioType) => {
    setHiddenBtnOnEdit(false);
    setRolesDeUsuario(row.rolesDeUsuario ?? []);
    setFormData({ ...row });
    formRef.current?.setAllFields(row);
  };

  // Servicio API (ya existente, lo importás): eliminarUsuario({ idUsuario: number })

  const handleEliminarUsuario = async () => {
    if (!rowToDelete) return;

    try {
      await eliminarUsuario({ idUsuario: rowToDelete.id });

      setAlerta({
        isOpen: true,
        titulo: "¡Éxito!",
        message: "Usuario eliminado exitosamente",
      });

      setUsuarios((prev) => prev.filter((u) => u.id !== rowToDelete.id));
    } catch {
      setAlertaError({
        isOpen: true,
        titulo: "Error",
        message: "Hubo un error al eliminar el usuario",
      });
    } finally {
      setAlertConfirm(false);
      setRowToDelete(null);
    }
  };

  const agregarNuevoRol = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (formData.id == null) {
      setAlertaCuidado({
        isOpen: true,
        titulo: "Cuidado",
        message: "No se puede agregar un rol si el usuario no tiene ID.",
      });
      return;
    }

    const nuevoRol = { idUsuario: formData.id, rol: formData.rol };

    setRolesDeUsuario((prev) => [...prev, nuevoRol]);

    await agregarRolUsuario({
      idUsuario: formData.id,
      rol: formData.rol,
    });
  };

  const handleDeleteElement = async (value: {
    rol: Rol;
    idUsuario: number;
  }) => {
    setRolesDeUsuario((prev) => prev.filter((rol) => rol.rol !== value.rol));
    await eliminarRolUsuario({
      idUsuario: value.idUsuario,
      rol: value.rol,
    });
  };

  const camposFormulario = [
    { nombreCampo: "userName", labelText: "Usuario:" },
    { nombreCampo: "nombre", labelText: "Nombre:" },
    { nombreCampo: "idZona", labelText: "Zona:" },
    { nombreCampo: "otros", labelText: "Otros:" },
  ].map(({ nombreCampo, labelText }) => ({
    nombreCampo,
    labelText,
    type: "text" as const,
    placeholder: labelText,
    defaultValue: formData[nombreCampo as keyof FormData] as string,
  }));

  const estiloCeldaOnline = ({ online }: UsuarioType) => ({
    backgroundColor: online ? "#c6e7bd" : "rgb(223, 122, 122)",
  });

  const enviarNotificacion = (row: any) => {
    const receptorName = row.userName;
    setModalNotificacionOpen({
      isOpen: true,
      receptorName,
    });
  };

  const listaCols = [
    { id: "id", label: "ID", width: "50px", options: true },
    {
      id: "userName",
      label: "Usuario",
      width: "120px",
      cellStyle: estiloCeldaOnline,
      options: true,
    },
    { id: "rol", label: "Rol", width: "120px", options: true },
    { id: "nombre", label: "Nombre", width: "150px", options: true },
    { id: "idZona", label: "Zona", width: "90px", options: true },
    { id: "otros", label: "Otros", width: "420px" },
    {
      id: "btnEditar",
      label: "Editar",
      width: "60px",
      ico: editarIco,
      onclick: llenarCampos,
    },
    {
      id: "btnEliminar",
      label: "Eliminar",
      width: "70px",
      ico: eliminarIco,
      onclick: (row: UsuarioType) => {
        setRowToDelete(row);
        setAlertConfirm(true);
      },
    },
    {
      id: "btnEnviarNotificacion",
      label: "Notificacion",
      width: "70px",
      ico: messageIco,
      onclick: enviarNotificacion,
    },
  ];

  const handleFormChange = (valores: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...valores }));
  };
  return (
    <Estructura>
      <div style={{ height: "100%", overflow: "hidden" }}>
        <div className="row align-items-center justify-content-center mb-3">
          <div className="col-4 d-flex justify-content-start" />
          <div className="col-4 text-center">
            <h1 className="headerTitle m-0">ADMINISTRACIÓN</h1>
          </div>
          <div className="col-4 d-flex justify-content-end gap-2">
            <Button
              text={"VER SUGERENCIA"}
              className="boton-accion"
              onClick={() => navigate("/sugerencias")}
              title="Ver cotizacion"
            />
          </div>
        </div>
        <div className="row h-100 m-0">
          <div
            className="col-3 d-flex flex-column"
            style={{ height: "100%", overflowY: "auto" }}
          >
            <FormReutilizable
              ref={formRef}
              fields={camposFormulario}
              onChangeForm={handleFormChange}
            />

            {!hiddenBtnsOnEdit && (
              <div
                className="mb-2"
                style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}
              >
                <div style={{ flex: 1 }}>
                  <label className="lbl-formCliente">Roles</label>
                  <select
                    id="rol"
                    className="form-input"
                    value={formData.rol}
                    onChange={handleInputChange}
                  >
                    {LISTA_ROLES.map((rol) => (
                      <option key={rol} value={rol}>
                        {rol}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn btn-light border"
                  style={{ height: "38px", width: "38px", lineHeight: 0 }}
                  onClick={agregarNuevoRol}
                  title="Agregar rol"
                >
                  +
                </button>
              </div>
            )}
            {!hiddenBtnsOnEdit && (
              <div
                style={{
                  maxHeight: "120px",
                  overflowY: "auto",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "4px",
                }}
              >
                {rolesDeUsuario
                  .sort((a, b) => a.rol.localeCompare(b.rol))
                  .map((value, index) => (
                    <Deleteable
                      key={index}
                      txtValue={value.rol}
                      onClick={() => handleDeleteElement(value)}
                    />
                  ))}
              </div>
            )}

            {/* Botones */}
            <div className="row mt-3">
              {hiddenBtnsOnEdit ? (
                <div className="col-12">
                  <Button
                    text={"Crear Usuario"}
                    className="btnHeader2"
                    onClick={crearUsuario}
                  />
                </div>
              ) : (
                <>
                  <div className="col-4">
                    <Button
                      text={"Editar"}
                      className="btnFuncTabla"
                      onClick={editarUsuario}
                    />
                  </div>
                  <div className="col-4">
                    <Button
                      text={"Cancelar"}
                      className="btnFuncTabla btnRojo"
                      onClick={cancelarEdicion}
                    />
                  </div>
                  <div className="col-4">
                    <Button
                      text={"Reiniciar"}
                      className="btnFuncTabla btnAzul"
                      onClick={reiniciarPassword}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="col-9 d-flex flex-column" style={{ height: "100%" }}>
            <div style={{ height: "85vh" }}>
              <VirtualizedTable
                rows={usuarios}
                setRows={setUsuarios}
                columns={listaCols}
              />
            </div>
          </div>
        </div>
      </div>
      <Alert
        isOpen={alerta.isOpen}
        titulo={alerta.titulo}
        message={alerta.message}
        setIsOpen={(val) =>
          setAlerta((prev) => ({
            ...prev,
            isOpen: typeof val === "function" ? val(prev.isOpen) : val,
          }))
        }
      />

      <AlertErrores
        isOpen={alertaError.isOpen}
        titulo={alertaError.titulo}
        message={alertaError.message}
        setIsOpen={(val) =>
          setAlertaError((prev) => ({
            ...prev,
            isOpen: typeof val === "function" ? val(prev.isOpen) : val,
          }))
        }
      />
      <AlertOptions
        isOpen={alertConfirm}
        title="¿Eliminar contenido?"
        message="Esta acción no se puede deshacer. ¿Querés continuar?"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={handleEliminarUsuario}
        onCancel={() => {
          setAlertConfirm(false);
          setRowToDelete(null);
        }}
      />

      <AlertCuidado
        isOpen={alertaCuidado.isOpen}
        titulo={alertaCuidado.titulo}
        message={alertaCuidado.message}
        setIsOpen={(val) =>
          setAlertaCuidado((prev) => ({
            ...prev,
            isOpen: typeof val === "function" ? val(prev.isOpen) : val,
          }))
        }
      />

      <ModalNotificaciones
        isOpen={modalNotificacionOpen.isOpen}
        receptorName={modalNotificacionOpen.receptorName}
        onClose={() =>
          setModalNotificacionOpen({
            isOpen: false,
            receptorName: "",
          })
        }
      />
    </Estructura>
  );
};

export default Administracion;
