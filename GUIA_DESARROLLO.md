
# GUÍA DE DESARROLLO
## Sistema de Mapeo de Emergencias - Catamarca

---

## 🚀 **CÓMO AGREGAR NUEVAS FUNCIONALIDADES**

### **Paso 1: Identificar el Tipo de Funcionalidad**

#### **🗺️ Funcionalidades del Mapa**
- **Archivo principal:** `public/js/mapa.js` (1361 líneas)
- **APIs:** `src/controladores/puntosController.js` (332 líneas)
- **Rutas:** `src/rutas/puntos.js` (14 líneas)
- **Ejemplos:** Marcadores, capas, controles

#### **🔐 Funcionalidades de Autenticación**
- **Frontend:** `public/js/autenticacion.js` (1028 líneas)
- **Backend:** `src/controladores/autenticacionController.js` (175 líneas)
- **Rutas:** `src/rutas/autenticacion.js` (12 líneas)
- **Ejemplos:** Login, registro, perfil

#### **🚨 Funcionalidades de Alertas**
- **Frontend:** `public/js/alertas.js` (588 líneas)
- **Backend:** `src/controladores/alertasController.js` (236 líneas)
- **WebSocket:** `src/servicios/websocketService.js`
- **Ejemplos:** Crear alertas, notificaciones en tiempo real

#### **👥 Funcionalidades de Usuarios**
- **Frontend:** `public/js/usuarios.js` (332 líneas) + `administracion.js` (554 líneas)
- **Backend:** `src/controladores/usuariosController.js`
- **Rutas:** `src/rutas/usuarios.js` (75 líneas)
- **Ejemplos:** CRUD usuarios, gestión de roles

---

## 📝 **PATRÓN PARA AGREGAR NUEVAS FUNCIONALIDADES**

### **1. Backend (API)**
```javascript
// 1. Crear controlador (src/controladores/nuevoController.js)
export const nuevaFuncionalidad = async (req, res) => {
    try {
        // Lógica de la funcionalidad
        res.json({ success: true, data: resultado });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Crear ruta (src/rutas/nuevo.js)
import express from 'express';
import { nuevaFuncionalidad } from '../controladores/nuevoController.js';

const router = express.Router();
router.post('/nueva-funcionalidad', nuevaFuncionalidad);
export default router;

// 3. Registrar en servidor.js
import rutasNuevo from '../rutas/nuevo.js';
app.use('/api/nuevo', rutasNuevo);
```

### **2. Frontend (JavaScript)**
```javascript
// 1. Agregar función en archivo JS correspondiente
const nuevaFuncionalidad = async (datos) => {
    try {
        const response = await API.post('/api/nuevo/nueva-funcionalidad', datos);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// 2. Agregar event listener
document.getElementById('btnNuevo').addEventListener('click', async () => {
    try {
        const resultado = await nuevaFuncionalidad(datos);
        // Manejar resultado
    } catch (error) {
        // Manejar error
    }
});
```

### **3. HTML (Interfaz)**
```html
<!-- Agregar elementos en index.html -->
<button id="btnNuevo" class="btn btn-primary">
    Nueva Funcionalidad
</button>
```

### **4. CSS (Estilos)**
```css
/* Agregar en public/css/estilos.css */
#btnNuevo {
    /* Estilos específicos */
}
```

---

## 🔔 **SISTEMA DE NOTIFICACIONES**

### **Configuración de Duración**
```javascript
// Duración automática basada en tipo
Notifications.info('Mensaje informativo');     // 2 segundos
Notifications.success('Operación exitosa');    // 3 segundos
Notifications.warning('Advertencia');          // 4 segundos
Notifications.error('Error');                  // 5 segundos

// Duración personalizada
Notifications.info('Mensaje', 5000);           // 5 segundos específicos
```

### **Notificaciones de Alertas (WebSocket)**
```javascript
// Duración específica para alertas
- Alertas de emergencia: 10 segundos
- Notificaciones de eliminación: 3 segundos
- Otras notificaciones: 5 segundos
```

---

## 🔧 **CONVENCIONES DE CÓDIGO**

### **Nomenclatura**
- **Archivos:** `camelCase.js` (ej: `miFuncionalidad.js`)
- **Funciones:** `camelCase` (ej: `obtenerDatos()`)
- **Variables:** `camelCase` (ej: `miVariable`)
- **Constantes:** `UPPER_SNAKE_CASE` (ej: `API_BASE_URL`)
- **Clases:** `PascalCase` (ej: `MiClase`)

### **Estructura de Archivos**
```
src/
├── controladores/
│   └── miFuncionalidadController.js
├── rutas/
│   └── miFuncionalidad.js
└── modelos/
    └── miFuncionalidad.js

public/js/
└── miFuncionalidad.js
```

### **Comentarios**
```javascript
/**
 * Descripción de la función
 * @param {string} parametro - Descripción del parámetro
 * @returns {Object} Descripción del retorno
 */
function miFuncion(parametro) {
    // Comentario de línea
    return resultado;
}
```

---

## 🗺️ **EJEMPLO PRÁCTICO: Agregar Botón "Indicaciones"**

### **1. Frontend - HTML**
```html
<!-- En index.html, debajo del buscador -->
<button id="btnIndicaciones" class="btn btn-info" style="display: none;">
    <i class="fas fa-route"></i> Indicaciones
</button>
```

### **2. Frontend - CSS**
```css
/* En public/css/estilos.css */
#btnIndicaciones {
    margin-top: 10px;
    width: 100%;
}

.panel-indicaciones {
    position: fixed;
    right: 0;
    top: 0;
    width: 300px;
    height: 100%;
    background: white;
    box-shadow: -2px 0 5px rgba(0,0,0,0.1);
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.panel-indicaciones.activo {
    transform: translateX(0);
}
```

### **3. Frontend - JavaScript**
```javascript
// En public/js/mapa.js
class IndicacionesManager {
    constructor() {
        this.btnIndicaciones = document.getElementById('btnIndicaciones');
        this.panelIndicaciones = document.getElementById('panelIndicaciones');
        this.inicializar();
    }

    inicializar() {
        this.btnIndicaciones.addEventListener('click', () => {
            this.mostrarIndicaciones();
        });
    }

    mostrarIndicaciones() {
        // Lógica para mostrar indicaciones
        this.panelIndicaciones.classList.add('activo');
    }

    ocultarIndicaciones() {
        this.panelIndicaciones.classList.remove('activo');
    }
}

// Inicializar cuando el mapa esté listo
window.indicacionesManager = new IndicacionesManager();
```

### **4. Backend - API (si es necesario)**
```javascript
// En src/controladores/indicacionesController.js
export const calcularRuta = async (req, res) => {
    try {
        const { origen, destino } = req.body;
        // Lógica para calcular ruta
        const ruta = await calcularRutaService(origen, destino);
        res.json({ success: true, ruta });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

---

## 🔄 **PATRÓN PARA WEBSOCKET**

### **Backend**
```javascript
// En src/servicios/websocketService.js
io.on('connection', (socket) => {
    socket.on('nuevoEvento', (data) => {
        // Procesar evento
        io.emit('eventoProcesado', resultado);
    });
});
```

### **Frontend**
```javascript
// En public/js/websocketClient.js
socket.on('eventoProcesado', (data) => {
    // Manejar evento recibido
    console.log('Evento recibido:', data);
});
```

---

## 🗄️ **BASE DE DATOS**

### **Crear Nueva Tabla**
```sql
-- Script SQL para nueva tabla
CREATE TABLE nueva_tabla (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Modelo en JavaScript**
```javascript
// En src/modelos/nuevaTabla.js
export const crearNuevoRegistro = async (datos) => {
    const query = 'INSERT INTO nueva_tabla (nombre, descripcion) VALUES ($1, $2) RETURNING *';
    const values = [datos.nombre, datos.descripcion];
    const resultado = await pool.query(query, values);
    return resultado.rows[0];
};
```

---

## 🧪 **TESTING Y DEBUGGING**

### **Console.log Estratégico**
```javascript
// Frontend
console.log('🔍 [MiFuncionalidad] Datos recibidos:', datos);

// Backend
console.log('🔍 [MiController] Procesando solicitud:', req.body);
```

### **Manejo de Errores**
```javascript
try {
    // Código que puede fallar
} catch (error) {
    console.error('❌ [MiFuncionalidad] Error:', error);
    // Manejar error apropiadamente
}
```

---

## 📦 **DEPLOYMENT**

### **Verificar Cambios**
```bash
# 1. Probar localmente
npm run dev

# 2. Verificar que no hay errores
# 3. Commit y push
git add .
git commit -m "feat: agregar nueva funcionalidad"
git push origin main
```

### **Railway Deployment**
- Los cambios se despliegan automáticamente
- Verificar logs en Railway Dashboard
- Probar funcionalidad en producción

---

## 🎯 **CHECKLIST PARA NUEVAS FUNCIONALIDADES**

- [ ] **Backend:** Controlador creado
- [ ] **Backend:** Rutas configuradas
- [ ] **Backend:** Registrado en servidor.js
- [ ] **Frontend:** JavaScript implementado
- [ ] **Frontend:** HTML agregado
- [ ] **Frontend:** CSS estilizado
- [ ] **Base de datos:** Tablas creadas (si aplica)
- [ ] **WebSocket:** Eventos configurados (si aplica)
- [ ] **Notificaciones:** Duración apropiada configurada
- [ ] **Testing:** Funcionalidad probada
- [ ] **Documentación:** Actualizada

---

## 🚀 **COMANDOS ÚTILES**

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run init-db          # Inicializar base de datos

# Git
git status               # Ver estado de cambios
git add .                # Agregar todos los cambios
git commit -m "mensaje"  # Commit con mensaje
git push origin main     # Subir a GitHub

# Debugging
console.log()            # Logs en frontend
console.error()          # Logs de error
```

---

## 📋 **ARCHIVOS DE DOCUMENTACIÓN**

- **`README.md`** - Documentación principal del proyecto
- **`GUIA_DESARROLLO.md`** - Esta guía de desarrollo
- **`MAPA_ARQUITECTURA.md`** - Arquitectura del sistema
- **`REFERENCIA_CODIGO.md`** - Referencia detallada del código
- **`VENTAJAS_APP_MOVIL.md`** - Ventajas de la aplicación móvil

---

*Guía de desarrollo para el Sistema de Mapeo de Emergencias*
*Versión: 2.2.0 - Actualizada con información correcta de líneas de código*


