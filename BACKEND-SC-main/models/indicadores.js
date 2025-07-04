import { sql } from '../connection.js'

export class IndicadoresModel {
    static async stock() {
        const result = await sql.query(`
        SELECT 
            s.cod_articulo,
            s.descripcion AS descripcion_articulo,
            s.cod_deposito,
            s.descripcion_deposito,
            s.saldo_control_stock,
            s.fecha_vencimiento,

            b.laboratorio,
            b.nombre_comercial,
            b.droga_presentacion,
            b.ANMAT,
            b.cod_tarot,
            b.nombre_tarot

        FROM Stock_deposito s

        LEFT JOIN ProdsTarot p
            ON s.cod_articulo = p.codTango

        LEFT JOIN BaseKTC b
            ON p.codTarot = b.cod_tarot

        ORDER BY s.cod_articulo, s.cod_deposito

        `)

        return result.recordset
    }

    static async cantidadLicitacionXProvincia(fechaDesde, fechaHasta) {
        const request = new sql.Request()
        request.input("fechaDesde", sql.VarChar, fechaDesde)
        request.input("fechaHasta", sql.VarChar, fechaHasta)

        const result = await request.query(`
            SELECT
            cp.NOMBRE_PRO AS Provincia,
            COUNT(*) AS Cantidad_Licitaciones
            FROM dbo.Licitaciones AS l
            INNER JOIN dbo.Cliente_Provincia AS cp ON l.codCliente = cp.COD_CLIENT
            WHERE l.fecha BETWEEN @fechaDesde AND @fechaHasta
            GROUP BY cp.NOMBRE_PRO
            ORDER BY Cantidad_Licitaciones DESC;
        `)

        return result.recordset
    }


    static async cantidadLicitacionXRegion(fechaDesde, fechaHasta) {
        const request = new sql.Request()
        request.input("fechaDesde", sql.VarChar, fechaDesde)
        request.input("fechaHasta", sql.VarChar, fechaHasta)

        const result = await request.query(`
    SELECT
      cp.REGION AS Region,
      COUNT(*) AS Cantidad_Licitaciones
    FROM dbo.Licitaciones AS l
    INNER JOIN dbo.Cliente_Provincia AS cp
      ON l.codCliente = cp.COD_CLIENT
    WHERE l.fecha BETWEEN @fechaDesde AND @fechaHasta
    GROUP BY cp.REGION
    ORDER BY Cantidad_Licitaciones DESC;
  `)

        return result.recordset
    }

    // static async cantidadLicitacionXEstado() {
    //     const result = await sql.query(`
    //         SELECT
    //         l.estado           AS Estado,
    //         COUNT(*)           AS Cantidad_Licitaciones
    //         FROM dbo.Licitaciones AS l
    //         GROUP BY
    //         l.estado
    //         ORDER BY
    //             Cantidad_Licitaciones DESC;  
    //     `)

    //     return result.recordset
    // }

    static async cantidadLicitacionXUsuario(fechaDesde, fechaHasta) {
        const request = new sql.Request()
        request.input("fechaDesde", sql.VarChar, fechaDesde)
        request.input("fechaHasta", sql.VarChar, fechaHasta)

        const result = await request.query(`
    SELECT TOP 10
        u.nombre,
        u.userName AS usuario,
        u.rol,
        COUNT(ul.idLicitacion) AS cantidad
    FROM dbo.Usuarios AS u
    LEFT JOIN dbo.Usuario_Licitacion AS ul ON ul.idUsuario = u.id
    LEFT JOIN dbo.Licitaciones AS l ON l.id = ul.idLicitacion
    WHERE l.fecha BETWEEN @fechaDesde AND @fechaHasta
    GROUP BY u.nombre, u.userName, u.rol
    ORDER BY cantidad DESC;
  `)

        return result.recordset
    }

    static async getParticipacionMes({ fiPrev, ffPrev, fiAct, ffAct }) {
        const request = new sql.Request()
            .input('fiPrev', sql.Date, fiPrev)
            .input('ffPrev', sql.Date, ffPrev)
            .input('fiAct', sql.Date, fiAct)
            .input('ffAct', sql.Date, ffAct)

        try {
            const result = await request.query(`
                -- Mes anterior
      SELECT 'anterior' AS Periodo,
             COUNT(*)   AS Cantidad
             FROM   dbo.Licitaciones
      WHERE  fecha >= @fiPrev
        AND  fecha <  @ffPrev

      UNION ALL
      
      -- Mes actual
      SELECT 'actual'   AS Periodo,
      COUNT(*)   AS Cantidad
      FROM   dbo.Licitaciones
      WHERE  fecha >= @fiAct
      AND  fecha <  @ffAct;
      `)
            return result.recordset
        } catch {
            throw new Error('Error al obtener participación de licitaciones')
        }
    }

    static async getCantidadLicitacionXProvinciaHistorial({ fiHist, ffHist }) {
        const request = new sql.Request()
            .input('fiHist', sql.Date, fiHist)
            .input('ffHist', sql.Date, ffHist)

        try {
            const result = await request.query(`
            SELECT
            cp.REGION AS Region,
            cp.NOMBRE_PRO AS Provincia,
            FORMAT(l.fecha, 'yyyy-MM') AS AnioMes,
            COUNT(*) AS Cantidad
            FROM dbo.Licitaciones AS l
            JOIN dbo.Cliente_Provincia AS cp ON l.codCliente = cp.COD_CLIENT
            GROUP BY
            cp.REGION,
            cp.NOMBRE_PRO,
            FORMAT(l.fecha, 'yyyy-MM')
            ORDER BY AnioMes, Provincia
      `)
            return result.recordset          // [{Provincia, AnioMes, Cantidad}, …]
        } catch {
            throw new Error('Error al obtener licitaciones por provincia (histórico)')
        }
    }

    static async obtenerResumenLaboratorios(fechaDesde, fechaHasta) {
        const request = new sql.Request()
        request.input("fechaDesde", sql.VarChar, fechaDesde)
        request.input("fechaHasta", sql.VarChar, fechaHasta)

        const result = await request.query(`
            SELECT TOP 20
                ktc.laboratorio,
                COUNT(DISTINCT reng.codigoTarot) AS cantidad_productos_distintos,
                SUM(TRY_CAST(reng.cantidad AS INT)) AS total_cantidad
            FROM Renglones reng
            LEFT JOIN BaseKTC ktc ON ktc.cod_tarot = reng.codigoTarot
            LEFT JOIN Licitaciones lic ON lic.id = reng.idLicitacion
            WHERE ktc.laboratorio IS NOT NULL
            AND lic.fecha BETWEEN @fechaDesde AND @fechaHasta
            GROUP BY ktc.laboratorio
            ORDER BY total_cantidad DESC
        `)

        return result.recordset
    }

    static async obtenerResumenProductos(fechaDesde, fechaHasta) {
        const request = new sql.Request()
        request.input("fechaDesde", sql.VarChar, fechaDesde)
        request.input("fechaHasta", sql.VarChar, fechaHasta)
        const result = await request.query(`
            SELECT TOP 20
            r.codigoTarot,
            MAX(k.nombre_tarot) AS nombre_tarot,
            MAX(k.laboratorio) AS laboratorio,
            SUM(TRY_CAST(r.cantidad AS INT)) AS total_cantidad,
            AVG(TRY_CAST(r.costo_elegido AS FLOAT)) AS costo_promedio,
            AVG(TRY_CAST(r.precio_vta AS FLOAT)) AS precio_vta_promedio
            FROM Renglones r
            LEFT JOIN Licitaciones l ON l.id = r.idLicitacion
            LEFT JOIN BaseKTC k ON k.cod_tarot = r.codigoTarot
            WHERE l.fecha BETWEEN @fechaDesde AND @fechaHasta
            GROUP BY r.codigoTarot
            ORDER BY total_cantidad DESC
        `)

        return result.recordset
    }
    static async obtenerProductosDispersion(fechaDesde, fechaHasta, codigoTarot) {
        const request = new sql.Request()
        request.input("fechaDesde", sql.VarChar, fechaDesde)
        request.input("fechaHasta", sql.VarChar, fechaHasta)
        request.input("codigoTarot", sql.VarChar, codigoTarot)
        const result = await request.query(`
SELECT
  l.fecha,
  TRY_CAST(r.costo_elegido AS FLOAT) AS costo,
  TRY_CAST(r.precio_vta AS FLOAT) AS precio,
  TRY_CAST(r.cantidad AS INT) AS cantidad
FROM dbo.Renglones r
INNER JOIN dbo.Licitaciones l ON l.id = r.idLicitacion
WHERE r.codigoTarot = @codigoTarot
  AND l.fecha BETWEEN @fechaDesde AND @fechaHasta
  AND r.costo_elegido IS NOT NULL
  AND r.precio_vta IS NOT NULL
ORDER BY l.fecha

        `)

        return result.recordset
    }

    /* static async obtenerDeudaClienteFecha() {
        const result = await sql.query(`
               WITH DeudaPorCliente AS (
  SELECT 
    cli.NOMBRE_PRO AS PROVINCIA,
    cta.COD_CLIENT,
    cli.RAZON_SOCI,
    SUM(cta.IMPORTE - ISNULL(saldos.SALDADO, 0)) AS DEUDA_CLIENTE,
    CAST(
      SUM(cta.IMPORTE - ISNULL(saldos.SALDADO, 0)) * 100.0 /
      NULLIF(SUM(SUM(cta.IMPORTE - ISNULL(saldos.SALDADO, 0))) OVER (), 0)
      AS DECIMAL(5,2)
    ) AS PORCENTAJE_DEUDA_TOTAL,
    COUNT(*) AS CANTIDAD_FACTURAS,
    CAST(
      AVG(cta.IMPORTE - ISNULL(saldos.SALDADO, 0)) AS DECIMAL(10, 2)
    ) AS PROMEDIO_POR_FACTURA
  FROM Estado_CtaCte AS cta
  OUTER APPLY (
    SELECT SUM(IMPORTE) AS SALDADO
    FROM Estado_CtaCte AS pagos
    WHERE pagos.T_COMP != 'FAC'
      AND pagos.N_COMP_ORIGEN = cta.[NRO COMPROBANTE]
  ) AS saldos
  INNER JOIN Cliente_Provincia cli ON cli.COD_CLIENT = cta.COD_CLIENT
  WHERE cta.T_COMP = 'FAC'
  GROUP BY cta.COD_CLIENT, cli.RAZON_SOCI, cli.NOMBRE_PRO
)
SELECT TOP 20 *
FROM DeudaPorCliente
ORDER BY PORCENTAJE_DEUDA_TOTAL DESC;
            `)

        return result.recordset
    } */

    static async obtenerDeudaProvincia({ fechaDesde, fechaHasta }) {
        const request = new sql.Request();
        request.input('fechaDesde', sql.VarChar, fechaDesde);
        request.input('fechaHasta', sql.VarChar, fechaHasta);

        const result = await request.query(`
               SELECT 
  cli.NOMBRE_PRO AS PROVINCIA,
  COUNT(*) AS CANTIDAD_FACTURAS,
  SUM(cta.IMPORTE - ISNULL(saldos.SALDADO, 0)) AS DEUDA_PROVINCIA,
  CAST(
    SUM(cta.IMPORTE - ISNULL(saldos.SALDADO, 0)) * 100.0 /
    NULLIF(SUM(SUM(cta.IMPORTE - ISNULL(saldos.SALDADO, 0))) OVER (), 0)
    AS DECIMAL(5,2)
  ) AS PORCENTAJE_DEUDA_TOTAL
FROM Estado_CtaCte AS cta
OUTER APPLY (
  SELECT SUM(IMPORTE) AS SALDADO
  FROM Estado_CtaCte AS pagos
  WHERE pagos.T_COMP != 'FAC'
    AND pagos.N_COMP_ORIGEN = cta.[NRO COMPROBANTE]
) AS saldos
INNER JOIN Cliente_Provincia cli ON cli.COD_CLIENT = cta.COD_CLIENT
WHERE 
  cta.T_COMP = 'FAC' AND
  cta.FECHA BETWEEN @fechaDesde AND @fechaHasta
GROUP BY cli.NOMBRE_PRO
ORDER BY PORCENTAJE_DEUDA_TOTAL DESC;
            `)

        return result.recordset
    }

    static async obtenerDeudaCliente({ fechaDesde, fechaHasta }) {
        const request = new sql.Request();
        request.input('fechaDesde', sql.VarChar, fechaDesde);
        request.input('fechaHasta', sql.VarChar, fechaHasta);

        const result = await request.query(`
               WITH DeudaPorCliente AS (
  SELECT 
    cli.NOMBRE_PRO AS PROVINCIA,
    cta.COD_CLIENT,
    cli.RAZON_SOCI,
    SUM(cta.IMPORTE - ISNULL(saldos.SALDADO, 0)) AS DEUDA_CLIENTE,
    CAST(
      SUM(cta.IMPORTE - ISNULL(saldos.SALDADO, 0)) * 100.0 /
      NULLIF(SUM(SUM(cta.IMPORTE - ISNULL(saldos.SALDADO, 0))) OVER (), 0)
      AS DECIMAL(5,2)
    ) AS PORCENTAJE_DEUDA_TOTAL,
    COUNT(*) AS CANTIDAD_FACTURAS,
    CAST(
      AVG(cta.IMPORTE - ISNULL(saldos.SALDADO, 0)) AS DECIMAL(10, 2)
    ) AS PROMEDIO_POR_FACTURA
  FROM Estado_CtaCte AS cta
  OUTER APPLY (
    SELECT SUM(IMPORTE) AS SALDADO
    FROM Estado_CtaCte AS pagos
    WHERE pagos.T_COMP != 'FAC'
      AND pagos.N_COMP_ORIGEN = cta.[NRO COMPROBANTE]
  ) AS saldos
  INNER JOIN Cliente_Provincia cli ON cli.COD_CLIENT = cta.COD_CLIENT
  WHERE 
    cta.T_COMP = 'FAC'
    AND cta.FECHA BETWEEN @fechaDesde AND @fechaHasta
  GROUP BY cta.COD_CLIENT, cli.RAZON_SOCI, cli.NOMBRE_PRO
)
SELECT TOP 10 *
FROM DeudaPorCliente
ORDER BY PORCENTAJE_DEUDA_TOTAL DESC;
            `)

        return result.recordset
    }

}