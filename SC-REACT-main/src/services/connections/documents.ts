import { url, headers } from "./consts"

export const useGenerarPDF = async (data: any, nombrePDF: string)=> {
  try {
    const response = await fetch(`${url}/generar-documento/pdf`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) throw new Error("Error al generar el PDF")

    const blob = await response.blob()
    const urlPDF = window.URL.createObjectURL(blob)
    window.open(urlPDF)

    const a = document.createElement("a")
    a.href = urlPDF
    a.download = `${nombrePDF}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
  } catch (error) {
    console.error("Error generando el PDF:", error)
    alert("Hubo un problema generando el PDF. Intenta de nuevo.")
  }
}

export const useGenerarExcel = async (data: any, nombreExcel: string) => {
  try {
    const response = await fetch(`${url}/generar-documento/excel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Error al generar el Excel")
    }

    const blob = await response.blob()
    const urlExcel = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = urlExcel
    a.download = `${nombreExcel}.xlsx`
    document.body.appendChild(a)
    a.click()
    a.remove()
  } catch (error) {
    console.error("Error generando el Excel:", error)
    alert("Hubo un problema generando el Excel. Intenta de nuevo.")
  }
}


export const useGenerarParteEntrega = async (data: any, nombrePDF: string) => {
  try {
    const response = await fetch(`${url}/generar-documento/parte`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Error al generar el Parte de Entrega")
    }

    const blob = await response.blob()
    const urlPDF = window.URL.createObjectURL(blob)
    window.open(urlPDF)

    const a = document.createElement("a")
    a.href = urlPDF
    a.download = `${nombrePDF}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
  } catch (error) {
    console.error("Error generando el Parte de Entrega:", error)
    alert("Hubo un problema generando el Parte de Entrega. Intenta de nuevo.")
  }
}
