import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path';
import { dirname, resolve } from 'path'
import fs from 'fs/promises'
import { writeFileSync, unlinkSync } from 'fs'
import { Buffer } from "buffer"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export class GenerarDocumentoController {
  static async generarExcel(req, res) {
    console.log("excel aqui")
    const rutaScript = resolve(__dirname, "../scripts_python/generador_excel/generador_excel.py")
    const inputJson = JSON.stringify(req.body)
    const jsonTempPath = resolve(__dirname, "../scripts_python/generador_excel/input_excel.json")

    try {
      writeFileSync(jsonTempPath, inputJson, { encoding: "utf-8" })

      exec(`py "${rutaScript}" < "${jsonTempPath}"`, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        try {
          // Siempre intentamos borrar el archivo
          unlinkSync(jsonTempPath)
        } catch (err) {
          console.warn("No se pudo eliminar input_excel.json:", err.message)
        }

        if (error) {
          console.error("Error en ejecución:", error.message)
          return res.status(500).json({ error: error.message })
        }

        try {
          const output = JSON.parse(stdout)
          const buffer = Buffer.from(output.contentBase64, 'base64')

          res.setHeader("Content-Disposition", `attachment; filename=${output.fileName}`)
          res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
          res.send(buffer)
        } catch (e) {
          console.error("Error al parsear JSON:", stdout)
          return res.status(500).json({ error: "Error al generar Excel" })
        }
      })
    } catch (e) {
      return res.status(500).json({ error: "Fallo inesperado" })
    }
  }

  static async generarPdf(req, res) {
    const rutaScript = resolve(__dirname, "../scripts_python/generador_pdf/generar_pdf_local.py")
    const jsonTempPath = resolve(__dirname, "input_pdf.json")
    const inputJson = JSON.stringify(req.body)

    try {
      writeFileSync(jsonTempPath, inputJson, { encoding: "utf-8" })

      exec(`py "${rutaScript}" < "${jsonTempPath}"`, { maxBuffer: 15 * 1024 * 1024 }, (error, stdout, stderr) => {
        unlinkSync(jsonTempPath)

        if (error) {
          console.error("Error en ejecución:", error.message)
          return res.status(500).json({ mensaje: error.message })
        }

        try {
          const output = JSON.parse(stdout)
          const pdfBuffer = Buffer.from(output.contentBase64, 'base64')

          res.setHeader("Content-Type", "application/pdf")
          res.setHeader("Content-Disposition", 'inline; filename="documento.pdf"')
          res.send(pdfBuffer)
        } catch (e) {
          console.error("Error al parsear salida:", stdout)
          return res.status(500).json({ mensaje: "Error al procesar PDF" })
        }
      })
    } catch (e) {
      return res.status(500).json({ mensaje: "Error inesperado al generar PDF" })
    }
  }

  static async generarPartePDF(req, res) {
    const rutaScript = resolve(__dirname, "../scripts_python/generador_parte_entregas/retorno_parte_entregas.py")
    const jsonTempPath = resolve(__dirname, "input_parte.json")
    const inputJson = JSON.stringify(req.body)

    try {
      writeFileSync(jsonTempPath, inputJson, { encoding: "utf-8" })

      exec(`py "${rutaScript}" < "${jsonTempPath}"`, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        unlinkSync(jsonTempPath)

        if (error) {
          console.error("Error en ejecución:", error.message)
          return res.status(500).json({ error: error.message })
        }

        try {
          const output = JSON.parse(stdout)

          const pdfBuffer = Buffer.from(output.contentBase64, 'base64')

          res.setHeader("Content-Disposition", `attachment; filename="${output.fileName}"`)
          res.setHeader("Content-Type", "application/pdf")
          res.send(pdfBuffer)
        } catch (e) {
          console.error("Error al parsear JSON:", stdout)
          console.log("ERROR:", e.message)
          return res.status(500).json({ error: "Error al generar PDF" })
        }
      })
    } catch (e) {
      return res.status(500).json({ error: "Fallo inesperado al preparar el PDF" })
    }
  }

  static async obtenerComparativos(req, res) {
    const rutaScript = resolve(__dirname, '../scripts_python/comparativos/obtener_comparativos.py')

    exec(`py "${rutaScript}"`, (error, stdout, stderr) => {
      if (error) {
        console.log("ERROR 1")
        console.error(`Error al ejecutar el script: ${error.message}`)
        return res.status(500).json({ error: 'Error al ejecutar el script de Python' })
      }

      try {
        const data = JSON.parse(stdout)

        res.json(data)
      } catch (e) {
        console.error(`Error al parsear la salida del script: ${e.message}`)
        console.error(`Salida del script: ${stdout}`)
        return res.status(500).json({ error: 'Error al parsear el JSON del script' })
      }
    })
  }

  static async marcarComoCargado(req, res) {
    const { nombre_carpeta } = req.body

    if (!nombre_carpeta) {
      return res.status(400).json({ error: 'Falta el nombre de la carpeta' })
    }

    try {
      const archivo = resolve(__dirname, '../scripts_python/comparativos/cargados.txt')

      let contenido = ''
      try {
        contenido = await fs.readFile(archivo, 'utf8')
      } catch (err) {
        if (err.code !== 'ENOENT') throw err // solo ignora si el archivo no existe
      }

      const lineas = new Set(
        contenido.split('\n').map(line => line.trim()).filter(Boolean)
      )

      if (lineas.has(nombre_carpeta.trim())) {
        return res.status(200).json({ mensaje: 'La carpeta ya estaba marcada como cargada' })
      }

      await fs.appendFile(archivo, nombre_carpeta.trim() + '\n', 'utf8')
      return res.status(200).json({ mensaje: 'Carpeta marcada como cargada' })
    } catch (error) {
      console.error('❌ Error al marcar carpeta:', error)
      return res.status(500).json({ error: 'No se pudo registrar la carpeta' })
    }
  }

  static async desmarcarCargado(req, res) {
    const { nombre_carpeta } = req.body

    if (!nombre_carpeta) {
      return res.status(400).json({ error: 'Falta el nombre de la carpeta' })
    }

    try {
      const archivo = resolve(__dirname, '../scripts_python/comparativos/cargados.txt')

      // Leer archivo actual
      let contenido = ''
      try {
        contenido = await fs.readFile(archivo, 'utf8')
      } catch (err) {
        if (err.code === 'ENOENT') {
          return res.status(404).json({ mensaje: 'El archivo cargados.txt no existe aún.' })
        }
        throw err
      }

      const lineas = contenido.split('\n').map(line => line.trim()).filter(Boolean)
      const nombreNormalizado = nombre_carpeta.trim()

      if (!lineas.includes(nombreNormalizado)) {
        return res.status(200).json({ mensaje: 'La carpeta no estaba marcada como cargada' })
      }

      // Crear nuevo contenido sin la carpeta
      const nuevasLineas = lineas.filter(linea => linea !== nombreNormalizado)
      await fs.writeFile(archivo, nuevasLineas.join('\n') + '\n', 'utf8')

      return res.status(200).json({ mensaje: 'Carpeta desmarcada correctamente' })
    } catch (error) {
      console.error('❌ Error al desmarcar carpeta:', error)
      return res.status(500).json({ error: 'No se pudo desmarcar la carpeta' })
    }
  }

  static async nuevaSugerencia(req, res) {
    const { nuevaSugerencia } = req.body
    
    if (!nuevaSugerencia) {
      return res.status(400).json({ error: 'Campos Incompletos' })
    }

    try {
      const archivo = resolve(__dirname, '../scripts_python/sugerencias/sugerencias.txt');

      // Lee y agrega en un solo bloque
      await fs.mkdir(path.dirname(archivo), { recursive: true });

      let contenido = '';
      try {
        contenido = await fs.readFile(archivo, 'utf8');
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }

      const sugerencia = `${nuevaSugerencia.nombreUsuario}***${nuevaSugerencia.nombre}***${nuevaSugerencia.mensaje}`.trim();
      const regex = new RegExp(`^${escapeRegExp(sugerencia)}$`, 'm');

      if (regex.test(contenido)) {
        return res.status(200).json({ mensaje: 'Sugerencia ya registrada' });
      }

      // Append sólo si no existe
      await fs.appendFile(archivo, sugerencia + '\n', 'utf8');
      return res.status(200).json({ mensaje: 'Sugerencia guardada correctamente' });

      // Utilitario para escapar caracteres especiales en regex
      function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
    } catch (error) {
      console.error('❌ Error al guardar sugerencia:', error);
      return res.status(500).json({ error: 'Error interno al guardar la sugerencia' });
    }

  }

  static async leerSugerencias(req, res) {
  const archivo = resolve(
    __dirname,
    "../scripts_python/sugerencias/sugerencias.txt"
  );

  let contenido = "";
  try {
    contenido = await fs.readFile(archivo, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      // Si no existe el archivo, devolvemos lista vacía
      return [];
    }
    throw err;
  }

  const lineas = contenido
    .split("\n")          // separa por saltos de línea
    .map((l) => l.trim()) // elimina espacios al inicio/fin
    .filter(Boolean);     // quita líneas vacías

  const sugerencias = lineas.map((linea) => {
    const [nombreUsuario = "", nombre = "", mensaje = ""] = linea.split("***");
    return { nombreUsuario, nombre, mensaje };
  });

  return res.status(200).json({ sugerencias });
}

}