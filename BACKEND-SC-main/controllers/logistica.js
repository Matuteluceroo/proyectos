import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LogisticaModel } from "../models/logistica.js";
import { formatearFecha } from "../functions/functions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class LogisticaController {

    static async eliminarParteEntrega(req, res) {
        const { nro_hoja_ruta } = req.params;
        try {
            const respuesta = await LogisticaModel.eliminarParteEntrega({ nro_hoja_ruta })
            if (!respuesta) return res.status(404).json({ mensaje: 'Parte no encontrado' })

            return res.json({ mensaje: 'Parte no encontrado' })
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error al Eliminar', error: e.message })
        }
    }
    static async obtenerPartesEntregaByNro(req, res) {
        const { nro_hoja_ruta } = req.params;
        try {
            const respuesta = await LogisticaModel.obtenerPartesEntregaByNro({ nro_hoja_ruta })

            if (!respuesta) return res.status(404).json({ mensaje: 'Parte no encontrado' })
            for (let i = 0; i < respuesta.length; i++) {
                respuesta[i]["FECHA_PARTE"] = formatearFecha(respuesta[i]["FECHA_PARTE"])
                respuesta[i]["FECHA_ENTREGA"] = formatearFecha(respuesta[i]["FECHA_ENTREGA"])
            }
            return res.json(respuesta)
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error al Eliminar', error: e.message })
        }
    }

    static async crearHojaRuta(req, res) {
        const { redireccion, fecha_parte, fecha_entrega, descripcion_lote, id_conductor, nombre_transp, estado_entrega, observaciones, deposito } = req.body
        try {

            const nroHoja = await LogisticaModel.crearHojaRuta({ input: { redireccion, fecha_parte, fecha_entrega, descripcion_lote, id_conductor, nombre_transp, estado_entrega, observaciones, deposito } })
            return res.status(200).json({ nroHoja })
        } catch (err) {
            console.error("Error al crear hoja de ruta:", err)
            return res.status(500).json({ error: "No se pudo crear la hoja de ruta" })
        }
    }

    static async agregarRemitoHoja(req, res) {
        try {
            const { nroHoja, remitos } = req.body

            if (!nroHoja || !remitos?.length) {
                return res.status(400).json({ error: "Faltan datos obligatorios" })
            }

            await LogisticaModel.agregarRemitosAHoja({ nroHoja, remitos })
            return res.status(200).json({ mensaje: "Remitos asociados con éxito" })
        } catch (err) {
            console.error("Error al asociar remitos:", err)
            return res.status(500).json({ error: "No se pudieron asociar remitos" })
        }
    }

    static async obtenerPartesEntrega(req, res) {
        try {
            const { deposito } = req.params
            console.log(deposito)
            if (!deposito) return res.status(404).json({ message: 'No tiene asignado un deposito' })
            const partes = await LogisticaModel.obtenerPartesEntrega(deposito)
            if (partes.length === 0) return res.status(404).json({ message: 'No hay parte almacenados' })
            for (let i = 0; i < partes.length; i++) {
                partes[i]["FECHA_PARTE"] = formatearFecha(partes[i]["FECHA_PARTE"])
                partes[i]["FECHA_ENTREGA"] = formatearFecha(partes[i]["FECHA_ENTREGA"])
            }
            return res.json(partes)
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Logistica', error: e.message })
        }
    }

    static async obtenerConductores(req, res) {
        try {
            const conductores = await LogisticaModel.obtenerConductores()
            if (conductores.length === 0) return res.status(404).json({ mensaje: 'No hay conductores almacenados' })

            return res.json(conductores)
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en conductores', error: e.message })
        }
    }
    static async obtenerEstadoRemito(req, res) {
        try {
            const EstadoRemito = await LogisticaModel.obtenerEstadoRemito()
            if (EstadoRemito.length === 0) return res.status(404).json({ mensaje: 'No hay EstadoRemito almacenados' })

            return res.json(EstadoRemito)
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en EstadoRemito', error: e.message })
        }
    }

    static async agregarNroSeguimiento(req, res) {
        const { nro_remito, nro_seguimiento } = req.body;
        if (!nro_remito || !nro_seguimiento) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }

        try {
            const actualizado = await LogisticaModel.actualizarNroSeguimiento({ nro_remito, nro_seguimiento });
            if (!actualizado) return res.status(404).json({ mensaje: "Remito no encontrado" });

            return res.json({ mensaje: "Número de seguimiento actualizado" });
        } catch (error) {
            console.error("Error al actualizar nro_seguimiento:", error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    static async agregarObservaciones(req, res) {
        const { nro_remito, observaciones } = req.body;
        if (!nro_remito || !observaciones) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }

        try {
            const actualizado = await LogisticaModel.actualizarObservacion({ nro_remito, observaciones });
            if (!actualizado) return res.status(404).json({ mensaje: "Remito no encontrado" });

            return res.json({ mensaje: "Observaciones actualizadas" });
        } catch (error) {
            console.error("Error al actualizar observaciones:", error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }


    static async obtenerRemitos(req, res) {
        try {
            const remitos = await LogisticaModel.obtenerRemitos()
            if (remitos.length === 0) return res.status(404).json({ mensaje: 'No hay Remitos almacenados' })

            return res.json(remitos)
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Remitos', error: e.message })
        }
    }

    static async obtenerRemitosPendientes(req, res) {
        try {
            const remitos = await LogisticaModel.obtenerRemitosPendientes()
            if (remitos.length === 0) return res.status(404).json({ mensaje: 'No hay Remitos almacenados' })

            for (let i = 0; i < remitos.length; i++) {
                remitos[i]["fechaEnvio"] = formatearFecha(remitos[i]["fechaEnvio"])
            }
            return res.json(remitos)
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Remitos', error: e.message })
        }
    }

    static async obtenerRemitosByParte(req, res) {
        const { nro_parte } = req.params;
        try {
            const remitos = await LogisticaModel.obtenerRemitosByParte({ nro_parte })
            if (remitos.length === 0) return res.status(404).json({ mensaje: 'No hay Remitos almacenados en el parte' })
            return res.json(remitos)
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Remitos', error: e.message })
        }
    }

    static async obtenerArticulosByRemito(req, res) {
        const { nro_remito } = req.params;
        try {
            const remitos = await LogisticaModel.obtenerArticulosByRemito({ nro_remito })
            if (remitos.length === 0) return res.status(404).json({ mensaje: 'No hay Remitos almacenados' })

            return res.json(remitos)
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Remitos', error: e.message })
        }
    }

    static async obtenerImagen(req, res) {
        try {
            const { nro_remito } = req.params
            const baseDir = process.env.RUTA_FOTO_REMITOS

            const extensiones = ['.jpg', '.jpeg', '.png'];
            const imagenesBase64 = [];

            // Leer carpetas por mes
            const carpetasMes = fs.readdirSync(baseDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const carpetaMes of carpetasMes) {
                const carpetaRemito = path.join(baseDir, carpetaMes, `${nro_remito}`);

                if (fs.existsSync(carpetaRemito) && fs.lstatSync(carpetaRemito).isDirectory()) {
                    const archivos = fs.readdirSync(carpetaRemito);

                    for (const archivo of archivos) {
                        const ext = path.extname(archivo).toLowerCase();
                        if (extensiones.includes(ext)) {
                            const imagenPath = path.join(carpetaRemito, archivo);
                            const buffer = fs.readFileSync(imagenPath);
                            const base64 = buffer.toString('base64');
                            imagenesBase64.push({
                                nombreArchivo: archivo,
                                extension: ext.slice(1),
                                imagen: `data:image/${ext.slice(1)};base64,${base64}`
                            });
                        }
                    }
                    // Ya encontramos la carpeta correspondiente, no seguimos buscando en otros meses
                    break;
                }
            }

            if (imagenesBase64.length === 0) {

                return res.json({
                    nro_remito,
                    cantidad: 0,
                    imagenes: []
                });
            }
            return res.json({
                nro_remito,
                cantidad: imagenesBase64.length,
                imagenes: imagenesBase64
            });

        } catch (error) {
            console.error('Error al obtener imágenes:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    static async subirImagen(req, res) {
        try {
            const { imagen, nro_remito } = req.body;
            const ESTADO_REMITO = "ENTREGADO";

            if (!nro_remito) return res.status(400).json({ error: "Nro de remito requerido" });
            if (!imagen) return res.status(400).json({ error: "Imagen requerida" });

            const NRO_REMITO_Existe = await LogisticaModel.getByRemito({ NRO_REMITO: nro_remito });
            if (!NRO_REMITO_Existe) return res.status(404).json({ mensaje: 'El Remito no existe' });

            const matches = imagen.match(/^data:image\/(jpeg|png);base64,(.+)$/);
            if (!matches) return res.status(400).json({ error: "Formato inválido" });

            const ext = matches[1]; // jpeg o png
            const data = matches[2];
            const buffer = Buffer.from(data, "base64");

            // Obtener fecha actual: nombre mes y fecha
            const fecha = new Date();
            const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
                "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            const nombreMes = meses[fecha.getMonth()];
            const anio = fecha.getFullYear();
            const carpetaMes = `${nombreMes} - ${anio}`;

            const dia = String(fecha.getDate()).padStart(2, "0");
            const mes = String(fecha.getMonth() + 1).padStart(2, "0");
            const año = fecha.getFullYear();
            const fechaTexto = `${dia}-${mes}-${año}`;

            const remitoFolder = path.join(process.env.RUTA_FOTO_REMITOS, carpetaMes, `${nro_remito}`);
            fs.mkdirSync(remitoFolder, { recursive: true });

            // Contar archivos actuales para determinar el número de imagen
            const archivos = fs.readdirSync(remitoFolder).filter(f => f.endsWith(".jpg") || f.endsWith(".png") || f.endsWith(".jpeg"));
            const numeroImagen = archivos.length + 1;

            // Nombre del archivo
            const fileName = `${nro_remito} - ${fechaTexto} - ${numeroImagen}.${ext}`;
            const filePath = path.join(remitoFolder, fileName);

            // Guardar imagen
            fs.writeFileSync(filePath, buffer);

            // Actualizar estado del remito
            const updatedRemito = await LogisticaModel.modificarRemito({
                NRO_REMITO: nro_remito,
                input: { ESTADO_REMITO }
            });

            if (!updatedRemito) return res.status(500).json({ mensaje: 'No se pudo actualizar el remito' });

            return res.json({ mensaje: "Imagen guardada y remito actualizado", archivo: fileName });

        } catch (err) {
            console.error("Error interno:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }


}
