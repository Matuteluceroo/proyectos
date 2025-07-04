import { TarotModel } from '../models/prodsTarot.js'

export class TarotController {
  static async getAll(req, res) {
    const listaCodigos = req.body
    
    if (!listaCodigos) return res.status(404).json({ mensaje: "No hay códigos para mostrar" })
    if (listaCodigos.length === 0) return res.status(404).json({ mensaje: "No hay códigos para mostrar" })
    try {
      const listaNombres = await TarotModel.getAll({ listaCodigos });
      if (listaNombres.length === 0)
        return res.status(404).json({ mensaje: 'No hay productos almacenados' });

      return res.status(200).json(listaNombres);
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en prodsTarot', error: e.message });
    }
  }

  static async getByCodTarot(req, res) {
    const { id } = req.params;
    try {

      if (!id) return res.status(404).json({ mensaje: 'No hay código de tarot' });
      try {
        parseInt(id)
        const nombreTarot = await TarotModel.getByCodTarot({ id });
        return res.json(nombreTarot);
      } catch (e) {
        return res.status(404).json({ mensaje: 'El código de Tarot debe ser un número' });
      }

    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en prodsTarot', error: e.message });
    }
  }

  static async getListaCodigos(req, res) {
    try {
      const listaProdsTarot = await TarotModel.getListaCodigos();
      if (listaProdsTarot.length === 0)
        return res.status(404).json({ mensaje: 'No hay productos almacenados' });

      return res.status(200).json(listaProdsTarot);
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en prodsTarot', error: e.message });
    }
  }

  static async getEquivalencias(req, res) {
    console.log("🟢 Entró a getEquivalencias con query:", req.query, "y params:", req.params);
    const { busqueda } = req.params;
    try {

      if (!busqueda) {
        return res.status(400).json({ error: 'Parámetro de búsqueda requerido' });
      }

      // Obtener resultados
      const resultados = await TarotModel.buscarEquivalencias({busqueda});
      console.log("🟢 Entró a getEquivalencias con query: resultados",resultados);
      // Obtener código más frecuente
      const codigoMasFrecuente = await TarotModel.getCodigoMasFrecuente({ busqueda });
      console.log("🟢 Entró a getEquivalencias con query: codigoMasFrecuente",codigoMasFrecuente);
      res.json({
        resultados,
        codigoMasFrecuente,
        totalResultados: resultados.length
      });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: error.message });
    }

  }
}
