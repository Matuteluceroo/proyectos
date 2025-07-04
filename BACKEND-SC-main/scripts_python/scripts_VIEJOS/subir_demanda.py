import pandas as pd
import numpy as np
#from generar_pdf_demanda import generar_PDF
    
def analizar_excel(data_productos, data_cliente, data_entrega):
    #data_productos['PRECIO TOTAL'].pop()
    
    #df = pd.DataFrame(data_productos)
    
    # nombre_archivo_incompleto = []
    print(data_cliente)
    
    return "df_to_PDF", data_cliente, data_entrega, 0
    datos_grales = {'cliente':data_cliente['CLIENTE'], 
                    'fecha_apertura':data_cliente['FECHA'], 
                    'nro_licitacion':data_cliente['N° C/L'],
                    'tipo_licitacion': data_cliente['TIPO']
                    }
    
    datos_renglon, prods_no_asociados_a_tarot, columnas_faltantes, df_para_convertir = leer_excel(df)
        
    if columnas_faltantes != 0:
        # EL ARCHIVO ESTÁ INCOMPLETO
        print("EL ARCHIVO ESTÁ INCOMPLETO")
        print("FALTAN",columnas_faltantes)
        return columnas_faltantes, None, None, None
    else:
        if len(prods_no_asociados_a_tarot) == 0:
            # AQUI MUESTRA BIEN
            # print(df_para_convertir)
            df_to_PDF, data_cliente, data_entrega, total_precio_total = construir_PDF(df_para_convertir,
                            data_cliente,
                            data_entrega)
            return df_to_PDF, data_cliente, data_entrega, total_precio_total    
        else:
            # EL ARCHIVO TIENE NO ASOCIADOS A TAROT
            print("EL ARCHIVO TIENE NO ASOCIADOS A TAROT")
            print("FALTAN",prods_no_asociados_a_tarot)
            
    return df_to_PDF, data_cliente, data_entrega, total_precio_total    
       
    #df_excel_Tarot = crear_excel_Tarot(datos_grales, datos_renglon)
                        
    # Guardar el DataFrame en un archivo Excel
    # df.to_excel(ruta_nuevo_archivo, index=False, header=False, engine='openpyxl')
     
    
def crear_excel_Tarot(datos_grales, datos_renglon):
    # Crear un DataFrame vacío
    df = pd.DataFrame()
    
    for i in range(3):
        for j in range(15):
            df.at[i,j] = ''
    
    df.at[3, 0] = 'CLIENTE'
    df.at[3, 1] = 'FECHA APERTURA'
    df.at[3, 2] = 'NRO LICITACION'
    df.at[3, 3] = 'OFERENTE'
    df.at[3, 4] = 'RENGLON'
    df.at[3, 5] = 'PRECIO'
    df.at[3, 6] = 'MARCA'
    df.at[3, 7] = ''
    df.at[3, 8] = ''
    df.at[3, 9] = 'CLIENTE'
    df.at[3, 10] = 'FECHA APERTURA'
    df.at[3, 11] = 'NRO LICITACION'
    df.at[3, 12] = 'TIPO LICITACION'
    df.at[3, 13] = 'RENGLON'
    df.at[3, 14] = 'CANTIDAD'
    df.at[3, 15] = 'DESCRIPCION'
    
    
    rng_actual = 4
    
    for data_rngl in datos_renglon:
        df.at[rng_actual, 0] = datos_grales['cliente']
        df.at[rng_actual, 1] = datos_grales['fecha_apertura']
        df.at[rng_actual, 2] = datos_grales['nro_licitacion']
        df.at[rng_actual, 3] = 'MACROPHARMA S.A.'
        df.at[rng_actual, 4] = data_rngl['renglon']
        df.at[rng_actual, 5] = data_rngl['precio_vta']
        df.at[rng_actual, 6] = data_rngl['laboratorio']
        
        df.at[rng_actual, 9] = datos_grales['cliente']
        df.at[rng_actual, 10] = datos_grales['fecha_apertura']
        df.at[rng_actual, 11] = datos_grales['nro_licitacion']
        df.at[rng_actual, 12] = datos_grales['tipo_licitacion']
        df.at[rng_actual, 13] = data_rngl['renglon']
        df.at[rng_actual, 14] = data_rngl['cantidad']
        df.at[rng_actual, 15] = data_rngl['descripcion']
        
        rng_actual = rng_actual + 1
    
    return df

def leer_excel(df):
    # Leer el archivo Excel usando la primera fila como encabezados
    """ df = pd.read_excel(archivo_excel, engine='openpyxl',sheet_name=0)
    
    if str(df.columns[0]) == 'nan' or str(df.columns[0]).startswith('Unnamed'):
        for i in range(len(df)):
            if str(df.iloc[i,0]) != 'nan':
                break
            
        # Si no se encuentra una fila válida, manejar el caso aquí
        if i >= len(df) - 1:
            raise ValueError("No se encontró una fila válida para los encabezados.")
    
        # Ajustar el DataFrame para que la fila identificada sea el nuevo encabezado
        df.columns = df.iloc[i]
        df = df[i+1:].reset_index(drop=True) """
        
        
    # Lista de columnas obligatorias
    columnas_obligatorias = ['NOMBRE TAROT', 'RENGLON', 'N° C/L', 'CANTIDAD', 'FECHA APERTURA', 'PRECIO VTA UNITARIO', 'CLIENTE', 'TIPO DE LICITACION', 'DESCRIPCION', 'LABORATORIO', 'ANMAT', 'COD TAROT', 'COD CLIENTE', 'COSTO ELEGIDO', 'PRECIO TOTAL']
    
    # Verificar si alguna de las columnas obligatorias falta en el DataFrame
    columnas_faltantes = [col for col in columnas_obligatorias if col not in df.columns]
    
    #licitaciones_sin_nombre_tarot = []
    if columnas_faltantes:
        return 0, 0, columnas_faltantes, 0
        
    
    df['RENGLON'] = pd.to_numeric(df['RENGLON'], errors='coerce')
    df['RENGLON'] = df['RENGLON'].astype('Int64')
    #df['RENGLON'] = df['RENGLON'].astype(str)
    
    df['N° C/L'] = pd.to_numeric(df['N° C/L'], errors='coerce')
    df['N° C/L'] = df['N° C/L'].astype('Int64')
    #df['N° C/L'] = df['N° C/L'].astype(str)
    
    df['CANTIDAD'] = pd.to_numeric(df['CANTIDAD'], errors='coerce')
    df['CANTIDAD'] = df['CANTIDAD'].astype('Int64')
    #df['CANTIDAD'] = df['CANTIDAD'].astype(str)
    
     # Convertir la columna 'FECHA APERTURA' a datetime y luego formatear
    df['FECHA APERTURA'] = pd.to_datetime(df['FECHA APERTURA'])
    df['FECHA APERTURA'] = df['FECHA APERTURA'].dt.strftime('%d/%m/%Y')
    
    # Reemplazar NaN en 'PRECIO VTA UNITARIO' con 0
    df['PRECIO VTA UNITARIO'] = pd.to_numeric(df['PRECIO VTA UNITARIO'], errors='coerce')
    df['PRECIO VTA UNITARIO'] = df['PRECIO VTA UNITARIO'].fillna(0)
    df['PRECIO VTA UNITARIO'] = df['PRECIO VTA UNITARIO'].astype(str)
    
    df['PRECIO TOTAL'] = pd.to_numeric(df['PRECIO TOTAL'], errors='coerce')
    df['PRECIO TOTAL'] = df['PRECIO TOTAL'].fillna(0)
    df['PRECIO TOTAL'] = df['PRECIO TOTAL'].astype(str)
    
    datos_renglon = []
    productos_no_asociados_a_tarot = []
    
    for fila_leida in range(len(df) - 1):
        renglon = df.loc[fila_leida, 'RENGLON']
        if str(renglon) == '<NA>':
            continue
        
        if df.loc[fila_leida, 'NOMBRE TAROT'] != "#NO Asociado a Tarot":
                descripcion = df.loc[fila_leida, 'NOMBRE TAROT']
        else:
            descripcion = df.loc[fila_leida, 'DESCRIPCION']
            # SI NO ESTÁ ASOCIADO A TAROT, NO GUARDAR LA LICITACIÓN Y ANOTAR EL NÚMERO Y NOMBRE
            productos_no_asociados_a_tarot.append(str(descripcion))
            continue
        
        cantidad = df.loc[fila_leida, 'CANTIDAD']
        laboratorio = df.loc[fila_leida, 'LABORATORIO']
        if laboratorio=='nan':
            laboratorio = ''
        precio_vta = str(df.loc[fila_leida, 'PRECIO VTA UNITARIO']).replace('.',',')
        
        if str(descripcion) != 'nan':
            if str(renglon) != '<NA>':
                datos_renglon.append({'renglon':renglon, 'cantidad':cantidad, 'descripcion':descripcion, 'laboratorio':laboratorio, 'precio_vta':precio_vta})
    
    df_to_PDF = df[['RENGLON', 'CANTIDAD', 'DESCRIPCION', 'LABORATORIO', 'ANMAT', 'PRECIO VTA UNITARIO','PRECIO TOTAL']]
    
    return datos_renglon, productos_no_asociados_a_tarot, 0, df_to_PDF

def construir_PDF(df_to_PDF, data_cliente, data_entrega):
    df_to_PDF.loc[:, 'PRECIO TOTAL'] = pd.to_numeric(df_to_PDF['PRECIO TOTAL'], errors='coerce')

    # Calcular la sumatoria de la columna 'PRECIO TOTAL'
    total_precio_total = int(df_to_PDF['PRECIO TOTAL'].sum())
    
    # Asegúrate de que df_to_PDF sea el DataFrame original o crea una copia
    df_to_PDF = df_to_PDF.copy()  # Si es necesario

    # Reemplaza los valores
    df_to_PDF.replace('', np.nan, inplace=True)
    df_to_PDF.replace('0.0', np.nan, inplace=True)
    
    df_to_PDF = df_to_PDF.dropna(how='all')
    
    # Reemplazar NaN en la columna 'LABORATORIO' con 'NO COTIZA'
    df_to_PDF['LABORATORIO'] = df_to_PDF['LABORATORIO'].fillna('NO COTIZA')
    df_to_PDF['ANMAT'] = df_to_PDF['ANMAT'].fillna('')
    # PRECIO VTA UNITARIO
    df_to_PDF['PRECIO VTA UNITARIO'] = df_to_PDF['PRECIO VTA UNITARIO'].fillna('-')
    
    # Asegúrate de que la columna tenga el tipo adecuado
    df_to_PDF['PRECIO TOTAL'] = df_to_PDF['PRECIO TOTAL'].astype(object)

    # Rellenar los valores NaN
    df_to_PDF['PRECIO TOTAL'] = df_to_PDF['PRECIO TOTAL'].fillna('-')
    
    fila_totales = {'RENGLON':'', 'CANTIDAD':'', 'DESCRIPCION':'', 'LABORATORIO':'', 'ANMAT':'', 'PRECIO VTA UNITARIO':'', 'PRECIO TOTAL':total_precio_total}
    # Crear un nuevo DataFrame a partir de la fila
    nueva_fila_df = pd.DataFrame([fila_totales])
    # Concatenar el nuevo DataFrame con el existente
    df_to_PDF = pd.concat([df_to_PDF, nueva_fila_df], ignore_index=True)
    
    return df_to_PDF, data_cliente, data_entrega, total_precio_total


""" if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generar Excel con toda la demanda")
    parser.add_argument('carpeta', type=str, help='Ruta a la carpeta que contiene los Cotizadores')

    args = parser.parse_args()
    leer_archivos_xlsx(args.carpeta) """