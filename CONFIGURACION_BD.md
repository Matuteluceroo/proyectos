# 🗃️ Configuración de Base de Datos SQL Server para Saber Citrícola

## Opciones de Base de Datos

### Opción 1: SQL Server Express (Recomendado para desarrollo)
1. **Descargar SQL Server Express** desde Microsoft (gratis)
2. **Instalar SQL Server Management Studio (SSMS)** para gestión visual
3. **Configurar una instancia local**

### Opción 2: SQL Server LocalDB (Más simple)
1. Viene incluido con Visual Studio o se puede instalar por separado
2. Conexión más simple: `(localdb)\MSSQLLocalDB`

### Opción 3: Azure SQL Database (Nube)
1. Crear una instancia en Azure
2. Configurar firewall para tu IP

## Configuración del archivo .env

Según tu opción elegida, actualiza el archivo `.env` en `BACKEND-SC-main/`:

### Para SQL Server Express local:
```env
USER=tu_usuario
PASSWORD=tu_password
SERVER=localhost
DATABASE=SaberCitricola
```

### Para LocalDB:
```env
USER=
PASSWORD=
SERVER=(localdb)\\MSSQLLocalDB
DATABASE=SaberCitricola
```

### Para Azure SQL:
```env
USER=tu_usuario@servidor
PASSWORD=tu_password
SERVER=tu-servidor.database.windows.net
DATABASE=SaberCitricola
```

## Crear la Base de Datos

Una vez conectado, necesitarás crear las tablas. El proyecto parece tener los siguientes módulos:

- **Usuarios** (autenticación)
- **Documentos** (gestión de archivos)
- **Contenidos** (información citrícola)
- **Indicadores/KPIs** (métricas)
- **Tags** (etiquetas)

## Verificar Conexión

1. Actualiza el archivo `.env` con tus credenciales
2. Ejecuta el backend: `npm run start:backend-test`
3. Si hay errores de conexión, revisa los logs

## Notas Importantes

- El proyecto usa el driver `mssql` de Node.js
- La configuración está en `connection_TEST.js`
- Se requiere que el servidor SQL acepte conexiones TCP/IP
- Para desarrollo local, asegúrate de que SQL Server Browser esté ejecutándose

## Siguientes Pasos

1. ✅ Instalar SQL Server Express o configurar LocalDB
2. ✅ Crear la base de datos "SaberCitricola"
3. ✅ Actualizar las credenciales en `.env`
4. ✅ Probar la conexión ejecutando el backend
5. ✅ Crear las tablas necesarias (el código puede dar pistas de la estructura)