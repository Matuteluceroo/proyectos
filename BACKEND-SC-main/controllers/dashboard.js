import { sql } from "../connection.js";

// ✅ Endpoint principal del dashboard
export const getDashboardResumen = async (req, res) => {
  try {
    // === USUARIOS ===
    const usuariosTotales = await sql.query`
      SELECT COUNT(*) AS total_usuarios FROM Usuarios;
    `;

    const usuariosActivos = await sql.query`
      SELECT COUNT(DISTINCT id_usuario) AS usuarios_activos
      FROM ParticipacionEntrenamiento;
    `;

    const topUsuarios = await sql.query`
      SELECT TOP 5 
          U.nombre,
          COUNT(P.id_entrenamiento) AS actividad
      FROM Usuarios U
      LEFT JOIN ParticipacionEntrenamiento P ON U.id_usuario = P.id_usuario
      GROUP BY U.nombre
      HAVING COUNT(P.id_entrenamiento) > 0
      ORDER BY actividad DESC;
    `;

    // === CONTENIDO ===
    const contenidoTotal = await sql.query`
      SELECT COUNT(*) AS total_contenidos FROM Contenido;
    `;

    const contenidoPorMes = await sql.query`
      SELECT 
          FORMAT(fecha_creacion, 'yyyy-MM') AS mes,
          COUNT(*) AS total
      FROM Contenido
      WHERE fecha_creacion IS NOT NULL
      GROUP BY FORMAT(fecha_creacion, 'yyyy-MM')
      ORDER BY mes;
    `;

    const topContenidos = await sql.query`
      SELECT TOP 5 
          C.titulo,
          0 AS consultas
      FROM Contenido C
      ORDER BY C.fecha_creacion DESC;
    `;

    // === TAGS ===
    const topTags = await sql.query`
      SELECT TOP 5 
          ISNULL(T.nombre, 'Sin tag') AS nombre,
          COUNT(C.id_contenido) AS total
      FROM Contenido C
      LEFT JOIN Contenido_Tags CT ON CT.id_contenido = C.id_contenido
      LEFT JOIN Tags T ON T.id_tag = CT.id_tag
      GROUP BY T.nombre
      ORDER BY total DESC;
    `;

    // === ENTRENAMIENTOS ===
    const entrenamientosTotales = await sql.query`
      SELECT COUNT(*) AS total_entrenamientos FROM Entrenamientos;
    `;

    const tasaFinalizacion = await sql.query`
      SELECT 
        CAST(SUM(CASE WHEN id_estado = 2 THEN 1 ELSE 0 END) AS float)
        / NULLIF(COUNT(*), 0) * 100 AS porcentaje_finalizados
      FROM ParticipacionEntrenamiento;
    `;

    const entrenamientosPorMes = await sql.query`
      SELECT 
          FORMAT(fecha_finalizacion, 'yyyy-MM') AS mes,
          COUNT(*) AS total
      FROM ParticipacionEntrenamiento
      WHERE fecha_finalizacion IS NOT NULL
      GROUP BY FORMAT(fecha_finalizacion, 'yyyy-MM')
      ORDER BY mes;
    `;

    // === AUTORÍA ===
    const topAutores = await sql.query`
      SELECT TOP 5 
          U.nombre AS autor,
          COUNT(C.id_contenido) AS total
      FROM Contenido C
      JOIN Usuarios U ON U.id_usuario = C.id_usuario
      GROUP BY U.nombre
      ORDER BY total DESC;
    `;

    // === POR TIPO ===
    const porTipo = await sql.query`
      SELECT 
          TC.nombre AS tipo,
          COUNT(C.id_contenido) AS cantidad
      FROM Contenido C
      JOIN TiposConocimiento TC ON TC.id_tipo = C.id_tipo
      GROUP BY TC.nombre
      ORDER BY cantidad DESC;
    `;

    // === ARMAR RESPUESTA FINAL ===
    const resumen = {
      usuarios: {
        totales: usuariosTotales.recordset[0]?.total_usuarios ?? 0,
        activos: usuariosActivos.recordset[0]?.usuarios_activos ?? 0,
        topActivos: topUsuarios.recordset ?? [],
      },
      contenido: {
        totales: contenidoTotal.recordset[0]?.total_contenidos ?? 0,
        porMes: contenidoPorMes.recordset ?? [],
        topConsultados: topContenidos.recordset ?? [],
      },
      entrenamientos: {
        totales: entrenamientosTotales.recordset[0]?.total_entrenamientos ?? 0,
        tasaFinalizacion: parseFloat(
          tasaFinalizacion.recordset[0]?.porcentaje_finalizados?.toFixed(2) ?? 0
        ),
        porMes: entrenamientosPorMes.recordset ?? [],
      },
      tags: {
        topConsultados: topTags.recordset ?? [],
      },
      topAutores: topAutores.recordset ?? [],
      porTipo: porTipo.recordset ?? [],
      totalContenidos: contenidoTotal.recordset[0]?.total_contenidos ?? 0,
    };

    res.status(200).json(resumen);
  } catch (error) {
    console.error("❌ Error en getDashboardResumen:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
