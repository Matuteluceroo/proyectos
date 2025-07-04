import { StockModel } from '../models/stock.js'

const formatearFecha = (fechaISO, conHora = false) => {
    const fecha = new Date(fechaISO);

    // Ajustar los valores a la zona horaria local
    const dia = String(fecha.getUTCDate()).padStart(2, "0");
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const anio = fecha.getUTCFullYear();

    if (conHora) {
        const hora = String(fecha.getUTCHours()).padStart(2, "0"); // Hora UTC
        const minutos = String(fecha.getUTCMinutes()).padStart(2, "0"); // Minutos UTC
        return `${anio}-${mes}-${dia} ${hora}:${minutos}`;
    }

    return `${anio}-${mes}-${dia}`;
};

export class StockController {
    static async getAll(req, res) {
        try {
            const listaNombres = await StockModel.getAll()
            if (listaNombres.length === 0)
                return res.status(404).json({ mensaje: 'No hay productos almacenados' })

            return res.status(200).json(listaNombres)
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Stcok', error: e.message })
        }
    }

    static async getByIdLicitacion(req, res) {
        const { idLicitacion } = req.params;

        if (!idLicitacion) return res.status(404).json({ mensaje: 'No hay id de licitación' });
        try {
            parseInt(idLicitacion)
            const listaStock = await StockModel.getByIdLicitacion({ idLicitacion });

            for (let i = 0; i < listaStock.length; i++) {
                listaStock[i]['droga_presentacion'] = listaStock[i]['descripcion_stock']
                listaStock[i]['observaciones'] = `SALDO STOCK:  ${listaStock[i]['saldo_control_stock']}

DEPÓSITO: ${listaStock[i]['descripcion_deposito']}`

                listaStock[i]['mantenimiento'] = "Fecha venc: " + formatearFecha(listaStock[i]['fecha_vencimiento'])

                listaStock[i]['modificadoPor'] = "STOCK"
            }

            return res.json(listaStock);
        } catch (e) {
            console.log("error: ", e.message)
            return res.status(404).json({ mensaje: 'Ocurrió un error en stock', error: e.message });
        }


    }

}
