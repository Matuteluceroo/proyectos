import os
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

# Cargar variables del .env
load_dotenv()

# Ruta principal desde el .env
ruta = os.getenv("RUTA_COMPARATIVOS")
if not ruta:
    raise ValueError("La variable RUTA_COMPARATIVOS no está definida en el .env")

# Ruta del archivo cargados.txt junto al script
script_dir = os.path.dirname(os.path.abspath(__file__))
archivo_estado = os.path.join(script_dir, "cargados.txt")

# Cargar nombres ya procesados
if os.path.exists(archivo_estado):
    with open(archivo_estado, "r", encoding="utf-8") as f:
        carpetas_cargadas = set(" ".join(line.strip().split()) for line in f if line.strip())
else:
    carpetas_cargadas = set()

datos = []

# Recorrer estructura: AÑO > MES > CARPETA_LICITACION
for anio in os.listdir(ruta):
    ruta_anio = os.path.join(ruta, anio)
    if not os.path.isdir(ruta_anio) or not anio.isdigit():
        continue

    for mes in os.listdir(ruta_anio):
        ruta_mes = os.path.join(ruta_anio, mes)
        if not os.path.isdir(ruta_mes):
            continue

        for carpeta in os.listdir(ruta_mes):
            ruta_carpeta = os.path.join(ruta_mes, carpeta)
            if not os.path.isdir(ruta_carpeta):
                continue

            partes = carpeta.strip().split()
            if len(partes) < 6:
                continue  # No cumple con estructura mínima

            # Validar fecha
            try:
                fecha_str = f"{partes[0]}-{partes[1]}-{partes[2]}"
                fecha_obj = datetime.strptime(fecha_str, "%Y-%m-%d")
            except ValueError:
                continue

            nombre_cliente = " ".join(partes[3:-2])
            tipo = partes[-2]
            nro_licitacion = partes[-1]

            nombre_normalizado = " ".join(carpeta.strip().split())
            valor_cargado = nombre_normalizado in carpetas_cargadas

            datos.append({
                "nombre_carpeta": nombre_normalizado,
                "fecha": fecha_obj,
                "nombre_cliente": nombre_cliente,
                "tipo": tipo,
                "nro_licitacion": nro_licitacion,
                "cargado": valor_cargado
            })

# Crear DataFrame ordenado
df = pd.DataFrame(datos)
df = df.sort_values(by="fecha", ascending=False)
df["fecha"] = df["fecha"].apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) else None)

# Exportar por stdout si se ejecuta como script
if __name__ == "__main__":
    print(df.to_json(orient="records", force_ascii=False))
