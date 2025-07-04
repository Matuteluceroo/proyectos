import os
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

# Cargar variables del .env
load_dotenv()

# Acceder a la ruta desde el entorno
ruta = os.getenv("RUTA_COMPARATIVOS")

if not ruta:
    raise ValueError("La variable RUTA_COMPARATIVOS no está definida en el .env")

# Obtener ruta absoluta de la carpeta donde está este script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Lista para almacenar datos y nombres de carpetas con cargado.txt
datos = []
nombres_carpetas = []

# Recorrer todas las carpetas
for root, dirs, files in os.walk(ruta):
    for carpeta in dirs:
        ruta_completa = os.path.join(root, carpeta)

        partes = carpeta.split()

        if len(partes) >= 6 and partes[0].isdigit() and partes[1].isdigit() and partes[2].isdigit():
            # Verificar si hay un archivo cargado.txt o CARGADO.txt
            try:
                archivos = os.listdir(ruta_completa)
                tiene_archivo_cargado = any(
                    archivo.lower() == "cargado.txt" for archivo in archivos
                )
            except Exception:
                tiene_archivo_cargado = False

            if not tiene_archivo_cargado:
                continue  # ❌ Si no tiene cargado.txt, lo salteamos

            # Si tiene cargado.txt, procesamos normalmente
            try:
                fecha_str = f"{partes[0]}-{partes[1]}-{partes[2]}"
                fecha_obj = datetime.strptime(fecha_str, "%Y-%m-%d")
            except:
                fecha_obj = None

            nombre_cliente = " ".join(partes[3:-2])
            tipo = partes[-2]
            nro_licitacion = partes[-1]

            nombre_normalizado = " ".join(carpeta.strip().split())

            datos.append({
                "nombre_carpeta": nombre_normalizado,
                "fecha": fecha_obj,
                "nombre_cliente": nombre_cliente,
                "tipo": tipo,
                "nro_licitacion": nro_licitacion
            })

            nombres_carpetas.append(nombre_normalizado)

# Crear DataFrame con solo carpetas válidas con cargado.txt
df = pd.DataFrame(datos)
df = df.sort_values(by="fecha", ascending=False)
df["fecha"] = df["fecha"].apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) else None)

# Guardar listado de carpetas con cargado.txt
archivo_listado = os.path.join(script_dir, "listado_carpetas.txt")
with open(archivo_listado, "w", encoding="utf-8") as f:
    for nombre in nombres_carpetas:
        f.write(nombre + "\n")

# Imprimir JSON solo si se ejecuta directamente
if __name__ == "__main__":
    print(df.to_json(orient="records", force_ascii=False))
