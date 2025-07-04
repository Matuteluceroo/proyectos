import { DocumentoModel } from '../models/documentos.js';

export class DocumentoController {
  static async crear(req, res) {
    const { titulo, html, textoPlano, autor } = req.body;
    if (!titulo || !html || !textoPlano || !autor) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    try {
      const nuevo = await DocumentoModel.crear({
        titulo,
        html,
        textoPlano,
        fechaCreacion: new Date(),
        autor,
      });
      return res.status(201).json({ mensaje: 'Documento creado', documento: nuevo });
    } catch (e) {
      return res.status(500).json({ mensaje: 'Error al crear documento', error: e.message });
    }
  }

  static async buscar(req, res) {
    const { q } = req.query;
    if (!q) return res.status(400).json({ mensaje: 'Falta parámetro de búsqueda' });

    try {
      const resultados = await DocumentoModel.buscar({ query: q });
      return res.json(resultados);
    } catch (e) {
      return res.status(500).json({ mensaje: 'Error en la búsqueda', error: e.message });
    }
  }

  static async getByID(req, res) {
    const { id } = req.params;
    try {
      const doc = await DocumentoModel.getByID({ id });
      if (!doc) return res.status(404).json({ mensaje: 'Documento no encontrado' });
      return res.json(doc);
    } catch (e) {
      return res.status(500).json({ mensaje: 'Error al obtener documento', error: e.message });
    }
  }
}
