import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    Table,
    TableStyle,
    Paragraph,
    Image,
    Spacer,
    BaseDocTemplate,
    PageTemplate,
    Frame,
)
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import Color
from io import BytesIO
import os
from reportlab.platypus import Image


def generar_tablas_datos_cliente(data_cliente):
    
    table_data = []

    # Fila CLIENTE (siempre presente)
    table_data.append(["CLIENTE:", data_cliente['cliente'], "", ""])
    # Fila OBJETO (solo si no está vacío)
    if data_cliente['objeto'].strip():
        table_data.append(["OBJETO:", data_cliente['objeto'], "", ""])
    # Fila FECHA-HORA
    table_data.append(["FECHA:", data_cliente['fecha'], "HORA:", data_cliente['hora']])
    # Fila TIPO-N° C/L
    table_data.append(["TIPO:", data_cliente['tipo'], "N° C/L:", data_cliente['nroLic']])

    # Definimos anchos de columna (puedes ajustarlos)
    col_widths = [0.8 * inch, 1.3 * inch, 0.8 * inch, 1.3 * inch]

    # Creamos la tabla con 4 columnas
    col_widths = [.8 * inch, 1.3 * inch, .8 * inch, 1.3 * inch]
    tabla = Table(table_data, colWidths=col_widths)

    # Color azul para los labels
    custom_color = Color(17/255.0, 126/255.0, 191/255.0)

    # Definimos estilos base
    style_cmds = [
        # Grid en toda la tabla
        ('GRID', (0,0), (-1,-1), 1, colors.black),
        # Alineación vertical/horizontal
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        # Opcional: tamaño de fuente
        ('FONTSIZE', (0,0), (-1,-1), 7),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (3, 0), (3, -1), "Helvetica-Bold"),

    ]

    # Recorrer cada fila para aplicar estilos de forma dinámica
    for i, row in enumerate(table_data):
        # Si la fila es "simple" (label/dato) => col2 y col3 están vacíos
        if row[2] == "" and row[3] == "":
            # Combinar columnas 1, 2 y 3 para el dato
            style_cmds.append(('SPAN', (1,i), (3,i)))
            # Fondo azul y texto blanco en la celda del label (col0)
            style_cmds.append(('BACKGROUND', (0,i), (0,i), custom_color))
            style_cmds.append(('TEXTCOLOR', (0,i), (0,i), colors.white))
        else:
            # Fila "doble" (ej. FECHA/HORA o TIPO/N° C/L)
            # Los labels están en col0 y col2
            style_cmds.append(('BACKGROUND', (0,i), (0,i), custom_color))
            style_cmds.append(('TEXTCOLOR', (0,i), (0,i), colors.white))
            style_cmds.append(('BACKGROUND', (2,i), (2,i), custom_color))
            style_cmds.append(('TEXTCOLOR', (2,i), (2,i), colors.white))

        # Aplicar estilos a la tabla
    tabla.setStyle(TableStyle(style_cmds))
    return tabla


def generar_tabla_demanda(data_renglones, total_precio_total):
    # Definir estilos para Paragraph
    styles = getSampleStyleSheet()

    df = pd.DataFrame(data_renglones)
    df = df.fillna("-")
    # Obtener el índice de la última fila
    ultima_fila_index = len(df)
    # Crear listas con el signo de pesos, una por cada fila
    col_signo_pesos = ["$"] * (len(df))

    # Insertar las nuevas columnas en las posiciones deseadas
    df.insert(5, "Col_signo", col_signo_pesos)
    df.insert(7, "Col_signo2", col_signo_pesos)

    # Crear un estilo de Paragraph para los encabezados
    header_style = ParagraphStyle(
        name="HeaderStyle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=8,
        alignment=1,
        textColor="white",
        # textColor="black",
        leading=10,
    )

    data_style = ParagraphStyle(
        name="BodyStyle",
        parent=styles["BodyText"],
        wordWrap="CJK",
        fontSize=7,
        leading=10,
        alignment=1,
    )

    data_style_descripcion = ParagraphStyle(
        name="BodyStyle",
        parent=styles["BodyText"],
        wordWrap="CJK",
        fontSize=7,
        leading=10,
        alignment=0,
    )

    data_style_precio_u = ParagraphStyle(
        name="BodyStyle",
        parent=styles["BodyText"],
        wordWrap="CJK",
        fontSize=7,
        leading=10,
        alignment=2,
    )

    data_style_precio_total = ParagraphStyle(
        name="BodyStyle",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        wordWrap="CJK",
        fontSize=7,
        leading=14,
        alignment=2,
    )

    data_style_TOTAL = ParagraphStyle(
        name="BodyStyle",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        wordWrap="CJK",
        fontSize=8,
        textColor="white",
        leading=14,
        alignment=2,
    )

    # Reordenar columnas
    orden_deseado = []
    col_widths = []
    # Agregar una fila vacía al final

    # Si existe 'descripcionTarot' pero no 'descripcion', se reemplaza
    if "descripcionTarot" in df.columns and "descripcion" not in df.columns:
        df["descripcion"] = df["descripcionTarot"]

    df.loc[len(df)] = {
        "renglon": "",
        "cantidad": "",
        "descripcion": "",
        "ANMAT": "",
        "laboratorio_elegido": "",
        "Col_signo": "",
        "precio_vta": " ",
        "Col_signo2": "$",
        "precio_vta_total": total_precio_total,
        "nombre_comercial": "",
        "observaciones": "",
    }

    # Definir los casos y columnas
    casos_columnas = [
        {
            "condicion": lambda df: "observaciones" in df.columns
            and "nombre_comercial" in df.columns,
            "orden": [
                "renglon",
                "cantidad",
                "descripcion",
                "nombre_comercial",
                "laboratorio_elegido",
                "ANMAT",
                "Col_signo",
                "precio_vta",
                "Col_signo2",
                "precio_vta_total",
                "observaciones",
            ],
            "anchos_base": [
                0.4,
                0.4,
                1.4,
                1.2,
                0.9,
                0.5,
                0.1,
                0.6,
                0.1,
                0.9,
                1.3,
            ],
            "caso": "CASO 1",
        },
        {
            "condicion": lambda df: "observaciones" in df.columns,
            "orden": [
                "renglon",
                "cantidad",
                "descripcion",
                "laboratorio_elegido",
                "ANMAT",
                "Col_signo",
                "precio_vta",
                "Col_signo2",
                "precio_vta_total",
                "observaciones",
            ],
            "anchos_base": [
                0.4,
                0.4,
                1.5,
                0.9,
                0.5,
                0.1,
                0.6,
                0.1,
                0.9,
                1.4,
            ],
            "caso": "CASO 2",
        },
        {
            "condicion": lambda df: "nombre_comercial" in df.columns,
            "orden": [
                "renglon",
                "cantidad",
                "descripcion",
                "nombre_comercial",
                "laboratorio_elegido",
                "ANMAT",
                "Col_signo",
                "precio_vta",
                "Col_signo2",
                "precio_vta_total",
            ],
            "anchos_base": [
                0.4,
                0.4,
                1.6,
                1.5,
                0.9,
                0.5,
                0.1,
                0.6,
                0.1,
                0.9,
            ],
            "caso": "CASO 3",
        },
        {
            "condicion": lambda df: True,
            "orden": [
                "renglon",
                "cantidad",
                "descripcion",
                "laboratorio_elegido",
                "ANMAT",
                "Col_signo",
                "precio_vta",
                "Col_signo2",
                "precio_vta_total",
            ],
            "anchos_base": [0.4, 0.4, 1.7, 0.9, 0.7, 0.1, 0.7, 0.1, 1.0],
            "caso": "CASO 4",
        },
    ]

    # Encontrar el caso correspondiente
    for caso in casos_columnas:
        if caso["condicion"](df):
            # print(caso["caso"])

            # Definir orden de columnas
            orden_deseado = caso["orden"]

            # Normalizar anchos para que sumen 8.0 * inch
            suma_actual = sum(caso["anchos_base"])
            factor = 8.0 / suma_actual
            col_widths = [
                round(ancho * factor, 2) * inch for ancho in caso["anchos_base"]
            ]
            break
            # return orden_deseado, col_widths

    # Si no entra en ningún caso (teóricamente imposible)
    # raise ValueError("No se encontró un caso correspondiente.")

    df = df[orden_deseado]

    df = df.rename(
        columns={
            "renglon": "N° RENG.",
            "cantidad": "CANT",
            "descripcion": "DESCRIPCIÓN",
            "laboratorio_elegido": "LABORATORIO",
            "nombre_comercial": "NOMBRE COMERCIAL",
            "observaciones": "OBSERVACIONES",
        }
    )

    indice_precio_vta = df.columns.get_loc("precio_vta")

    # Convertir el DataFrame en una lista para la tabla con Paragraphs
    header_paragraphs = [
        [Paragraph(str(cell), header_style) for cell in df.columns.tolist()]
    ]

    def formatear_miles(valor):
        try:
            valor_float = float(valor)
            # Primero formateamos en "estilo inglés": 15,200.00
            valor_en = f"{valor_float:,.2f}"
            # valor_en = "15,200.00"

            # Reemplazo las comas por un símbolo temporal, por ejemplo "X"
            paso1 = valor_en.replace(",", "X")
            # paso1 = "15X200.00"

            # Reemplazo el punto (.) por la coma (,)
            paso2 = paso1.replace(".", ",")
            # paso2 = "15X200,00"

            # Finalmente, reemplazo la "X" por punto (.)
            valor_final = paso2.replace("X", ".")
            # valor_final = "15.200,00"

            return valor_final
        except (ValueError, TypeError):
            if valor == "": return "-"
            return str(valor)

    df["precio_vta"] = df["precio_vta"].apply(formatear_miles)
    df["precio_vta_total"] = df["precio_vta_total"].apply(formatear_miles)


    # Aplicar estilos al DataFrame
    data_paragraphs = [
        [
            Paragraph(
                str(cell),
                (
                    data_style_TOTAL
                    if (
                        row_index
                        == ultima_fila_index
                        # and (i == 8 or i == 7)
                    )  # Última fila, columna 6
                    else (
                        data_style_descripcion
                        if i == 2
                        else (
                            data_style_precio_u
                            if i == indice_precio_vta
                            else (
                                data_style_precio_total
                                if i == (indice_precio_vta + 2)
                                else data_style
                            )
                        )
                    )
                ),
            )
            for i, cell in enumerate(row)
        ]
        for row_index, row in enumerate(df.values.tolist())
    ]

    data_for_table = header_paragraphs + data_paragraphs

    cantidad_columnas = len(df.columns)
    table = Table(data_for_table)

    # Establecer colspan para simular la fusión
    table._cellvalues[0][indice_precio_vta - 1] = Paragraph(
        "PRECIO VTA UNITARIO", header_style
    )  # Contenido para la fusión
    table._cellvalues[0][indice_precio_vta] = ""  # Dejar vacía
    table._cellvalues[0][indice_precio_vta + 1] = Paragraph(
        "PRECIO TOTAL", header_style
    )  # Contenido para la fusión
    table._cellvalues[0][indice_precio_vta + 2] = ""  # Dejar vacía

    table._argW = col_widths

    # Convertir los valores RGB a valores en el rango 0-1
    color_encabezado = Color(17 / 255.0, 126 / 255.0, 191 / 255.0)
    color_totales = Color(68 / 255.0, 114 / 255.0, 196 / 255.0)

    padding_celdas = 1.5
    estilos_de_tabla = [
        # Estilo para la fila en blanco (primera fila)
        # ("BACKGROUND", (0, 0), (-1, 0), colors.white),  # Fondo blanco (transparente)
        # ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),  # Texto blanco (invisible)
        # Configurar altura mínima para la primera fila (encabezado)
        # ("ROWHEIGHT", (0, 0), (-1, 0), 150),  # Altura mínima de la primera fila
        # HEADER
        ("BACKGROUND", (0, 0), (-1, 0), color_encabezado),
        # Un borde en la parte izquierda de todas las celdas
        ("SPAN", (indice_precio_vta - 1, 0), (indice_precio_vta, 0)),
        ("SPAN", (indice_precio_vta + 1, 0), (indice_precio_vta + 2, 0)),
        (
            "GRID",
            (0, 0),
            (-1, 0),
            1.5,
            colors.black,
        ),  # Rejilla negra para toda la tabla
        # CONTENT
        (
            "GRID",
            (0, 1),
            (indice_precio_vta - 2, -2),
            1,
            colors.black,
        ),  # Rejilla negra para toda la tabla
        (
            "LINEAFTER",
            (indice_precio_vta + 2, 1),
            (indice_precio_vta + 2, -1),
            1,
            colors.black,
        ),
        ("BOX", (cantidad_columnas, 0), (-1, -1), 1, colors.black),
        # TODOS
        ("BOX", (0, 0), (-1, -1), 1.5, colors.black),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), padding_celdas),  # Sin padding a la izquierda
        ("RIGHTPADDING", (0, 0), (-1, -1), padding_celdas),  # Sin padding a la derecha
        ("TOPPADDING", (0, 0), (-1, -1), 2),  # Sin padding en la parte superior
        (
            "BOTTOMPADDING",
            (0, 0),
            (-1, -1),
            padding_celdas,
        ),  # Sin padding en la parte inferior
        # FILA TOTAL
        ("BACKGROUND", (0, -1), (-1, -1), color_totales),
    ]

    for i in range(1, len(df) + 1):
        estilos_de_tabla.append(
            ("LINEABOVE", (indice_precio_vta - 1, i), (-1, i), 1, colors.black)
        )

    estilos_de_tabla.append(
        (
            "LINEBEFORE",
            (indice_precio_vta + 1, 0),
            (indice_precio_vta + 1, -1),
            1,
            colors.black,
        )
    )

    # Estilizar la tabla
    table_style = TableStyle(estilos_de_tabla)
    table.setStyle(table_style)
    table.repeatRows = 1  # Repetir la primera fila en cada página

    return table


def generar_tabla_entrega(data_entrega):
    tabla_data_entrega = [
        ["", data_entrega["text_monto"]],
        ["Entrega", data_entrega["entrega"]],
        ["Mantenimiento", data_entrega["mantenimiento"]],
        ["Pago", data_entrega["pago"]],
    ]

    # Crear las tablas
    tabla_datos_entrega = Table(tabla_data_entrega)

    # Ajustar el ancho de las columnas dinámicamente
    col_widths = [
        1.5 * inch,  # RENGLON CANTIDAD
        6.2 * inch,  # DESCRIPCION LABORATORIO ANMAT PRECIO VTA UNITARIO  PRECIO TOTAL
    ]

    tabla_datos_entrega._argW = col_widths

    padding_celdas = 1

    # Estilos para las tablas
    style = TableStyle(
        [
            # GRID
            ("GRID", (0, 0), (-1, -1), 1.5, colors.black),
            ("FONTSIZE", (0, 0), (-1, -1), 6),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
            ("LEADING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),  # Sin padding a la izquierda
            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                padding_celdas,
            ),  # Sin padding a la derecha
            ("TOPPADDING", (0, 0), (-1, -1), 2),  # Sin padding en la parte superior
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                padding_celdas,
            ),  # Sin padding en la parte inferior
        ]
    )

    tabla_datos_entrega.setStyle(style)

    return tabla_datos_entrega


def generar_lista_firmas_img(firmas_chequeadas):
    lista_imagenes = []
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ruta_firmas = os.path.join(BASE_DIR, "imagenes", "firmas")

    for firma in firmas_chequeadas:
        path_firma = os.path.join(ruta_firmas, f"{firma}.png")

        if not os.path.exists(path_firma):
            print(f"[ADVERTENCIA] No se encontró la firma: {path_firma}")
            continue  # O podrías poner una imagen por defecto

        img_firma = Image(path_firma)
        img_firma.drawHeight = 2 * inch
        img_firma.drawWidth = 2 * inch
        img_firma.hAlign = 0

        lista_imagenes.append(img_firma)

    subListaImg = []
    lista_tablas = []
    band = False
    for img in lista_imagenes:
        if len(subListaImg) < 2:
            subListaImg.append(img)
            band = True
        else:
            subListaImg.append(img)

            # Crear una tabla para las imágenes
            tabla_firmas = Table(
                [subListaImg], colWidths=[2.5 * inch] * len(subListaImg)
            )  # Ajusta el ancho según tus necesidades

            # Aplicar estilo a la tabla (opcional)
            tabla_firmas.setStyle(
                TableStyle(
                    [
                        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("BACKGROUND", (0, 0), (-1, -1), colors.transparent),
                    ]
                )
            )
            lista_tablas.append(tabla_firmas)
            subListaImg = []
            band = False

    if band and len(subListaImg) > 0:
        # Crear una tabla para las imágenes
        tabla_firmas = Table(
            [subListaImg], colWidths=[2.5 * inch] * len(subListaImg)
        )  # Ajusta el ancho según tus necesidades

        # Aplicar estilo a la tabla (opcional)
        tabla_firmas.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("BACKGROUND", (0, 0), (-1, -1), colors.transparent),
                ]
            )
        )
        lista_tablas.append(tabla_firmas)

    return lista_tablas


def generar_PDF(
    data_renglones, data_cliente, data_entrega, firmas_chequeadas, total_precio_total
):
    tabla_datos_cliente = generar_tablas_datos_cliente(data_cliente)

    space_between_tables = Spacer(1, 0.25 * inch)  # Ajusta la altura según necesites

    tabla_demanda = generar_tabla_demanda(data_renglones, total_precio_total)

    tabla_entrega = generar_tabla_entrega(data_entrega)

    # BASE_DIR apunta a /generador_pdf/scripts
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

    # Subir un nivel: ahora apunta a /generador_pdf
    BASE_DIR = os.path.dirname(CURRENT_DIR)

    # Ruta final correcta a la imagen
    IMG_FOOTER_PATH = os.path.join(BASE_DIR, "imagenes", "Pie.png")

    # Verificamos que exista
    if not os.path.exists(IMG_FOOTER_PATH):
        raise FileNotFoundError(f"No se encontró la imagen del pie: {IMG_FOOTER_PATH}")

    # Usar imagen
    img_footer = Image(IMG_FOOTER_PATH, width=..., height=...)
    # 1 / 3.268
    img_footer.drawHeight = 2 * inch
    img_footer.drawWidth = 6.5 * inch
    img_footer.hAlign = 0

    # Configuración de los márgenes del documento
    margins = {
        "left": 0.3 * inch,
        "right": 0.3 * inch,
        "top": 0.1 * inch,
        "bottom": 0.5 * inch,
    }

    # Crear un objeto BytesIO para guardar el PDF en memoria
    buffer = BytesIO()

    # Crear un documento PDF con márgenes personalizados en memoria
    doc = BaseDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=margins["left"],
        rightMargin=margins["right"],
        topMargin=margins["top"],
        bottomMargin=margins["bottom"],
    )

    ##################################################
    # # # ANDA BIEN
    ##################################################

    # Definir el frame (área de contenido)
    frame = Frame(
        margins["left"],
        margins["bottom"],
        doc.width,
        doc.height - 1.2 * inch,
        id="normal",
    )

    # Crear el PageTemplate con el encabezado personalizado
    template = PageTemplate(
        id="custom",
        frames=[frame],
        onPage=lambda canvas, doc: agregar_encabezadoYfooter(
            canvas, doc, tabla_datos_cliente
        ),
    )
    doc.addPageTemplates([template])

    elements = [
        tabla_demanda,
        space_between_tables,
        tabla_entrega,
        img_footer,
    ]

    if len(firmas_chequeadas) > 0:
        lista_firmas_img = generar_lista_firmas_img(firmas_chequeadas)
        elements.extend(lista_firmas_img)

    # Construir el PDF
    doc.build(elements)

    buffer.seek(0)

    return buffer


def agregar_encabezadoYfooter(canvas, doc, tabla_datos_cliente):
    canvas.saveState()

    # Imagen de encabezado
    # BASE_DIR apunta a /generador_pdf/scripts
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

    # Subir un nivel: ahora apunta a /generador_pdf
    BASE_DIR = os.path.dirname(CURRENT_DIR)

    # Ruta final correcta a la imagen
    IMG_HEADER = os.path.join(BASE_DIR, "imagenes", "Encabezado.png")

    # Verificamos que exista
    if not os.path.exists(IMG_HEADER):
        raise FileNotFoundError(f"No se encontró la imagen del pie: {IMG_HEADER}")

    # Usar imagen
    img_header = Image(IMG_HEADER, width=..., height=...)

    img_header.drawHeight = 1 * inch
    img_header.drawWidth = 3.38 * inch
    # 3.38 ---- 1

    img_header.drawOn(
        canvas, doc.leftMargin, doc.pagesize[1] - doc.topMargin - img_header.drawHeight
    )

    # Posición inicial para la tabla de datos
    y_position = (
        doc.pagesize[1] - doc.topMargin - img_header.drawHeight
    )  # Ajusta el espacio según el diseño

    # Dibujar tabla de datos del cliente
    if tabla_datos_cliente:
        tabla_datos_cliente.wrapOn(canvas, doc.width, doc.height)
        tabla_datos_cliente.drawOn(canvas, doc.leftMargin + 3.8 * inch, y_position)

    # Pie de página: "FOOTER" en el centro y número de página a la derecha
    footer_y_position = 0.5 * inch  # Altura del pie de página desde la parte inferior
    canvas.setFont("Helvetica", 8)

    # Texto "FOOTER" en el centro del pie de página
    canvas.drawString(
        doc.pagesize[0] / 2 - 15,  # Centro del documento
        footer_y_position,
        "OFERTA ENVIADA POR MACROPHARMA S.A.",
    )

    # Número de página en la esquina inferior derecha
    page_number_text = f"Página {doc.page}"
    canvas.drawRightString(
        doc.pagesize[0] - doc.rightMargin,  # Alineación a la derecha
        footer_y_position,
        page_number_text,
    )

    canvas.restoreState()
