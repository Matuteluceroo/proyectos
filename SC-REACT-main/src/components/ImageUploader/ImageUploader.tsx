import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "../../components/Button/Button"

import "../FileUpload/FileUpload.css"; // Reutilizamos tu estilo .drop-zone

interface ModalImageUploaderProps {
    onInsert: (base64: string) => void;
}

const ModalImageUploader = ({ onInsert }: ModalImageUploaderProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = () => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                onInsert(reader.result);
                setIsOpen(false);
                setFile(null);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <>
            <Button text="📸 Subir imagen"
                className="boton-accion" onClick={() => setIsOpen(true)} />

            {isOpen &&
                createPortal(
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            background: "rgba(0, 0, 0, 0.6)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 9999,
                        }}
                        onClick={() => setIsOpen(false)}
                    >
                        <div
                            style={{
                                background: "#fff",
                                padding: "2rem",
                                borderRadius: "12px",
                                width: "400px",
                                textAlign: "center",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>Subí una imagen</h3>
                            <div
                                className="drop-zone"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const droppedFile = e.dataTransfer.files?.[0];
                                    if (droppedFile) setFile(droppedFile);
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        const selectedFile = e.target.files?.[0];
                                        if (selectedFile) setFile(selectedFile);
                                    }}
                                />
                                {file ? (
                                    <p className="drop-text">Imagen seleccionada: {file.name}</p>
                                ) : (
                                    <p className="drop-text">
                                        Arrastrá una imagen o hacé clic para seleccionarla
                                    </p>
                                )}
                            </div>
                            <br />
                            <Button text="Insertar en el editor"
                                className="boton-accion" onClick={handleUpload} />
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
};

export default ModalImageUploader;
