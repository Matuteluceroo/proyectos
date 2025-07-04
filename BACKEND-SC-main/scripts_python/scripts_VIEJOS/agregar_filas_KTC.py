import pandas as pd
import pyodbc

# === Configuración ===
archivo_excel = r'C:\Users\Testing\Downloads\Agregar 250509.xlsx'  # Cambiá por la ruta real
nombre_tabla = 'BaseKTC'            # Cambiá por el nombre real
base_datos = 'KTC_3_testing'                # Cambiá si tu BD es otra

# === Leer Excel ===
df = pd.read_excel(archivo_excel)

if 'idKairos' in df.columns:
    df = df.drop(columns=['idKairos'])


df = df.astype(str)  # Aseguramos formato texto para evitar errores de tipo

# === Conectar a SQL Server ===
conn = pyodbc.connect(
    'DRIVER={ODBC Driver 17 for SQL Server};'
    'SERVER=localhost;'
    'DATABASE=KTC_3_testing;'
    'UID=user_talicom;'
    'PWD=macro7423;'
)
cursor = conn.cursor()



# === Preparar INSERT dinámico ===
columnas = ', '.join(f"[{col}]" for col in df.columns)
placeholders = ', '.join('?' for _ in df.columns)
query_insert = f"INSERT INTO dbo.{nombre_tabla} ({columnas}) VALUES ({placeholders})"

# === Insertar filas una por una ===
for _, fila in df.iterrows():
    cursor.execute(query_insert, tuple(fila))

conn.commit()
cursor.close()
conn.close()

print("✅ Filas insertadas correctamente.")
