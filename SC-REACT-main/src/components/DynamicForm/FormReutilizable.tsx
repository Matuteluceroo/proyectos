import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./FormReutilizable.css";
import { Field, Props, FormReutilizableRef } from "./FormReutilizableTypes";
import Select from "react-select";

const FormReutilizable = forwardRef<FormReutilizableRef, Props>(
  ({ fields, onChangeForm, values }, ref) => {
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
              className="inp-txt form-textarea"
              placeholder={placeholder}
              value={valor}
              onChange={(e) => handleChange(nombreCampo, e.target.value)}
              rows={4}
              onKeyDown={handleKeyNavigation}
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
          ) : (
            <input
              type={type}
              id={nombreCampo}
              className="inp-txt form-input"
              placeholder={placeholder}
              value={valor}
              onChange={(e) => handleChange(nombreCampo, e.target.value)}
              onKeyDown={handleKeyNavigation}
            />
          )}
        </div>
      );
    };

    return (
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
    );
  }
);

export default FormReutilizable;
