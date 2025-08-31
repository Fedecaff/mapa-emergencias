
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
│  │   usuarios  │ │   alertas   │ │   puntos    │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ categorias  │ │    fotos    │ │  historial  │              │
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
├── 📄 index.html (749 líneas)
├── 🎨 css/
│   └── estilos.css
├── 📜 js/
│   ├── 🗺️ mapa.js (1281 líneas) - Mapa principal
│   ├── 🔐 autenticacion.js (1039 líneas) - Login/Registro
│   ├── 🚨 alertas.js (545 líneas) - Alertas
│   ├── 🔄 websocketClient.js (410 líneas) - WebSocket
│   ├── 👥 administracion.js (559 líneas) - Admin
│   ├── 🛠️ utilidades.js (434 líneas) - APIs
│   ├── 👤 usuarios.js (367 líneas) - Usuarios
│   ├── 📸 fotos.js (303 líneas) - Fotos
│   ├── 📍 geolocalizacion.js (235 líneas) - GPS
│   ├── 🚀 app.js (309 líneas) - Inicialización
│   └── ⚙️ config.js (25 líneas) - Configuración
└── 🖼️ favicon.ico
```

### **BACKEND (src/)**
```
src/
├── ⚙️ configuracion/
│   └── servidor.js (164 líneas) - Servidor principal
├── 🔌 rutas/
│   ├── usuarios.js (87 líneas)
│   ├── alertas.js (19 líneas)
│   ├── puntos.js (19 líneas)
│   ├── fotos.js (47 líneas)
│   ├── categorias.js (17 líneas)
│   ├── historial.js (24 líneas)
│   ├── perfil.js (15 líneas)
│   └── autenticacion.js (18 líneas)
├── 🎮 controladores/
│   ├── usuariosController.js (681 líneas)
│   ├── alertasController.js (318 líneas)
│   ├── puntosController.js (387 líneas)
│   ├── fotosController.js (267 líneas)
│   ├── categoriasController.js (251 líneas)
│   ├── autenticacionController.js (208 líneas)
│   ├── perfilController.js (178 líneas)
│   └── historialController.js (166 líneas)
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
    id, nombre, email, password_hash, rol, 
    foto_perfil, disponible, ultima_ubicacion, 
    fecha_creacion, fecha_actualizacion
)

-- Alertas de emergencia
alertas (
    id, titulo, descripcion, tipo, prioridad,
    latitud, longitud, direccion, estado,
    usuario_id, fecha_creacion
)

-- Puntos en el mapa
puntos (
    id, nombre, descripcion, categoria_id,
    latitud, longitud, direccion, fecha_creacion
)

-- Categorías de puntos
categorias (
    id, nombre, descripcion, icono, color
)

-- Fotos de puntos
fotos (
    id, punto_id, url, descripcion, fecha_subida
)

-- Historial de actividades
historial (
    id, usuario_id, accion, detalles, fecha
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

- **Total de archivos:** 25+ archivos principales
- **Líneas de código:** ~8,000 líneas
- **Tecnologías:** Node.js, Express, PostgreSQL, Socket.io
- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Deployment:** Railway (automático)

---

*Mapa de arquitectura del Sistema de Mapeo de Emergencias*
*Versión: 2.1.0 - Actualizada con optimizaciones de notificaciones*


