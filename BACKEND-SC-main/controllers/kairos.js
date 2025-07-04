import { KTCModel } from '../models/kairos.js'

export class KTCController {
    static async getAll(req, res) {
        try {
            const listaKairos = await KTCModel.getAll();
            if (listaKairos.length === 0)
                return res.status(404).json({ mensaje: 'No hay productos almacenados' });

            return res.status(200).json(listaKairos);
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Kairos 1', error: e.message });
        }
    }

    static async getByIdKairos(req, res) {
        const { idKairos } = req.params
        try {
            if (!idKairos) return res.status(404).json({ mensaje: 'No hay id de kairos' })

            const productoKairos = await KTCModel.getByIdKairos({ idKairos })
            if (!productoKairos) return res.status(404).json({ mensaje: 'No existe ese idKairos' })
            return res.json(productoKairos)
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Kairos 2', error: e.message })
        }
    }

    static async getByCodTarot(req, res) {
        const { codTarot } = req.params;

        try {
            if (!codTarot) {
                return res.status(400).json({ mensaje: 'No hay código de tarot' });
            }

            // Asegurar que el código de Tarot sea tratado como STRING
            const codTarotString = String(codTarot);

            const ktcDeProducto = await KTCModel.getByCodTarot({ codTarot: codTarotString });
            if (ktcDeProducto.length === 0) {
                return res.status(404).json({ mensaje: 'No hay productos en Kairos con ese código de Tarot' });
            }

            return res.json(ktcDeProducto);
        } catch (e) {
            return res.status(500).json({ mensaje: 'Ocurrió un error en Kairos 3', error: e.message });
        }
    }

    static async getByCodTango(req, res) {
        const { codTango } = req.params;

        try {
            if (!codTango) {
                return res.status(400).json({ mensaje: 'No hay código de tango' });
            }

            // Asegurar que el código de Tarot sea tratado como STRING
            const codTangoSTR = String(codTango);

            const ktcDeProducto = await KTCModel.getByCodTango({ codTango: codTangoSTR });
            if (ktcDeProducto.length === 0) {
                return res.status(404).json({ mensaje: 'No hay productos en Kairos con ese código de tango' });
            }

            return res.json(ktcDeProducto);
        } catch (e) {
            return res.status(500).json({ mensaje: 'Ocurrió un error en Kairos 4', error: e.message });
        }
    }

    static async getByCodAnmat(req, res) {
        const { codAnmat } = req.params
        try {

            if (!codAnmat) return res.status(404).json({ mensaje: 'No hay código de ANMAT' });
            try {
                parseInt(codAnmat)
            } catch (e) {
                return res.status(404).json({ mensaje: 'El código de ANMAT debe ser un número' });
            }
            const ktcDeProducto = await KTCModel.getByCodAnmat({ codAnmat });
            if (ktcDeProducto.length === 0) return res.status(404).json({ mensaje: 'No hay productos en Kairos con ese código de ANMAT' })
            return res.json(ktcDeProducto);
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Kairos 4', error: e.message });
        }
    }

    static async getByCodKairos(req, res) {
        const { codKairos } = req.params
        try {

            if (!codKairos) return res.status(404).json({ mensaje: 'No hay código de Karios' });

            const ktcDeProducto = await KTCModel.getByCodKairos({ codKairos });
            if (ktcDeProducto.length === 0) return res.status(404).json({ mensaje: 'No hay productos en Kairos con ese código de Kairos' })
            return res.json(ktcDeProducto);
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Kairos 4', error: e.message });
        }
    }

    static async getByLaboratorio(req, res) {
        const { laboratorio } = req.params
        try {

            if (!laboratorio) return res.status(404).json({ mensaje: 'No hay código de Karios' });

            const ktcDeProducto = await KTCModel.getByLaboratorio({ laboratorio });
            if (ktcDeProducto.length === 0) return res.status(404).json({ mensaje: 'No hay productos en Kairos de ese Laboratorio' })
            return res.json(ktcDeProducto);
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Kairos 4', error: e.message });
        }
    }

    static async getByDroga(req, res) {
        const { droga_presentacion } = req.params
        try {

            if (!droga_presentacion) return res.status(404).json({ mensaje: 'No hay código de Karios' });

            const ktcDeProducto = await KTCModel.getByDroga({ droga_presentacion });
            if (ktcDeProducto.length === 0) return res.status(404).json({ mensaje: 'No hay productos en Kairos de esa Droga Presentacion' })
            return res.json(ktcDeProducto);
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Kairos 4', error: e.message });
        }
    }

    static async agregarProductoKairos(req, res) {
        const { laboratorio, nombre_comercial, droga_presentacion, ANMAT, cod_tarot, cod_kairos, codTango } = req.body

        if (laboratorio == null ||
            nombre_comercial == null ||
            droga_presentacion == null ||
            ANMAT == null ||
            cod_tarot == null ||
            cod_kairos == null || codTango == null) return res.status(400).json({ mensaje: 'Faltan campos obligatorios' })

        try {
            const newProdKairos = await KTCModel.agregarProductoKairos({
                input: { laboratorio, nombre_comercial, droga_presentacion, ANMAT, cod_tarot, cod_kairos, codTango }
            })

            if (!newProdKairos) return res.status(401).json({ mensaje: 'El producto de Kairos no pudo ser cargado' });

            // Después de procesar todos los renglones, enviamos una respuesta exitosa
            return res.status(201).json({ mensaje: 'Producto en kairos creado correctamente', newProdKairos })
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Kairos 4', error: e.message })
        }
    }

    static async agregarListaProductoKairos(req, res) {
        const { listaAgregarKairos } = req.body
        try {
            // Extraer encabezados
            const headers = listaAgregarKairos[0]
            // Convertir cada fila de datos en un objeto
            const objetos = listaAgregarKairos.slice(1).map(fila =>
                Object.fromEntries(
                    headers.map((key, i) => [key, fila[i] != null ? String(fila[i]) : ""])
                )
            )

            objetos.forEach(async (e) => {
                const { laboratorio, nombre_comercial, droga_presentacion, ANMAT, cod_tarot, cod_kairos, codTango } = e

                const newProdKairos = await KTCModel.agregarProductoKairos({
                    input: { laboratorio, nombre_comercial, droga_presentacion, ANMAT, cod_tarot, cod_kairos, codTango }
                })
            })


            return res.status(201).json({ mensaje: 'Productos en kairos creados correctamente', listaAgregarKairos })
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Kairos', error: e.message })
        }
    }

    static async modificarProductoKairos(req, res) {
        const { idKairos } = req.params
        const { laboratorio, nombre_comercial, droga_presentacion, ANMAT, cod_tarot, cod_kairos, codTango } = req.body

        try {
            const newCompra = await KTCModel.modificarProductoKairos({
                idKairos,
                input: { laboratorio, nombre_comercial, droga_presentacion, ANMAT, cod_tarot, cod_kairos, codTango }
            });

            // Si no se crea el renglón, lanzar un error
            if (!newCompra) return res.status(404).json({ mensaje: 'Producto de Kairos no encontrado' });

            return res.status(201).json({ mensaje: 'Producto de Kairos modificado', idKairos });
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Modificar Karios', error: e.message })
        }
    }

    static async modificarListaProductoKairos(req, res) {
        const { listaModificarKairos } = req.body;

        if (!Array.isArray(listaModificarKairos) || listaModificarKairos.length < 2) {
            return res.status(400).json({ mensaje: 'Formato de datos inválido' });
        }
        
        try {
            const headers = listaModificarKairos[0];

            const objetos = listaModificarKairos.slice(1).map(fila =>
                Object.fromEntries(
                    headers.map((key, i) => [key, fila[i] != null ? String(fila[i]) : ""])
                )
            );

            const resultados = [];

            for (const item of objetos) {
                const {
                    idKairos,
                    laboratorio,
                    nombre_comercial,
                    droga_presentacion,
                    ANMAT,
                    cod_tarot,
                    cod_kairos,
                    codTango
                } = item;

                if (!idKairos) {
                    resultados.push({ idKairos: null, mensaje: "ID no especificado" });
                    continue;
                }

                try {
                    const modificado = await KTCModel.modificarProductoKairos({
                        idKairos,
                        input: {
                            laboratorio,
                            nombre_comercial,
                            droga_presentacion,
                            ANMAT,
                            cod_tarot,
                            cod_kairos,
                            codTango
                        }
                    });

                    resultados.push({ idKairos, status: "ok", modificado });
                } catch (err) {
                    resultados.push({ idKairos, status: "error", error: err.message });
                }
            }

            return res.status(200).json({ mensaje: "Modificación masiva completada", resultados });
        } catch (e) {
            return res.status(500).json({ mensaje: "Error en modificación masiva", error: e.message });
        }
    }


    static async eliminarProductoKairos(req, res) {
        const { idKairos } = req.params

        try {
            const result = await KTCModel.eliminarProductoKairos({ idKairos })

            if (!result) return res.status(404).json({ mensaje: 'Producto de Kairos no encontrado' })

            return res.json({ mensaje: 'Producto de Kairos eliminado' })
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Kairos 4', error: e.message })
        }
    }

}
