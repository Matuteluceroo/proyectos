import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Image,
    Spacer,
)
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import Color
from io import BytesIO

import webbrowser
import tempfile


def generar_tablas_datos_cliente(data_cliente):
    # Preparar los datos para la tabla
    tabla_data = [
        [
            "",
            "CLIENTE: ",
            data_cliente["cliente"],
            "",
            "OBJETO: ",
            data_cliente["objeto"],
            "",
        ],
        ["", "FECHA: ", data_cliente["fecha"], "", "TIPO: ", data_cliente["tipo"], ""],
        [
            "",
            "HORA: ",
            data_cliente["hora"],
            "",
            "N° C/L: ",
            data_cliente["nroLic"],
            "",
        ],
    ]

    # Crear las tablas
    tabla_cliente = Table(tabla_data)

    # Ajustar el ancho de las columnas dinámicamente
    col_widths = [
        0.7 * inch,  # RENGLON
        0.8 * inch,  # CANTIDAD
        2.5 * inch,  # DESCRIPCION
        1.2 * inch,  # LABORATORIO
        0.8 * inch,  # ANMAT
        0.9 * inch,  # PRECIO VTA UNITARIO
        0.8 * inch,  # PRECIO TOTAL
    ]

    tabla_cliente._argW = col_widths

    # Convertir los valores RGB a valores en el rango 0-1
    custom_color = Color(17 / 255.0, 126 / 255.0, 191 / 255.0)

    padding_celdas = 1.5

    # Estilos para las tablas
    style = TableStyle(
        [
            # ENCABEZADOS
            ("BACKGROUND", (1, 0), (1, -1), custom_color),
            ("BACKGROUND", (4, 0), (4, -1), custom_color),
            ("TEXTCOLOR", (1, 0), (1, -1), colors.white),
            ("TEXTCOLOR", (4, 0), (4, -1), colors.white),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("ALIGN", (4, 0), (4, -1), "RIGHT"),
            ("FONTNAME", (1, 0), (1, -1), "Helvetica-Bold"),
            ("FONTNAME", (4, 0), (4, -1), "Helvetica-Bold"),
            # GRID
            ("GRID", (1, 0), (2, -1), 1.5, colors.black),
            ("GRID", (4, 0), (5, -1), 1.5, colors.black),
            # TODOs
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("FONTSIZE", (0, 0), (-1, -1), 7),
            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                padding_celdas,
            ),  # Sin padding a la izquierda
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

    tabla_cliente.setStyle(style)

    return tabla_cliente


def generar_tabla_demanda(columnas_pdf, data_renglones, total_precio_total):
    # Definir estilos para Paragraph
    styles = getSampleStyleSheet()
    # print("COLS:",columnas_pdf)
    #print("RENGLONES: ", data_renglones)

    df = pd.DataFrame(data_renglones)
    #print("DF ANTS: ", df.columns)

    # Mantener solo las columnas que están en la lista `columnas_pdf`
    columnas_a_mantener = [col for col in df.columns if col in columnas_pdf]
    df = df[columnas_a_mantener]
    
    print("INDEX_PU: ")
    
    print("CANTIDAD DE COLUMNAS: ",len(columnas_a_mantener))
    
    index_pu = 6
    cantidad_columnas = 7

    # Obtener el índice de la última fila
    ultima_fila_index = len(df)

    # del df["codigoTarot"]
    # del df["costo_elegido"]

    print("DF: ", df.columns)
    # Crear listas con el signo de pesos, una por cada fila
    col_signo_pesos = ["$"] * (len(df))

    # Insertar las nuevas columnas en las posiciones deseadas
    df.insert(index_pu - 1, "Col_signo", col_signo_pesos)
    df.insert(index_pu + 1, "Col_signo2", col_signo_pesos)

    # Agregar una fila vacía al final
    df.loc[len(df), "renglon"] = ""
    df.loc[len(df) - 1, "cantidad"] = ""
    df.loc[len(df) - 1, "descripcion"] = ""
    df.loc[len(df) - 1, "ANMAT"] = ""
    df.loc[len(df) - 1, "laboratorio_elegido"] = ""
    df.loc[len(df) - 1, "Col_signo"] = ""
    df.loc[len(df) - 1, "precio_vta"] = ""
    df.loc[len(df) - 1, "Col_signo2"] = "$"
    df.loc[len(df) - 1, "costo_total"] = total_precio_total

    # Crear un estilo de Paragraph para los encabezados
    header_style = ParagraphStyle(
        name="HeaderStyle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=8,
        alignment=1,
        textColor="white",
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

    df = df.rename(
        columns={
            "renglon": "RENGLÓN",
            "cantidad": "CANTIDAD",
            "descripcion": "DESCRIPCIÓN",
            "laboratorio_elegido": "LABORATORIO",
        }
    )
    # print(df)

    # Convertir el DataFrame en una lista para la tabla con Paragraphs
    header_paragraphs = [
        Paragraph(str(cell), header_style) for cell in df.columns.tolist()
    ]

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
                            if i == 5
                            else data_style_precio_total if i == 8 else data_style
                        )
                    )
                ),
            )
            for i, cell in enumerate(row)
        ]
        for row_index, row in enumerate(df.values.tolist())
    ]

    data_for_table = [header_paragraphs] + data_paragraphs

    table = Table(data_for_table)

    # Establecer colspan para simular la fusión
    table._cellvalues[0][index_pu - 1] = Paragraph(
        "PRECIO VTA UNITARIO", header_style
    )  # Contenido para la fusión
    table._cellvalues[0][index_pu] = ""  # Dejar vacía
    table._cellvalues[0][index_pu + 1] = Paragraph(
        "PRECIO TOTAL", header_style
    )  # Contenido para la fusión
    table._cellvalues[0][index_pu + 2] = ""  # Dejar vacía

    # Ajustar el ancho de las columnas dinámicamente
    col_widths = [
        0.6 * inch,  # RENGLON
        0.7 * inch,  # CANTIDAD
        2.3 * inch,  # DESCRIPCION
        0.9 * inch,  # LABORATORIO
        0.5 * inch,  # ANMAT
        0.1 * inch,  # $
        0.8 * inch,  # PRECIO VTA UNITARIO
        0.1 * inch,  # $
        2.1 * inch,  # PRECIO TOTAL
    ]
    # 8.0

    table._argW = col_widths

    # Convertir los valores RGB a valores en el rango 0-1
    color_encabezado = Color(17 / 255.0, 126 / 255.0, 191 / 255.0)
    color_totales = Color(68 / 255.0, 114 / 255.0, 196 / 255.0)

    padding_celdas = 1.5

    estilos_de_tabla = [
        # HEADER
        ("BACKGROUND", (0, 0), (-1, 0), color_encabezado),
        # Un borde en la parte izquierda de todas las celdas
        ("SPAN", (index_pu - 1, 0), (index_pu, 0)),
        ("SPAN", (index_pu + 1, 0), (index_pu + 2, 0)),
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
            (index_pu - 2, -2),
            1,
            colors.black,
        ),  # Rejilla negra para toda la tabla
        ("BOX", (cantidad_columnas, 1), (-1, -1), 1, colors.black),
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
        estilos_de_tabla.append(("LINEABOVE", (index_pu - 1, i), (-1, i), 1, colors.black))

    # Estilizar la tabla
    table_style = TableStyle(estilos_de_tabla)
    table.setStyle(table_style)

    return table


def generar_tabla_entrega(data_entrega):
    tabla_data_entrega = [
        ["", data_entrega["text_monto"]],
        ["Entrega", data_entrega["entrega"]],
        ["Mantenimiento", data_entrega["mantenimineto"]],
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
    ruta_firmas = r"imagenes\firmas"

    for firma in firmas_chequeadas:
        # Verificar si la imagen existe
        img_firma = Image(rf"{ruta_firmas}\{firma}.png")
        img_firma.drawHeight = 2 * inch
        img_firma.drawWidth = 2 * inch
        img_firma.hAlign = 0  # Alineación

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
        # print("SUB LISTA", subListaImg)
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
    data_renglones,
    data_cliente,
    data_entrega,
    firmas_chequeadas,
    total_precio_total,
    columnas_pdf,
):
    # precioTotalTotal = data_productos['PRECIO TOTAL'].pop()

    # df = data_productos
    #############################################################################################
    # df['PRECIO VTA UNITARIO'] = df['PRECIO VTA UNITARIO'].apply(format_price)
    # df['PRECIO TOTAL'] = df['PRECIO TOTAL'].apply(format_price)

    # Añadir una imagen (ajustar la ruta a la imagen que desees usar)
    img_header = Image(r"imagenes\Encabezado.png")
    img_header.drawHeight = 1 * inch
    img_header.drawWidth = 3.38 * inch
    img_header.hAlign = 0

    tabla_datos_cliente = generar_tablas_datos_cliente(data_cliente)

    # Agregar un espacio entre las tablas
    primer_espaciado = Spacer(1, 0.1 * inch)  # Ajusta la altura según necesites

    space_between_tables = Spacer(1, 0.25 * inch)  # Ajusta la altura según necesites

    tabla_demanda = generar_tabla_demanda(
        columnas_pdf, data_renglones, total_precio_total
    )

    tabla_entrega = generar_tabla_entrega(data_entrega)

    img_footer = Image(r"imagenes\Pie.png")
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
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=margins["left"],
        rightMargin=margins["right"],
        topMargin=margins["top"],
        bottomMargin=margins["bottom"],
    )

    elements = [
        img_header,
        primer_espaciado,
        tabla_datos_cliente,
        space_between_tables,
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

    ###############################################################################################
    # Guardar el PDF en un archivo temporal
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(
            buffer.getvalue()
        )  # Escribe el contenido del buffer en el archivo
        temp_file_path = temp_file.name

    # Abrir el PDF con el navegador predeterminado o visor de PDF
    webbrowser.open(f"file://{temp_file_path}")
    ###############################################################################################

    # Mover el cursor al inicio del BytesIO
    buffer.seek(0)

    return buffer


# Función para formatear el precio
def format_price(value):
    value = str(value)
    if value == "-" or value.startswith("0"):
        value = "-"
        return f"{value}"  # Formato para el caso de guion

    elif value:
        num = float(value.replace(",", "."))
        formated_number = (
            f"{num:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        )
        return f"{formated_number}"  # Formatear
    return ""


# Crear el DataFrame con tus datos

datosEjemplo = {
    "TIPO": "pdf",
    "data_cliente": {
        "id": 6,
        "cliente": "PRUEBA",
        "fecha": "2024-12-13",
        "nroLic": "778",
        "tipo": "LP",
        "hora": "11:34",
        "objeto": "Si",
        "estado": "COTIZADO",
        "licitadores": "Santiago Lic",
    },
    "data_renglones": [
        {
            "renglon": "1",
            "cantidad": "123",
            "descripcion": "Prod 1",
            "laboratorio_elegido": "DENVER FARMA",
            "ANMAT": "42656",
            "costo_elegido": "456",
            "precio_vta": "555,00",
            "codigoTarot": "1747",
            "costo_total": "68.265,00",
        },
        {
            "renglon": "2",
            "cantidad": "100",
            "descripcion": "Prod 2",
            "laboratorio_elegido": "",
            "ANMAT": "",
            "costo_elegido": "",
            "precio_vta": "-",
            "codigoTarot": "1747",
            "costo_total": "-",
        },
        {
            "renglon": "3",
            "cantidad": "200",
            "descripcion": "Prod 3",
            "laboratorio_elegido": "ELEA ",
            "ANMAT": "4584",
            "costo_elegido": "123",
            "precio_vta": "354,00",
            "codigoTarot": "1236",
            "costo_total": "70.800,00",
        },
        {
            "renglon": "4",
            "cantidad": "300",
            "descripcion": "Prod 4",
            "laboratorio_elegido": "",
            "ANMAT": "",
            "costo_elegido": "",
            "precio_vta": "-",
            "codigoTarot": "1",
            "costo_total": "-",
        },
        {
            "renglon": "5",
            "cantidad": "400",
            "descripcion": "Prod 5",
            "laboratorio_elegido": "",
            "ANMAT": "",
            "costo_elegido": "",
            "precio_vta": "-",
            "codigoTarot": "7741",
            "costo_total": "-",
        },
    ],
    "data_entrega": {
        "text_monto": "DOS MILLONES",
        "entrega": "Según pliego",
        "mantenimineto": "Según pliego",
        "pago": "Según pliego",
    },
    "total_licitacion": "139.065,00",
    "firmas_chequeadas": [],
    "columnas_pdf": [
        "renglon",
        "cantidad",
        "descripcion",
        "laboratorio_elegido",
        "ANMAT",
        "precio_vta",
    ],
}

generar_PDF(
    datosEjemplo["data_renglones"],
    datosEjemplo["data_cliente"],
    datosEjemplo["data_entrega"],
    datosEjemplo["firmas_chequeadas"],
    datosEjemplo["total_licitacion"],
    datosEjemplo["columnas_pdf"],
)
