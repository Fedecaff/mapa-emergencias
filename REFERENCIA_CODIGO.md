# REFERENCIA DEL CÓDIGO
## Sistema de Mapeo de Emergencias - Catamarca

---

## 📁 **ESTRUCTURA DEL PROYECTO**

### **Raíz del Proyecto**
```
├── public/                 # Frontend (HTML, CSS, JS)
├── src/                    # Backend (Node.js)
├── uploads/                # Archivos subidos
├── scripts/                # Scripts de utilidad
├── datos/                  # Datos de ejemplo
├── package.json            # Dependencias y scripts
├── README.md               # Documentación principal
├── GUIA_DESARROLLO.md      # Guía de desarrollo
├── MAPA_ARQUITECTURA.md    # Arquitectura del sistema
├── REFERENCIA_CODIGO.md    # Esta referencia
├── VENTAJAS_APP_MOVIL.md   # Ventajas de la app móvil
└── Procfile                # Configuración Railway
```

---

## 🎯 **FRONTEND (public/)**

### **Archivos Principales**
- **`index.html`** - Página principal (34KB, 749 líneas)
- **`favicon.ico`** - Icono del sitio

### **JavaScript (public/js/)**
| Archivo | Tamaño | Líneas | Función Principal |
|---------|--------|--------|-------------------|
| `app.js` | 10KB | 309 | Inicialización de la aplicación |
| `mapa.js` | 47KB | 1281 | **Gestión del mapa principal** |
| `autenticacion.js` | 38KB | 1039 | **Login, registro, perfil** |
| `alertas.js` | 21KB | 545 | **Gestión de alertas de emergencia** |
| `websocketClient.js` | 16KB | 410 | **Comunicación en tiempo real** |
| `administracion.js` | 19KB | 559 | **Panel de administración** |
| `usuarios.js` | 13KB | 367 | Gestión de usuarios |
| `utilidades.js` | 13KB | 434 | **Funciones de utilidad y API** |
| `fotos.js` | 10KB | 303 | Gestión de fotos |
| `geolocalizacion.js` | 8KB | 235 | **Geolocalización del usuario** |
| `config.js` | 652B | 25 | Configuración |

### **CSS (public/css/)**
- **`estilos.css`** - Estilos principales de la aplicación

---

## ⚙️ **BACKEND (src/)**

### **Configuración (src/configuracion/)**
- **`servidor.js`** - **Servidor principal** (164 líneas)
  - Configuración Express
  - Middleware de seguridad
  - Rutas API
  - WebSocket setup

### **Controladores (src/controladores/)**
| Archivo | Tamaño | Líneas | Función |
|---------|--------|--------|---------|
| `usuariosController.js` | 25KB | 681 | **Gestión completa de usuarios** |
| `alertasController.js` | 12KB | 318 | **Gestión de alertas** |
| `puntosController.js` | 14KB | 387 | Gestión de puntos en el mapa |
| `fotosController.js` | 9.4KB | 267 | Gestión de fotos |
| `categoriasController.js` | 8.8KB | 251 | Gestión de categorías |
| `autenticacionController.js` | 6.5KB | 208 | **Autenticación y login** |
| `perfilController.js` | 6.2KB | 178 | Gestión de perfiles |
| `historialController.js` | 5.7KB | 166 | Historial de actividades |

### **Rutas (src/rutas/)**
| Archivo | Tamaño | Líneas | Endpoints |
|---------|--------|--------|-----------|
| `usuarios.js` | 3.6KB | 87 | `/api/usuarios/*` |
| `alertas.js` | 721B | 19 | `/api/alertas/*` |
| `puntos.js` | 874B | 19 | `/api/puntos/*` |
| `fotos.js` | 1.6KB | 47 | `/api/fotos/*` |
| `categorias.js` | 749B | 17 | `/api/categorias/*` |
| `historial.js` | 717B | 24 | `/api/historial/*` |
| `perfil.js` | 653B | 15 | `/api/perfil/*` |
| `autenticacion.js` | 618B | 18 | `/api/autenticacion/*` |

### **Modelos (src/modelos/)**
- **`baseDeDatosPostgres.js`** - Conexión a PostgreSQL
- Scripts de migración y actualización de base de datos

### **Servicios (src/servicios/)**
- **`websocketService.js`** - **Servicio WebSocket** para tiempo real

---

## 🔧 **DEPENDENCIAS PRINCIPALES**

### **Backend (package.json)**
```json
{
  "express": "^4.18.2",           // Servidor web
  "socket.io": "^4.8.1",          // WebSocket
  "pg": "^8.16.3",               // PostgreSQL
  "bcrypt": "^5.1.1",            // Encriptación
  "jsonwebtoken": "^9.0.2",      // JWT
  "multer": "^1.4.5-lts.1",      // Subida de archivos
  "cloudinary": "^1.41.0",       // Almacenamiento de imágenes
  "helmet": "^7.1.0",            // Seguridad
  "cors": "^2.8.5",              // CORS
  "dotenv": "^16.3.1"            // Variables de entorno
}
```

### **Frontend (CDN)**
```html
<!-- index.html -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
<script src="https://kit.fontawesome.com/your-kit.js"></script>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
```

---

## 🔔 **SISTEMA DE NOTIFICACIONES**

### **Clase Notifications (utilidades.js)**
```javascript
class Notifications {
    static show(message, type = 'success', duration = null) {
        // Duración automática basada en tipo
        if (duration === null) {
            switch (type) {
                case 'info': duration = 2000; break;      // 2 segundos
                case 'success': duration = 3000; break;   // 3 segundos
                case 'warning': duration = 4000; break;   // 4 segundos
                case 'error': duration = 5000; break;     // 5 segundos
                default: duration = 3000;
            }
        }
        // Mostrar notificación y auto-remover
    }
    
    static info(message, duration = null) { return this.show(message, 'info', duration); }
    static success(message, duration = null) { return this.show(message, 'success', duration); }
    static warning(message, duration = null) { return this.show(message, 'warning', duration); }
    static error(message, duration = null) { return this.show(message, 'error', duration); }
}
```

### **Notificaciones WebSocket (websocketClient.js)**
```javascript
showInAppNotification(notification) {
    // Duración específica para alertas
    let duration = 10000; // Por defecto 10 segundos
    if (notification.type === 'alertDeleted') {
        duration = 3000; // 3 segundos para eliminación
    } else if (notification.type === 'alert') {
        duration = 10000; // 10 segundos para alertas
    } else {
        duration = 5000; // 5 segundos para otras
    }
    // Mostrar y auto-remover
}
```

---

## 🗄️ **BASE DE DATOS**

### **Tablas Principales**
```sql
-- Usuarios del sistema
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'operador',
    foto_perfil TEXT,
    disponible BOOLEAN DEFAULT true,
    ultima_ubicacion JSONB,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alertas de emergencia
CREATE TABLE alertas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(100),
    prioridad VARCHAR(50) DEFAULT 'media',
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    direccion TEXT,
    estado VARCHAR(50) DEFAULT 'activa',
    usuario_id INTEGER REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Puntos en el mapa
CREATE TABLE puntos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria_id INTEGER REFERENCES categorias(id),
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    direccion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 **WEBSOCKET**

### **Eventos Principales**
```javascript
// Cliente → Servidor
socket.emit('authenticate', { userId, rol });
socket.emit('markNotificationRead', notificationId);

// Servidor → Cliente
socket.on('newAlert', (notification) => { /* Procesar nueva alerta */ });
socket.on('alertDeleted', (notification) => { /* Procesar eliminación */ });
socket.on('notification', (notification) => { /* Notificación general */ });
socket.on('authenticated', (data) => { /* Confirmación de auth */ });
```

### **Configuración WebSocket**
```javascript
// Cliente (websocketClient.js)
this.socket = io({
    timeout: 20000,
    forceNew: true
});

// Servidor (websocketService.js)
io.on('connection', (socket) => {
    socket.on('authenticate', (data) => {
        // Autenticar usuario
    });
});
```

---

## 🎯 **FUNCIONES PRINCIPALES**

### **Gestión del Mapa (mapa.js)**
```javascript
class MapManager {
    init() { /* Inicializar mapa Leaflet */ }
    loadPoints() { /* Cargar puntos desde API */ }
    addMarker(point) { /* Agregar marcador */ }
    removeMarker(markerId) { /* Remover marcador */ }
    centerOnLocation(lat, lng) { /* Centrar mapa */ }
}
```

### **Autenticación (autenticacion.js)**
```javascript
class Auth {
    async login(email, password) { /* Login de usuario */ }
    logout() { /* Cerrar sesión */ }
    updateProfile(data) { /* Actualizar perfil */ }
    isAuthenticated() { /* Verificar autenticación */ }
    isAdmin() { /* Verificar si es admin */ }
}
```

### **Alertas (alertas.js)**
```javascript
class AlertasManager {
    iniciarProcesoEmergencia() { /* Iniciar creación de alerta */ }
    enviarAlerta() { /* Enviar alerta al servidor */ }
    crearMarcadorAlertaActiva(alerta) { /* Crear marcador de alerta */ }
    darDeBajaAlerta(alertaId) { /* Dar de baja alerta */ }
}
```

---

## 🚀 **DEPLOYMENT**

### **Railway Configuration**
```json
// railway.json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "on_failure"
  }
}
```

### **Variables de Entorno**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CLOUDINARY_URL=cloudinary://...
PORT=3000
NODE_ENV=production
```

---

## 📊 **ESTADÍSTICAS**

- **Total de archivos:** 25+ archivos principales
- **Líneas de código:** ~8,000 líneas
- **APIs:** 8 controladores principales
- **Rutas:** 8 archivos de rutas
- **Base de datos:** 6 tablas principales
- **WebSocket:** 4 eventos principales

---

*Referencia del código del Sistema de Mapeo de Emergencias*
*Versión: 2.1.0 - Actualizada con optimizaciones de notificaciones*


