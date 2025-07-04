from reportlab.platypus import Paragraph, KeepInFrame
from reportlab.lib.styles import ParagraphStyle
from io import BytesIO
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Table, TableStyle,
    Paragraph, Spacer, PageBreak
)
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.lib import colors

def generar_parte_entregas_pdf(json_data, entregas):
    pagina = landscape(A4)
    margen_x = 2 * cm
    margen_y = 2 * cm
    ancho_total = pagina[0] - 2 * margen_x

    styles = getSampleStyleSheet()
    style_obs = styles["Normal"]
    style_obs.fontSize = 9
    style_obs.leading = 11
    style_obs.alignment = 1

    def build_encabezado():
        data = [
            ["PARTE DE ENTREGAS", "Fecha Parte:", json_data["fecha_parte"], "Conductor:", json_data["conductor"], f"N° {json_data['numero_parte']}"],
            [json_data["sucursal"], "Fecha Entrega:", json_data["fecha_entrega"], "Vehículo:", json_data["vehiculo"], ""],
            ["", "", "", "Patente:", json_data["patente"], ""]
        ]
        col_widths = [ancho_total * p for p in [0.20, 0.12, 0.12, 0.12, 0.30, 0.14]]
        row_heights = [0.6 * cm] * 3
        tabla = Table(data, colWidths=col_widths, rowHeights=row_heights)
        tabla.setStyle(TableStyle([
            ("BOX", (0,0), (-1,-1), 0.8, colors.black),
            ("LINEBEFORE", (1,0), (1,-1), 0.5, colors.black),
            ("LINEBEFORE", (3,0), (3,-1), 0.5, colors.black),
            ("LINEBEFORE", (5,0), (5,-1), 0.5, colors.black),
            ("SPAN", (5,0), (5,2)),
            ("ALIGN", (5,0), (5,2), "CENTER"),
            ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
            ("FONTNAME", (0,0), (-1,-1), "Helvetica"),
            ("FONTSIZE", (0,0), (-1,-1), 9),
            ("FONTNAME", (5,0), (5,0), "Helvetica-Bold"),
            ("FONTSIZE", (5,0), (5,0), 11),
        ]))
        return tabla



    def build_tabla_entregas(bloque):
        style_celda = ParagraphStyle(name="celda", fontSize=9, leading=11)
        data = [
            ["Ord.", "ENTREGADO AL CONDUCTOR PARA SU REPARTO", "", "OBSERVACIONES DE ENTREGA", "", "", ""],
            ["", "Nombre Cliente", "Remito No", "Entregado", "No Entregado", "Con Devolución", "Obs."]
        ]

        for e in bloque:
            cliente_paragraph = Paragraph(e["cliente"], style_celda)
            cliente_cell = KeepInFrame(maxWidth=ancho_total * 0.38, maxHeight=0.6*cm, content=[cliente_paragraph], mode="truncate")
            remito_paragraph = Paragraph(e["remito"], style_celda)
            remito_cell = KeepInFrame(maxWidth=ancho_total * 0.14, maxHeight=0.6*cm, content=[remito_paragraph], mode="shrink")
            data.append([e["orden"], cliente_cell, remito_cell, "", "", "", ""])

        col_props = [0.04, 0.38, 0.14, 0.09, 0.09, 0.12, 0.14]
        col_widths = [ancho_total * p for p in col_props]
        row_heights = [0.6 * cm] * len(data)

        tabla = Table(data, colWidths=col_widths, rowHeights=row_heights)
        tabla.setStyle(TableStyle([
            ("GRID", (0,0), (-1,-1), 0.5, colors.black),
            ("SPAN", (0,0), (0,1)),
            ("SPAN", (1,0), (2,0)),
            ("SPAN", (3,0), (6,0)),
            ("ALIGN", (0,0), (-1,1), "CENTER"),
            ("FONTNAME", (0,0), (-1,1), "Helvetica-Bold"),
            ("FONTSIZE", (0,0), (-1,1), 9),
            ("FONTNAME", (0,2), (-1,-1), "Helvetica"),
            ("FONTSIZE", (0,2), (-1,-1), 9),
            ("BACKGROUND", (2, 2), (2, -1), colors.white),
        ]))
        return tabla


    def build_pie():
        obs_paragraph = Paragraph(json_data["observaciones"], style_obs)
        obs_width = ancho_total * 0.30
        firmas_width = ancho_total - obs_width

        tabla_firmas_data = [
            ["CONTROL SALIDA", "", "CONTROL RETORNO", ""],
            ["", "", "", ""],
            ["Firma Conductor", "Firma Enc. Despacho", "Firma Conductor", "Firma Enc. Despacho"]
        ]
        tabla_firmas = Table(
            tabla_firmas_data,
            colWidths=[firmas_width * 0.25] * 4,
            rowHeights=[0.8 * cm, 1.3 * cm, 0.6 * cm]
        )
        tabla_firmas.setStyle(TableStyle([
            ("GRID", (0,0), (-1,-1), 0.5, colors.black),
            ("SPAN", (0,0), (1,0)),
            ("SPAN", (2,0), (3,0)),
            ("ALIGN", (0,0), (-1,-1), "CENTER"),
            ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
            ("FONTNAME", (0,0), (-1,-1), "Helvetica"),
            ("FONTSIZE", (0,0), (-1,-1), 8),
            ("FONTNAME", (0,0), (3,0), "Helvetica-Bold"),
            ("FONTNAME", (0,2), (3,2), "Helvetica-Bold"),
        ]))

        tabla_contenedora = Table(
            [[obs_paragraph, tabla_firmas]],
            colWidths=[obs_width, firmas_width],
            rowHeights=[sum(tabla_firmas._rowHeights)]
        )
        tabla_contenedora.setStyle(TableStyle([
            ("BOX", (0,0), (0,0), 0.5, colors.black),
            ("VALIGN", (0,0), (0,0), "MIDDLE"),
        ]))
        return tabla_contenedora

    def draw_header(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica-Bold", 16)
        canvas.drawString(margen_x, pagina[1] - margen_y + 1 * cm, "MACROPHARMA S.A.")
        encabezado = build_encabezado()
        w, h = encabezado.wrap(doc.width, doc.topMargin)
        encabezado.drawOn(canvas, margen_x, pagina[1] - h - margen_y + 0.5 * cm)
        canvas.setFont("Helvetica-Bold", 10)
        canvas.drawRightString(pagina[0] - margen_x, pagina[1] - h - 2 * cm - 0.3 * cm, json_data["sucursal"])
        canvas.restoreState()

    def draw_footer(canvas, doc):
        canvas.saveState()
        pie = build_pie()
        pie.wrapOn(canvas, doc.width, doc.bottomMargin)
        pie.drawOn(canvas, margen_x, margen_y)
        canvas.restoreState()

    # === GENERAR PDF EN MEMORIA ===
    buffer = BytesIO()
    doc = BaseDocTemplate(buffer, pagesize=pagina,
        rightMargin=margen_x, leftMargin=margen_x,
        topMargin=3.5*cm, bottomMargin=4.2*cm
    )
    frame_cuerpo = Frame(margen_x, margen_y + 3 * cm, ancho_total, pagina[1] - 9 * cm, id='cuerpo')
    template = PageTemplate(id='plantilla', frames=[frame_cuerpo],
                            onPage=draw_header, onPageEnd=draw_footer)
    doc.addPageTemplates([template])

    elementos = []
    bloques = [entregas[i:i+15] for i in range(0, len(entregas), 15)]
    for bloque in bloques:
        elementos.append(build_tabla_entregas(bloque))
        if bloque != bloques[-1]:
            elementos.append(PageBreak())

    doc.build(elementos)
    buffer.seek(0)
    return buffer
