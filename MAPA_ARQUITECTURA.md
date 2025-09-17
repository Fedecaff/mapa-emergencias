
# MAPA DE ARQUITECTURA
## Sistema de Mapeo de Emergencias - Catamarca

---

## 🏗️ **ARQUITECTURA GENERAL**

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (public/)                      │
├─────────────────────────────────────────────────────────────────┤
│  📱 index.html (34KB)                                          │
│  ├── 🎨 CSS (estilos.css)                                      │
│  └── 📜 JavaScript (11 archivos)                               │
│      ├── 🗺️ mapa.js (47KB) - Mapa principal                    │
│      ├── 🔐 autenticacion.js (38KB) - Login/Registro           │
│      ├── 🚨 alertas.js (21KB) - Alertas de emergencia          │
│      ├── 🔄 websocketClient.js (16KB) - Tiempo real            │
│      ├── 👥 administracion.js (19KB) - Panel admin             │
│      ├── 🛠️ utilidades.js (13KB) - APIs y helpers              │
│      └── 📍 geolocalizacion.js (8KB) - GPS                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/WebSocket
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (src/)                          │
├─────────────────────────────────────────────────────────────────┤
│  ⚙️ servidor.js (164 líneas) - Servidor principal              │
│  ├── 🔌 Rutas API (8 archivos)                                 │
│  ├── 🎮 Controladores (8 archivos)                             │
│  ├── 🗄️ Modelos (Base de datos)                               │
│  └── 🔄 Servicios (WebSocket)                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ PostgreSQL
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS (PostgreSQL)                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   usuarios  │ │alertas_emerg│ │   puntos    │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ categorias  │ │fotos_puntos │ │historial_cam│              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 **FLUJO DE DATOS**

### **1. Autenticación**
```
Usuario → Frontend (autenticacion.js) → API (/api/autenticacion) → Backend (autenticacionController.js) → Base de datos
```

### **2. Alertas en Tiempo Real**
```
Admin → Frontend (alertas.js) → API (/api/alertas) → Backend (alertasController.js) → WebSocket → Operadores (websocketClient.js)
```

### **3. Gestión del Mapa**
```
Usuario → Frontend (mapa.js) → API (/api/puntos) → Backend (puntosController.js) → Base de datos
```

---

## 📁 **ESTRUCTURA DETALLADA**

### **FRONTEND (public/)**
```
public/
├── 📄 index.html
├── 🎨 css/
│   └── estilos.css
├── 📜 js/
│   ├── 🗺️ mapa.js (1361 líneas) - Mapa principal
│   ├── 🔐 autenticacion.js (1028 líneas) - Login/Registro
│   ├── 🚨 alertas.js (588 líneas) - Alertas
│   ├── 👥 administracion.js (554 líneas) - Admin
│   ├── 🛠️ utilidades.js (441 líneas) - APIs
│   ├── 🚀 app.js (301 líneas) - Inicialización
│   ├── 👤 usuarios.js (332 líneas) - Usuarios
│   ├── 📸 fotos.js (270 líneas) - Fotos
│   ├── 📍 geolocalizacion.js (232 líneas) - GPS
│   ├── 📍 direcciones.js (227 líneas) - Direcciones
│   └── ⚙️ config.js (23 líneas) - Configuración
└── 🖼️ favicon.ico
```

### **BACKEND (src/)**
```
src/
├── ⚙️ configuracion/
│   └── servidor.js - Servidor principal
├── 🔌 rutas/
│   ├── usuarios.js (75 líneas)
│   ├── fotos.js (40 líneas)
│   ├── alertas.js (17 líneas)
│   ├── puntos.js (14 líneas)
│   ├── historial.js (13 líneas)
│   ├── categorias.js (12 líneas)
│   ├── autenticacion.js (12 líneas)
│   └── perfil.js (10 líneas)
├── 🎮 controladores/
│   ├── puntosController.js (332 líneas)
│   ├── alertasController.js (236 líneas)
│   ├── fotosController.js (233 líneas)
│   ├── categoriasController.js (210 líneas)
│   ├── autenticacionController.js (175 líneas)
│   ├── perfilController.js (151 líneas)
│   ├── historialController.js (135 líneas)
│   └── usuariosController.js - Gestión de usuarios
├── 🗄️ modelos/
│   └── baseDeDatosPostgres.js - Conexión PostgreSQL
└── 🔄 servicios/
    └── websocketService.js - WebSocket en tiempo real
```

---

## 🔔 **SISTEMA DE NOTIFICACIONES**

### **Arquitectura de Notificaciones**
```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE NOTIFICACIONES                   │
├─────────────────────────────────────────────────────────────────┤
│  📱 Frontend (utilidades.js)                                   │
│  ├── 🔔 Notifications.info() - 2 segundos                      │
│  ├── ✅ Notifications.success() - 3 segundos                   │
│  ├── ⚠️ Notifications.warning() - 4 segundos                   │
│  └── ❌ Notifications.error() - 5 segundos                     │
├─────────────────────────────────────────────────────────────────┤
│  🔄 WebSocket (websocketClient.js)                             │
│  ├── 🚨 Alertas de emergencia - 10 segundos                    │
│  ├── 🗑️ Notificaciones de eliminación - 3 segundos            │
│  └── 📢 Otras notificaciones - 5 segundos                      │
└─────────────────────────────────────────────────────────────────┘
```

### **Flujo de Notificaciones**
```
Evento → Frontend → Notifications.show() → UI → Auto-remover (tiempo configurado)
```

---

## 🗄️ **BASE DE DATOS**

### **Tablas Principales**
```sql
-- Usuarios del sistema
usuarios (
    id, nombre, email, password, rol, telefono,
    disponible, foto_perfil, institucion, rol_institucion,
    latitud, longitud, ultima_actualizacion_ubicacion, created_at
)

-- Alertas de emergencia
alertas_emergencia (
    id, tipo, prioridad, titulo, descripcion,
    latitud, longitud, direccion, personas_afectadas,
    riesgos_especificos, concurrencia_solicitada, estado,
    usuario_id, fecha_creacion, fecha_actualizacion
)

-- Puntos en el mapa
puntos (
    id, nombre, descripcion, latitud, longitud,
    categoria_id, datos_personalizados, estado,
    fecha_creacion, fecha_actualizacion
)

-- Categorías de puntos
categorias (
    id, nombre, descripcion, icono, color,
    campos_personalizados, estado, fecha_creacion
)

-- Fotos de puntos
fotos_puntos (
    id, punto_id, nombre_archivo, ruta_archivo, ruta_miniatura,
    descripcion, tamaño_bytes, tipo_mime, usuario_id,
    public_id, fecha_subida
)

-- Historial de cambios
historial_cambios (
    id, tabla, registro_id, accion, datos_anteriores,
    datos_nuevos, usuario_id, fecha_cambio
)
```

---

## 🔄 **WEBSOCKET**

### **Eventos WebSocket**
```javascript
// Cliente → Servidor
'authenticate'     // Autenticación del usuario
'markNotificationRead' // Marcar notificación como leída

// Servidor → Cliente
'newAlert'         // Nueva alerta de emergencia
'alertDeleted'     // Alerta eliminada
'notification'     // Notificación general
'authenticated'    // Confirmación de autenticación
```

### **Flujo WebSocket**
```
Cliente → Conectar → Autenticar → Escuchar eventos → Procesar notificaciones
```

---


## 🚀 **DEPLOYMENT**

### **Railway Deployment**
```
GitHub → Railway → PostgreSQL → Aplicación desplegada
```

### **Variables de Entorno**
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=3000
```

---

## 📊 **ESTADÍSTICAS DEL PROYECTO**

- **Total de archivos:** 59 archivos principales
- **Líneas de código:** 13,580 líneas
- **Tecnologías:** Node.js, Express, PostgreSQL, Socket.io
- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Deployment:** Railway (automático)
- **Base de datos:** 6 tablas principales con 13 índices

---

*Mapa de arquitectura del Sistema de Mapeo de Emergencias*
*Versión: 2.2.0 - Actualizada con estructura de base de datos corregida*


