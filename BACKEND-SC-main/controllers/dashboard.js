import { sql } from "../connection.js";

/*
  ========================================
  DASHBOARD PROFESIONAL - CON FILTRO FECHA
  ========================================
*/

export const getDashboardResumen = async (req, res) => {
  try {
    // ======================
    // 1) PARÁMETROS DE FECHA
    // ======================
    let { desde, hasta } = req.query;

    const rangoDesde = desde ? new Date(desde) : null;
    const rangoHasta = hasta ? new Date(hasta) : null;

    /*
      ======================
      USUARIOS
      ======================
    */

    // Total de usuarios habilitados (snapshot general)
    const usuariosTotales = await sql.query`
      SELECT COUNT(*) AS total
      FROM Usuarios
      WHERE estado = 1;
    `;

    // Usuarios activos EN EL RANGO (consultas o entrenamientos)
    const usuariosActivos = await sql.query`
      SELECT COUNT(DISTINCT id_usuario) AS activos
      FROM (
        SELECT id_usuario, fecha_consulta
        FROM HistorialConsultas 
        WHERE estado = 1
          AND (${rangoDesde} IS NULL OR fecha_consulta >= ${rangoDesde})
          AND (${rangoHasta} IS NULL OR fecha_consulta < DATEADD(DAY, 1, ${rangoHasta}))
        
        UNION
        
        SELECT id_usuario, fecha_consulta
        FROM HistorialConsultasHTML 
        WHERE estado = 1
          AND (${rangoDesde} IS NULL OR fecha_consulta >= ${rangoDesde})
          AND (${rangoHasta} IS NULL OR fecha_consulta < DATEADD(DAY, 1, ${rangoHasta}))
        
        UNION
        
        SELECT id_usuario, fecha_finalizacion AS fecha_consulta
        FROM ParticipacionEntrenamiento 
        WHERE fecha_finalizacion IS NOT NULL
          AND (${rangoDesde} IS NULL OR fecha_finalizacion >= ${rangoDesde})
          AND (${rangoHasta} IS NULL OR fecha_finalizacion < DATEADD(DAY, 1, ${rangoHasta}))
      ) X;
    `;

    // Usuarios inactivos (en general, sin rango)
    const usuariosInactivos = await sql.query`
      SELECT COUNT(*) AS inactivos
      FROM Usuarios
      WHERE estado = 1
      AND id_usuario NOT IN (
        SELECT id_usuario FROM HistorialConsultas WHERE estado = 1
        UNION
        SELECT id_usuario FROM HistorialConsultasHTML WHERE estado = 1
        UNION
        SELECT id_usuario FROM ParticipacionEntrenamiento WHERE id_estado IS NOT NULL
      );
    `;

    // Top usuarios activos en el rango
    const topUsuarios = await sql.query`
      SELECT TOP 5
          U.nombre,
          COUNT(*) AS actividad
      FROM Usuarios U
      LEFT JOIN (
          SELECT id_usuario, fecha_consulta
          FROM HistorialConsultas 
          WHERE estado = 1
            AND (${rangoDesde} IS NULL OR fecha_consulta >= ${rangoDesde})
            AND (${rangoHasta} IS NULL OR fecha_consulta < DATEADD(DAY, 1, ${rangoHasta}))
          
          UNION ALL
          
          SELECT id_usuario, fecha_consulta
          FROM HistorialConsultasHTML 
          WHERE estado = 1
            AND (${rangoDesde} IS NULL OR fecha_consulta >= ${rangoDesde})
            AND (${rangoHasta} IS NULL OR fecha_consulta < DATEADD(DAY, 1, ${rangoHasta}))
          
          UNION ALL
          
          SELECT id_usuario, fecha_finalizacion AS fecha_consulta
          FROM ParticipacionEntrenamiento 
          WHERE fecha_finalizacion IS NOT NULL
            AND (${rangoDesde} IS NULL OR fecha_finalizacion >= ${rangoDesde})
            AND (${rangoHasta} IS NULL OR fecha_finalizacion < DATEADD(DAY, 1, ${rangoHasta}))
      ) A ON A.id_usuario = U.id_usuario
      WHERE U.estado = 1
      GROUP BY U.nombre
      ORDER BY actividad DESC;
    `;

    /*
      ======================
      CONTENIDO
      ======================
    */

    // Contenidos habilitados (global)
    const contenidoTotal = await sql.query`
      SELECT COUNT(*) AS total
      FROM Contenido
      WHERE estado = 1;
    `;

    // Contenidos creados por mes (filtrados por rango)
    const contenidoPorMes = await sql.query`
      SELECT 
          FORMAT(fecha_creacion, 'yyyy-MM') AS mes,
          COUNT(*) AS total
      FROM Contenido
      WHERE estado = 1
        AND fecha_creacion IS NOT NULL
        AND (${rangoDesde} IS NULL OR fecha_creacion >= ${rangoDesde})
        AND (${rangoHasta} IS NULL OR fecha_creacion < DATEADD(DAY, 1, ${rangoHasta}))
      GROUP BY FORMAT(fecha_creacion, 'yyyy-MM')
      ORDER BY mes;
    `;

    // Top contenidos consultados en el rango
    const topContenidos = await sql.query`
      SELECT TOP 5
          COALESCE(C.titulo, CH.titulo) AS titulo,
          COUNT(*) AS consultas
      FROM (
          SELECT id_contenido, fecha_consulta
          FROM HistorialConsultas 
          WHERE estado = 1
            AND (${rangoDesde} IS NULL OR fecha_consulta >= ${rangoDesde})
            AND (${rangoHasta} IS NULL OR fecha_consulta < DATEADD(DAY, 1, ${rangoHasta}))
          
          UNION ALL
          
          SELECT id_contenido, fecha_consulta
          FROM HistorialConsultasHTML 
          WHERE estado = 1
            AND (${rangoDesde} IS NULL OR fecha_consulta >= ${rangoDesde})
            AND (${rangoHasta} IS NULL OR fecha_consulta < DATEADD(DAY, 1, ${rangoHasta}))
      ) H
      LEFT JOIN Contenido C ON C.id_contenido = H.id_contenido AND C.estado = 1
      LEFT JOIN ContenidoHTML CH ON CH.id_contenido = H.id_contenido AND CH.estado = 1
      GROUP BY COALESCE(C.titulo, CH.titulo)
      ORDER BY consultas DESC;
    `;

    // Total de consultas en el rango (para KPI extra)
    const totalConsultas = await sql.query`
      SELECT COUNT(*) AS totalConsultas
      FROM (
        SELECT id_historial
        FROM HistorialConsultas 
        WHERE estado = 1
          AND (${rangoDesde} IS NULL OR fecha_consulta >= ${rangoDesde})
          AND (${rangoHasta} IS NULL OR fecha_consulta < DATEADD(DAY, 1, ${rangoHasta}))
        
        UNION ALL
        
        SELECT id_historial
        FROM HistorialConsultasHTML 
        WHERE estado = 1
          AND (${rangoDesde} IS NULL OR fecha_consulta >= ${rangoDesde})
          AND (${rangoHasta} IS NULL OR fecha_consulta < DATEADD(DAY, 1, ${rangoHasta}))
      ) Q;
    `;

    /*
      ======================
      TAGS (solo contenidos habilitados)
      ======================
    */

    const topTags = await sql.query`
      SELECT TOP 5
          ISNULL(T.nombre, 'Sin tag') AS nombre,
          COUNT(*) AS total
      FROM Contenido_Tags CT
      LEFT JOIN Tags T ON T.id_tag = CT.id_tag AND T.estado = 1
      LEFT JOIN Contenido C ON C.id_contenido = CT.id_contenido AND C.estado = 1
      GROUP BY T.nombre
      ORDER BY total DESC;
    `;

    /*
      ======================
      ENTRENAMIENTOS
      ======================
    */

    // Entrenamientos habilitados (global)
    const entrenamientosTotales = await sql.query`
      SELECT COUNT(*) AS total
      FROM Entrenamientos
      WHERE estado = 1;
    `;

    // Tasa de finalización EN EL RANGO
    const tasaFinalizacion = await sql.query`
      SELECT 
        CAST(SUM(CASE WHEN id_estado = 2 THEN 1 ELSE 0 END) AS float)
        / NULLIF(COUNT(*), 0) * 100 AS porcentaje
      FROM ParticipacionEntrenamiento
      WHERE fecha_finalizacion IS NOT NULL
        AND (${rangoDesde} IS NULL OR fecha_finalizacion >= ${rangoDesde})
        AND (${rangoHasta} IS NULL OR fecha_finalizacion < DATEADD(DAY, 1, ${rangoHasta}));
    `;

    // Finalizaciones por mes (en el rango)
    const entrenamientosPorMes = await sql.query`
      SELECT 
          FORMAT(fecha_finalizacion, 'yyyy-MM') AS mes,
          COUNT(*) AS total
      FROM ParticipacionEntrenamiento
      WHERE fecha_finalizacion IS NOT NULL
        AND (${rangoDesde} IS NULL OR fecha_finalizacion >= ${rangoDesde})
        AND (${rangoHasta} IS NULL OR fecha_finalizacion < DATEADD(DAY, 1, ${rangoHasta}))
      GROUP BY FORMAT(fecha_finalizacion, 'yyyy-MM')
      ORDER BY mes;
    `;

    /*
      ======================
      AUTORES
      ======================
    */

    const topAutores = await sql.query`
      SELECT TOP 5
          U.nombre AS autor,
          COUNT(*) AS total
      FROM Contenido C
      JOIN Usuarios U ON U.id_usuario = C.id_usuario
      WHERE C.estado = 1
        AND C.fecha_creacion IS NOT NULL
        AND (${rangoDesde} IS NULL OR C.fecha_creacion >= ${rangoDesde})
        AND (${rangoHasta} IS NULL OR C.fecha_creacion < DATEADD(DAY, 1, ${rangoHasta}))
      GROUP BY U.nombre
      ORDER BY total DESC;
    `;

    /*
      ======================
      DISTRIBUCIÓN POR TIPO
      ======================
    */

    const porTipo = await sql.query`
      SELECT 
          TC.nombre AS tipo,
          COUNT(*) AS cantidad
      FROM (
          SELECT id_tipo, fecha_creacion, estado 
          FROM Contenido
          UNION ALL
          SELECT id_tipo, fecha_creacion, estado
          FROM ContenidoHTML
      ) X
      JOIN TiposConocimiento TC ON TC.id_tipo = X.id_tipo
      WHERE X.estado = 1
        AND X.fecha_creacion IS NOT NULL
        AND (${rangoDesde} IS NULL OR X.fecha_creacion >= ${rangoDesde})
        AND (${rangoHasta} IS NULL OR X.fecha_creacion < DATEADD(DAY, 1, ${rangoHasta}))
      GROUP BY TC.nombre
      ORDER BY cantidad DESC;
    `;

    /*
      ======================
      RESPUESTA FINAL
      ======================
    */

    const resumen = {
      usuarios: {
        totales: usuariosTotales.recordset[0]?.total ?? 0,
        activos: usuariosActivos.recordset[0]?.activos ?? 0,
        inactivos: usuariosInactivos.recordset[0]?.inactivos ?? 0,
        topActivos: topUsuarios.recordset ?? [],
      },
      contenido: {
        totales: contenidoTotal.recordset[0]?.total ?? 0,
        porMes: contenidoPorMes.recordset ?? [],
        topConsultados: topContenidos.recordset ?? [],
      },
      entrenamientos: {
        totales: entrenamientosTotales.recordset[0]?.total ?? 0,
        tasaFinalizacion: parseFloat(
          tasaFinalizacion.recordset[0]?.porcentaje?.toFixed(2) ?? 0
        ),
        porMes: entrenamientosPorMes.recordset ?? [],
      },
      tags: {
        topConsultados: topTags.recordset ?? [],
      },
      actividad: {
        consultasTotales: totalConsultas.recordset[0]?.totalConsultas ?? 0,
      },
      topAutores: topAutores.recordset ?? [],
      porTipo: porTipo.recordset ?? [],
      totalContenidos: contenidoTotal.recordset[0]?.total ?? 0,
    };

    return res.status(200).json(resumen);

  } catch (error) {
    console.error("❌ Error en getDashboardResumen:", error);
    res.status(500).json({
      error: "Error interno del servidor en dashboard",
    });
  }
};
