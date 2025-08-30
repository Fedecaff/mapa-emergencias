
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
│   ├── baseDeDatosPostgres.js
│   └── [scripts de migración]
└── 🔄 servicios/
    └── websocketService.js
```

---

## 🔌 **CONEXIONES Y DEPENDENCIAS**

### **Frontend Dependencies (CDN)**
```
📜 index.html
├── 🗺️ Leaflet.js (Mapa)
├── 🔄 Socket.IO Client (WebSocket)
├── 🎨 Font Awesome (Iconos)
└── 📱 Bootstrap (UI)
```

### **Backend Dependencies (npm)**
```
package.json
├── 🚀 express (Servidor)
├── 🔄 socket.io (WebSocket)
├── 🗄️ pg (PostgreSQL)
├── 🔐 bcrypt (Encriptación)
├── 🎫 jsonwebtoken (JWT)
├── 📁 multer (Archivos)
├── ☁️ cloudinary (Imágenes)
├── 🛡️ helmet (Seguridad)
└── 📍 proj4 (Geografía)
```

---

## 🎯 **PUNTOS DE ENTRADA**

### **Para Modificar el Mapa:**
```
🗺️ mapa.js (1281 líneas)
├── Inicialización del mapa
├── Gestión de marcadores
├── Capas y controles
└── Eventos del mapa
```

### **Para Modificar Autenticación:**
```
🔐 autenticacion.js (1039 líneas)
├── Login/Registro
├── Gestión de perfil
├── Validaciones
└── Manejo de sesiones
```

### **Para Modificar Alertas:**
```
🚨 alertas.js (545 líneas) + websocketClient.js (410 líneas)
├── Creación de alertas
├── Notificaciones en tiempo real
├── Gestión de estado
└── Comunicación WebSocket
```

---

## 🔧 **CONFIGURACIÓN DE DESARROLLO**

### **Variables de Entorno**
```env
PUERTO=8080
DATABASE_URL=postgresql://...
JWT_SECRET=...
CLOUDINARY_URL=...
```

### **Scripts de Desarrollo**
```bash
npm start          # Producción
npm run dev        # Desarrollo
npm run init-db    # Base de datos
```

---

## 🚀 **DEPLOYMENT**

### **Plataforma:** Railway
### **Base de Datos:** PostgreSQL (Railway)
### **Archivos:** Cloudinary
### **Dominio:** Automático (Railway)

---

*Diagrama de arquitectura del Sistema de Mapeo de Emergencias*
*Versión: 2.0.0*


