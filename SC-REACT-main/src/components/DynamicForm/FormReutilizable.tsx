import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./FormReutilizable.css";
import { Field, Props, FormReutilizableRef } from "./FormReutilizableTypes";
import Select from "react-select";
import AlertErrores from "../Alert/AlertErrores";

const FormReutilizable = forwardRef<FormReutilizableRef, Props>(
  ({ fields, onChangeForm, values }, ref) => {
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [formValues, setFormValues] = useState<Record<string, any>>({});

    useEffect(() => {
      const initialValues: Record<string, any> = {};

      fields.forEach((f) => {
        if ("group" in f && Array.isArray(f.fields)) {
          f.fields.forEach((sf) => {
            initialValues[sf.nombreCampo] =
              values?.[sf.nombreCampo] ??
              sf.defaultValue ??
              (sf.type === "checkbox" ? false : "");
          });
        } else {
          const field = f as Field;
          initialValues[field.nombreCampo] =
            values?.[field.nombreCampo] ??
            field.defaultValue ??
            (field.type === "checkbox" ? false : "");
        }
      });

      setFormValues(initialValues);

      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.setAllFields(initialValues);
      }
    }, [fields, values]);

    const handleChange = (campo: string, valor: any) => {
      setFormValues((prev) => {
        const nuevos = { ...prev, [campo]: valor };
        onChangeForm?.(nuevos);
        return nuevos;
      });
    };
    const validarArchivo = (file: File, campo: string) => {
      const tipoElegido = formValues["id_tipo"]; // valor elegido en el select
      let valido = false;

      if (tipoElegido === 1 && file.type === "application/pdf") valido = true;
      if (tipoElegido === 2 && file.type.startsWith("video/")) valido = true;
      if (tipoElegido === 3 && file.type.startsWith("image/")) valido = true;

      if (!valido) {
        setAlertMsg(
          `Debés subir un archivo del tipo correcto. Tipo esperado: ${
            tipoElegido === 1 ? "PDF" : tipoElegido === 2 ? "VIDEO" : "IMAGEN"
          }`
        );
        setAlertOpen(true);
        return;
      }

      handleChange(campo, file);
    };

    useImperativeHandle(ref, () => ({
      getFormData: () => formValues,
      setFieldValue: (campo: string, valor: any) =>
        setFormValues((prev) => {
          const nuevos = { ...prev, [campo]: valor };
          onChangeForm?.(nuevos);
          return nuevos;
        }),
      setAllFields: (valores: Record<string, any>) => setFormValues(valores),
    }));

    const handleKeyNavigation = (e: React.KeyboardEvent<HTMLElement>) => {
      const target = e.target as HTMLElement;
      const form = target.closest("form") as HTMLFormElement | null;

      if (!form) return;

      const elements = Array.from(form.elements) as HTMLElement[];
      const index = elements.indexOf(target);

      if (e.key === "Enter") {
        e.preventDefault();
        const next = elements[e.shiftKey ? index - 1 : index + 1];
        if (next && typeof next.focus === "function") next.focus();
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = elements[index - 1];
        if (prev && typeof prev.focus === "function") prev.focus();
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = elements[index + 1];
        if (next && typeof next.focus === "function") next.focus();
      }
    };

    const renderField = (f: Field) => {
      const {
        nombreCampo,
        labelText,
        type,
        placeholder,
        options = [],
        width,
      } = f;
      const valor = formValues[nombreCampo] ?? "";
      const style = width ? { width } : {};

      return (
        <div
          key={nombreCampo}
          /* className="mb-2" */
          style={style}
        >
          {type !== "button" && (
            <label htmlFor={nombreCampo} className="lbl-formCliente">
              {labelText}
            </label>
          )}

          {type === "button" ? (
            <div
              style={{ display: "flex", alignItems: "center", height: "42px" }}
            >
              <button
                style={{
                  height: "100%",
                  width: "100%",
                  border: "1px solid var(--borde-input)",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  fontSize: "20px",
                  fontWeight: "bold",
                  lineHeight: "1",
                  color: "#333",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  f.onClick?.();
                }}
              >
                {labelText}
              </button>
            </div>
          ) : type === "select" ? (
            <div onKeyDown={handleKeyNavigation}>
              <Select
                id={nombreCampo}
                classNamePrefix="react-select"
                options={options}
                isSearchable={true}
                value={options.find((opt) => opt.value === valor)}
                onChange={(selectedOption) => {
                  handleChange(nombreCampo, selectedOption?.value || "");
                  if (selectedOption?.label) {
                    handleChange("optionLabel", selectedOption.label);
                  }
                }}
                placeholder={placeholder || "Seleccione..."}
              />
            </div>
          ) : type === "radio" ? (
            <div style={{ display: "flex", gap: "10px" }}>
              {options.map((opt, i) => (
                <label key={i}>
                  <input
                    type="radio"
                    name={nombreCampo}
                    value={opt.value}
                    checked={valor === opt.value}
                    onChange={(e) => handleChange(nombreCampo, e.target.value)}
                    onKeyDown={handleKeyNavigation}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          ) : type === "textarea" ? (
            <textarea
              id={nombreCampo}
              className="inp-txt form-input"
              placeholder={placeholder}
              value={valor}
              onChange={(e) => handleChange(nombreCampo, e.target.value)}
              onKeyDown={handleKeyNavigation}
              disabled={f.disabled}
            />
          ) : type === "file" ? (
            <div>
              <input
                type="file"
                id={nombreCampo}
                accept="image/*"
                className="inp-txt form-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === "string") {
                        handleChange(nombreCampo, reader.result); // base64
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {valor && (
                <div style={{ marginTop: "0.5rem" }}>
                  <img
                    src={valor}
                    alt="Vista previa"
                    style={{ maxHeight: "150px", borderRadius: "6px" }}
                  />
                </div>
              )}
            </div>
          ) : type === "fileCont" ? (
            <div>
              <label htmlFor={nombreCampo} className="lbl-formCliente">
                {labelText}
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    validarArchivo(file, nombreCampo);
                  }
                }}
                style={{
                  border: "2px dashed #aaa",
                  borderRadius: "6px",
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                }}
                onClick={() => document.getElementById(nombreCampo)?.click()}
              >
                <p>
                  Arrastrá y soltá un archivo aquí, o hacé clic para
                  seleccionarlo
                </p>
                <input
                  type="file"
                  id={nombreCampo}
                  accept=".pdf, image/*, video/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      validarArchivo(file, nombreCampo);
                    }
                  }}
                />
              </div>

              {valor && (
                <div style={{ marginTop: "0.5rem" }}>
                  {valor.type?.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(valor)}
                      style={{ maxHeight: "150px" }}
                    />
                  ) : valor.type?.startsWith("video/") ? (
                    <video controls style={{ maxHeight: "150px" }}>
                      <source
                        src={URL.createObjectURL(valor)}
                        type={valor.type}
                      />
                    </video>
                  ) : valor.type === "application/pdf" ? (
                    <p>📄 {valor.name}</p>
                  ) : (
                    <p>Archivo seleccionado: {valor.name}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <input
              type={type}
              id={nombreCampo}
              className="inp-txt form-input"
              placeholder={placeholder}
              value={valor}
              onChange={(e) => handleChange(nombreCampo, e.target.value)}
              onKeyDown={handleKeyNavigation}
              disabled={f.disabled}
            />
          )}
        </div>
      );
    };

    return (
      <>
        <form className="form-cliente">
          {fields.map((f) => {
            if ("group" in f && Array.isArray(f.fields)) {
              return (
                <div key={f.nombreCampo} className="form-row-horizontal">
                  {f.fields.map((sf) => renderField(sf))}
                </div>
              );
            }
            return renderField(f as Field);
          })}
        </form>
        <AlertErrores
          isOpen={alertOpen}
          setIsOpen={setAlertOpen}
          message={alertMsg}
          titulo="Archivo inválido"
        />
      </>
    );
  }
);

export default FormReutilizable;
