import pandas as pd
import pyodbc

# Ruta del archivo Excel
ruta_excel = r"C:\Users\Testing\Desktop\Conductores.xlsx"  # <- Cambiá esto por la ruta real

# Leer el Excel
df = pd.read_excel(ruta_excel)

# Conexión a SQL Server
conn = pyodbc.connect(
    'DRIVER={ODBC Driver 17 for SQL Server};'
    'SERVER=localhost;'
    'DATABASE=KTC_3_testing;'
    'UID=user_talicom;'
    'PWD=macro7423;'  # o usa UID=usuario;PWD=contraseña si no usás autenticación de Windows
)

cursor = conn.cursor()

# Activar IDENTITY_INSERT
cursor.execute("SET IDENTITY_INSERT Conductores ON")

for _, row in df.iterrows():
    try:
        if pd.isna(row['Codigo']) or pd.isna(row['Descripcion']) or pd.isna(row['Tipo']):
            continue  # omitir filas incompletas

        codigo = int(float(row['Codigo']))  # asegura que 1.0 se convierta a 1
        descripcion = str(row['Descripcion']).strip()
        tipo = str(row['Tipo']).strip()

        cursor.execute(
            "INSERT INTO Conductores (Codigo, Descripcion, Tipo) VALUES (?, ?, ?)",
            codigo, descripcion, tipo
        )
    except Exception as e:
        print(f"❌ Error en fila {row.to_dict()}: {e}")


# Desactivar IDENTITY_INSERT
cursor.execute("SET IDENTITY_INSERT Conductores OFF")

conn.commit()
cursor.close()
conn.close()

print("✅ Datos insertados correctamente.")
