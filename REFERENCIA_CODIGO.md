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
  "cloudinary": "^2.7.0",        // Almacenamiento de imágenes
  "cors": "^2.8.5",              // CORS
  "helmet": "^7.1.0",            // Seguridad
  "proj4": "^2.19.10"            // Proyecciones geográficas
}
```

### **Frontend (CDN)**
- **Leaflet.js** - Mapa interactivo
- **Socket.IO Client** - WebSocket cliente
- **Font Awesome** - Iconos

---

## 🗺️ **FUNCIONALIDADES PRINCIPALES**

### **1. Sistema de Mapa**
- **Archivo:** `public/js/mapa.js` (47KB, 1281 líneas)
- **Tecnología:** Leaflet.js + OpenStreetMap
- **Funciones:** Marcadores, capas, geolocalización

### **2. Autenticación y Usuarios**
- **Archivo:** `public/js/autenticacion.js` (38KB, 1039 líneas)
- **Funciones:** Login, registro, gestión de perfil
- **Backend:** `src/controladores/usuariosController.js`

### **3. Alertas en Tiempo Real**
- **Archivo:** `public/js/alertas.js` (21KB, 545 líneas)
- **WebSocket:** `public/js/websocketClient.js` (16KB, 410 líneas)
- **Backend:** `src/controladores/alertasController.js`

### **4. Administración**
- **Archivo:** `public/js/administracion.js` (19KB, 559 líneas)
- **Funciones:** Gestión de usuarios, estadísticas

### **5. Utilidades y API**
- **Archivo:** `public/js/utilidades.js` (13KB, 434 líneas)
- **Funciones:** Llamadas API, geolocalización, helpers

---

## 🔌 **APIs Y ENDPOINTS**

### **Autenticación**
- `POST /api/autenticacion/login` - Login
- `POST /api/autenticacion/registro` - Registro
- `POST /api/autenticacion/logout` - Logout

### **Usuarios**
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario
- `GET /api/usuarios/perfil` - Obtener perfil
- `PUT /api/usuarios/perfil` - Actualizar perfil

### **Alertas**
- `GET /api/alertas` - Listar alertas
- `POST /api/alertas` - Crear alerta
- `PUT /api/alertas/:id` - Actualizar alerta
- `DELETE /api/alertas/:id` - Eliminar alerta

### **Puntos**
- `GET /api/puntos` - Listar puntos
- `POST /api/puntos` - Crear punto
- `PUT /api/puntos/:id` - Actualizar punto
- `DELETE /api/puntos/:id` - Eliminar punto

### **Fotos**
- `POST /api/fotos` - Subir foto
- `GET /api/fotos/:id` - Obtener foto
- `DELETE /api/fotos/:id` - Eliminar foto

---

## 🗄️ **BASE DE DATOS**

### **Tecnología:** PostgreSQL
### **Tablas Principales:**
- `usuarios` - Usuarios del sistema
- `alertas` - Alertas de emergencia
- `puntos` - Puntos en el mapa
- `categorias` - Categorías de puntos
- `fotos` - Fotos subidas
- `historial` - Historial de actividades

---

## 🔄 **PATRONES DE CÓDIGO**

### **Frontend**
- **Modular:** Cada funcionalidad en archivo separado
- **Event-driven:** Uso extensivo de event listeners
- **API calls:** Centralizadas en `utilidades.js`
- **WebSocket:** Para comunicación en tiempo real

### **Backend**
- **MVC:** Modelo-Vista-Controlador
- **RESTful:** APIs REST estándar
- **Middleware:** Para autenticación y validación
- **Async/Await:** Manejo asíncrono

---

## 🚀 **SCRIPTS DE DESARROLLO**

```bash
npm start          # Iniciar servidor
npm run dev        # Desarrollo con nodemon
npm run init-db    # Inicializar base de datos
npm run migrate    # Ejecutar migraciones
```

---

## 📍 **PUNTOS CLAVE PARA MODIFICACIONES**

### **Para agregar funcionalidades al mapa:**
- **Archivo principal:** `public/js/mapa.js`
- **APIs:** `src/controladores/puntosController.js`
- **Rutas:** `src/rutas/puntos.js`

### **Para modificar autenticación:**
- **Frontend:** `public/js/autenticacion.js`
- **Backend:** `src/controladores/autenticacionController.js`
- **Rutas:** `src/rutas/autenticacion.js`

### **Para agregar alertas/notificaciones:**
- **Frontend:** `public/js/alertas.js` + `websocketClient.js`
- **Backend:** `src/controladores/alertasController.js`
- **WebSocket:** `src/servicios/websocketService.js`

### **Para modificar usuarios:**
- **Frontend:** `public/js/usuarios.js` + `administracion.js`
- **Backend:** `src/controladores/usuariosController.js`
- **Rutas:** `src/rutas/usuarios.js`

---

## 🔧 **CONFIGURACIÓN DE DESARROLLO**

### **Variables de Entorno (.env)**
```env
PUERTO=8080
DATABASE_URL=postgresql://...
JWT_SECRET=...
CLOUDINARY_URL=...
```

### **Deployment**
- **Plataforma:** Railway
- **Base de datos:** PostgreSQL (Railway)
- **Archivos:** Cloudinary

---

*Última actualización: [Fecha actual]*
*Versión del proyecto: 2.0.0*


