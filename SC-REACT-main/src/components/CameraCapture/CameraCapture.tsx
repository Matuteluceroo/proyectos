import React, { useState } from "react"
import "./CameraCapture.css"
import Button from "../Button/Button"

type ResizeOptions = {
  maxWidth?: number
  maxHeight?: number
  quality?: number // entre 0 y 1
}

type CameraCaptureProps = {
  onConfirm?: (imageData: string) => void
  resizeOptions?: ResizeOptions
}

const CameraCapture = ({ onConfirm, resizeOptions }: CameraCaptureProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const resizeImage = (
    file: File,
    { maxWidth = 300, maxHeight = 300, quality = 0.7 }: ResizeOptions
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        if (!e.target?.result) return
        img.src = e.target.result as string
      }

      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL("image/jpeg", quality)
        resolve(dataUrl)
      }

      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const resized = await resizeImage(file, resizeOptions || {})
    setCapturedImage(resized)
  }

  const handleConfirm = () => {
    if (capturedImage && onConfirm) {
      onConfirm(capturedImage)
    }
  }

  const handleReset = () => {
    setCapturedImage(null)
  }

  return (
    <div className="camera-capture d-flex flex-column align-items-center gap-2">
      <h3 className="camera-title">Capturar Foto</h3>

      {!capturedImage ? (
        <label className="upload-area">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          <img
            src="https://cdn-icons-png.flaticon.com/512/685/685655.png"
            alt="Icono cámara"
            width="48"
            height="48"
          />
          <div className="upload-text">
            Tocá aquí para subir o tomar una foto
          </div>
        </label>
      ) : (
        <>
          <img
            src={capturedImage}
            alt="Foto capturada"
            className="camera-image"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              borderRadius: "12px",
              border: "2px solid #ccc",
            }}
          />

          <div className="d-flex justify-content-center gap-2 mt-2">
            <Button
              className="btnHeader2"
              text="CONFIRMAR"
              onClick={handleConfirm}
            />
            <Button
              className="btnHeader2"
              text="ELEGIR OTRA"
              onClick={handleReset}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default CameraCapture
