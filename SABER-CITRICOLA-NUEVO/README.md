# 🍊 Saber Citrícola - Proyecto desde Cero

## 📋 ¿Qué es este proyecto?

**Saber Citrícola** es una aplicación web para gestión de documentos y contenidos relacionados con el sector citrícola.

## 🏗️ Arquitectura del Proyecto

```
SABER-CITRICOLA-NUEVO/
├── backend/          # Servidor (API + Base de Datos)
├── frontend/         # Interfaz de usuario (React)
└── README.md         # Este archivo
```

## 🤔 ¿Cómo funciona?

### **Frontend (React)**
- Es lo que ve el usuario (botones, formularios, páginas)
- Se ejecuta en el navegador
- Hace peticiones al backend para obtener datos

### **Backend (Node.js + Express)**
- Es el "cerebro" del sistema
- Maneja la lógica de negocio
- Se conecta a la base de datos
- Responde a las peticiones del frontend

### **Base de Datos (SQLite)**
- Almacena toda la información (usuarios, documentos, etc.)
- SQLite es un archivo que actúa como base de datos

## 🚀 Flujo de funcionamiento

1. Usuario hace clic en "Login" → Frontend
2. Frontend envía usuario/contraseña → Backend
3. Backend verifica en la base de datos
4. Backend responde "OK" o "Error" → Frontend
5. Frontend muestra pantalla principal o error

## 📚 Próximos pasos

1. ✅ Crear estructura básica
2. 🔄 Configurar backend mínimo
3. 🔄 Crear base de datos
4. 🔄 Implementar login
5. 🔄 Crear frontend
6. 🔄 Conectar todo