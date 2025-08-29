# 🚒 Mapa de Emergencias - Catamarca

Sistema integral de mapeo de emergencias para bomberos de Catamarca, Argentina. Permite la gestión de puntos de interés, geolocalización de operadores en tiempo real, coordinación de emergencias y notificaciones instantáneas.

## 🌟 Características Principales

### 🔐 Autenticación y Gestión de Usuarios
- **Sistema de login/logout** con JWT
- **Roles diferenciados**: Administrador y Operador
- **Persistencia de sesión** con "Mantener sesión"
- **Gestión de perfiles** con foto y datos personales
- **Panel de gestión de usuarios** para administradores
- **Creación, edición y eliminación** de usuarios
- **Filtros por rol y estado** de disponibilidad

### 🗺️ Mapa Interactivo
- **Mapa base** centrado en Catamarca
- **Marcadores dinámicos** para puntos de interés
- **Filtros por categorías** (Bomberos, Hospitales, Policía, etc.)
- **Información detallada** en popups
- **Geolocalización** de operadores en tiempo real
- **Alertas de emergencia** con marcadores especiales

### 👥 Gestión de Operadores
- **Panel de disponibilidad** para operadores
- **Geolocalización automática** cada 30 segundos
- **Lista de operadores** con estado en tiempo real
- **Perfiles completos** con foto e información personal
- **Modos "Ver Info" y "Editar Info"** para perfiles
- **Subida de fotos de perfil** con persistencia

### 🚨 Sistema de Alertas y Notificaciones
- **Creación de emergencias** desde el mapa (solo administradores)
- **Formulario completo** con ubicación, descripción y prioridad
- **Notificaciones en tiempo real** via WebSocket
- **Alertas push del navegador** para operadores
- **Notificaciones emergentes** en la aplicación
- **Sincronización automática** de alertas en el mapa
- **Eliminación en tiempo real** cuando se da de baja una alerta
- **Panel de notificaciones** con historial

### 📸 Gestión de Fotos
- **Subida de fotos** para puntos de interés
- **Fotos de perfil** para operadores
- **Visualización en galerías**
- **Almacenamiento en Base64** con persistencia
- **Validación de archivos** y tamaños

### 🔄 Actualizaciones en Tiempo Real
- **WebSocket** para comunicación bidireccional
- **Notificaciones instantáneas** de nuevas alertas
- **Sincronización de mapas** entre usuarios
- **Actualización automática** de estado de operadores
- **Manejo de errores** y reconexión automática

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** con Express
- **PostgreSQL** como base de datos principal
- **JWT** para autenticación
- **bcrypt** para encriptación de contraseñas
- **Multer** para manejo de archivos
- **Socket.IO** para comunicación en tiempo real

### Frontend
- **HTML5** y **CSS3** con diseño responsive
- **JavaScript ES6+** modular
- **Leaflet.js** para mapas interactivos
- **Font Awesome** para iconografía
- **Socket.IO Client** para WebSocket
- **Notifications API** para alertas del navegador

### Infraestructura
- **Railway** para hosting y despliegue automático
- **Git** para control de versiones
- **GitHub** para repositorio remoto

## 📁 Estructura del Proyecto

```
bombero/
├── public/
│   ├── css/
│   │   └── estilos.css          # Estilos principales
│   ├── js/
│   │   ├── app.js              # Aplicación principal
│   │   ├── autenticacion.js    # Gestión de usuarios
│   │   ├── mapa.js             # Funcionalidad del mapa
│   │   ├── alertas.js          # Sistema de emergencias
│   │   ├── fotos.js            # Gestión de imágenes
│   │   ├── usuarios.js         # Panel de administración
│   │   ├── utilidades.js       # Funciones auxiliares
│   │   ├── geolocalizacion.js  # Geolocalización
│   │   └── websocketClient.js  # Cliente WebSocket
│   └── index.html              # Página principal
├── src/
│   ├── configuracion/
│   │   └── servidor.js         # Configuración del servidor
│   ├── controladores/
│   │   ├── autenticacionController.js
│   │   ├── usuariosController.js
│   │   ├── puntosController.js
│   │   ├── categoriasController.js
│   │   ├── alertasController.js
│   │   └── fotosController.js
│   ├── modelos/
│   │   ├── baseDeDatosPostgres.js
│   │   ├── actualizarPerfilOperadores.js
│   │   ├── actualizarGeolocalizacion.js
│   │   ├── actualizarCampoFoto.js
│   │   ├── actualizarCampoEmail.js
│   │   └── corregirEstructuraUsuarios.js
│   ├── rutas/
│   │   ├── autenticacion.js
│   │   ├── usuarios.js
│   │   ├── puntos.js
│   │   ├── categorias.js
│   │   ├── alertas.js
│   │   └── fotos.js
│   ├── servicios/
│   │   └── websocketService.js  # Servidor WebSocket
│   └── middleware/
│       └── autenticacion.js
├── package.json
└── README.md
```

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js (versión 16 o superior)
- PostgreSQL
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Fedecaff/mapa-emergencias.git
   cd mapa-emergencias
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear archivo `.env` con:
   ```
   DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/mapa_emergencias
   JWT_SECRET=tu_clave_secreta_aqui
   PORT=3000
   ```

4. **Inicializar la base de datos**
   ```bash
   npm run init-db
   ```

5. **Crear usuario administrador**
   ```bash
   npm run create-admin
   ```

6. **Iniciar el servidor**
   ```bash
   npm start
   ```

## 📊 Base de Datos

### Tablas Principales

#### `usuarios`
- `id`: Identificador único
- `email`: Email del usuario
- `password`: Contraseña encriptada
- `nombre`: Nombre completo
- `rol`: 'administrador' o 'operador'
- `foto_perfil`: Foto de perfil (Base64)
- `institucion`: Institución del operador
- `rol_institucion`: Rol dentro de la institución
- `telefono`: Número de teléfono
- `disponible`: Estado de disponibilidad
- `fecha_creacion`: Fecha de registro

#### `puntos`
- `id`: Identificador único
- `nombre`: Nombre del punto
- `descripcion`: Descripción detallada
- `latitud`: Coordenada latitud
- `longitud`: Coordenada longitud
- `categoria_id`: ID de la categoría
- `fecha_creacion`: Fecha de creación

#### `categorias`
- `id`: Identificador único
- `nombre`: Nombre de la categoría
- `color`: Color del marcador
- `icono`: Icono de Font Awesome

#### `alertas`
- `id`: Identificador único
- `titulo`: Título de la emergencia
- `descripcion`: Descripción detallada
- `latitud`: Coordenada latitud
- `longitud`: Coordenada longitud
- `estado`: Estado de la alerta
- `tipo`: Tipo de emergencia
- `prioridad`: Prioridad de la alerta
- `direccion`: Dirección de la emergencia
- `personas_afectadas`: Número de personas afectadas
- `riesgos_especificos`: Riesgos específicos
- `concurrencia_solicitada`: Unidades solicitadas
- `usuario_id`: ID del usuario que creó la alerta
- `fecha_creacion`: Fecha de creación

#### `geolocalizacion`
- `id`: Identificador único
- `usuario_id`: ID del usuario
- `latitud`: Coordenada latitud
- `longitud`: Coordenada longitud
- `fecha_actualizacion`: Fecha de actualización

## 🔧 Funcionalidades Detalladas

### Panel de Operadores
- **Visualización en tiempo real** de todos los operadores
- **Filtrado por disponibilidad** (disponibles primero)
- **Información completa**: nombre, institución, rol, foto
- **Estado de disponibilidad** con indicadores visuales
- **Geolocalización** actualizada automáticamente

### Gestión de Perfiles
- **Subida de fotos de perfil** con validación
- **Edición de datos personales**: nombre, institución, rol, teléfono
- **Modos de visualización**: "Ver Info" (solo lectura) y "Editar Info"
- **Persistencia de datos** después de reinicios del servidor
- **Validación de campos** en frontend y backend
- **Interfaz intuitiva** con botones de cambio de modo

### Sistema de Mapas
- **Centrado automático** en Catamarca
- **Zoom adaptativo** según el contenido
- **Marcadores categorizados** con colores e iconos
- **Popups informativos** con detalles completos
- **Integración con geolocalización** de operadores
- **Marcadores de emergencia** con iconos especiales

### Alertas de Emergencia
- **Creación desde el mapa** con clic derecho (solo administradores)
- **Formulario completo** con validaciones
- **Tipos de emergencia**: Incendio estructural, forestal, accidente vehicular, rescate, fuga de gas, otros
- **Niveles de prioridad**: Alta, Media, Baja
- **Sistema de concurrencia** para múltiples unidades
- **Gestión de estado** (activa/inactiva)
- **Eliminación con confirmación** (solo administradores)

### Sistema de Notificaciones
- **Notificaciones en tiempo real** via WebSocket
- **Alertas push del navegador** para operadores
- **Notificaciones emergentes** en la aplicación
- **Panel de notificaciones** con historial
- **Marcar como leída** individual y masiva
- **Sonido de alerta** para nuevas emergencias
- **Sincronización automática** con el mapa

### Gestión de Usuarios (Administradores)
- **Panel de gestión** con lista de usuarios
- **Filtros por rol** (administrador/operador)
- **Filtros por estado** (disponible/no disponible)
- **Creación de usuarios** con validación
- **Edición de datos** de usuarios existentes
- **Eliminación de usuarios** con confirmación
- **Protección contra eliminación** del último administrador

## 🔄 API Endpoints

### Autenticación
- `POST /api/autenticacion/login` - Iniciar sesión
- `POST /api/autenticacion/registro` - Registrar usuario (admin)
- `GET /api/autenticacion/verificar` - Verificar token

### Usuarios
- `GET /api/usuarios` - Listar usuarios (admin)
- `POST /api/usuarios` - Crear usuario (admin)
- `PUT /api/usuarios/:id/perfil` - Actualizar perfil
- `POST /api/usuarios/:id/foto` - Subir foto de perfil
- `PUT /api/usuarios/:id/disponibilidad` - Actualizar disponibilidad
- `POST /api/usuarios/:id/geolocalizacion` - Actualizar ubicación
- `DELETE /api/usuarios/:id` - Eliminar usuario (admin)

### Puntos y Categorías
- `GET /api/puntos` - Listar puntos
- `POST /api/puntos` - Crear punto (admin)
- `GET /api/categorias` - Listar categorías
- `POST /api/categorias` - Crear categoría (admin)

### Alertas
- `GET /api/alertas/listar` - Listar alertas
- `POST /api/alertas/crear` - Crear alerta
- `PUT /api/alertas/:id` - Actualizar alerta
- `DELETE /api/alertas/:id` - Eliminar alerta

### Fotos
- `GET /api/fotos/punto/:puntoId` - Fotos de un punto
- `POST /api/fotos/punto/:puntoId` - Subir foto a punto

### WebSocket Events
- `authenticate` - Autenticación de usuario
- `newAlert` - Nueva alerta creada
- `alertDeleted` - Alerta eliminada
- `notification` - Notificación general

## 🚀 Despliegue en Railway

El proyecto está configurado para despliegue automático en Railway:

1. **Conexión con GitHub**: El repositorio está conectado a Railway
2. **Despliegue automático**: Cada push a `main` despliega automáticamente
3. **Variables de entorno**: Configuradas en Railway dashboard
4. **Base de datos**: PostgreSQL provisto por Railway

### Variables de Entorno en Railway
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `JWT_SECRET`: Clave secreta para JWT
- `PORT`: Puerto del servidor (configurado automáticamente)

## 🔒 Seguridad

- **Autenticación JWT** con expiración configurable
- **Encriptación de contraseñas** con bcrypt
- **Validación de roles** en endpoints sensibles
- **Sanitización de datos** en formularios
- **Validación de archivos** en subidas
- **Protección CSRF** en formularios
- **Validación de tipos** en WebSocket

## 📱 Responsive Design

El sistema está optimizado para:
- **Desktop**: Pantallas grandes con todas las funcionalidades
- **Tablet**: Adaptación de paneles y controles
- **Mobile**: Navegación simplificada y controles táctiles

## 🎯 Funcionalidades Implementadas

### ✅ Fase 1: Base del Sistema
- [x] Autenticación y autorización
- [x] Gestión de usuarios y roles
- [x] Mapa base con Leaflet.js
- [x] Geolocalización de operadores

### ✅ Fase 2: Gestión de Puntos
- [x] CRUD de puntos de interés
- [x] Categorización de puntos
- [x] Subida y gestión de fotos
- [x] Filtros por categorías

### ✅ Fase 3: Sistema de Alertas
- [x] Creación de emergencias
- [x] Formularios completos
- [x] Gestión de estado de alertas
- [x] Marcadores especiales en mapa

### ✅ Fase 4: Perfiles y Gestión
- [x] Perfiles de usuario completos
- [x] Subida de fotos de perfil
- [x] Edición de datos personales
- [x] Modos de visualización

### ✅ Fase 5: Notificaciones en Tiempo Real
- [x] Sistema WebSocket completo
- [x] Notificaciones push del navegador
- [x] Panel de notificaciones
- [x] Sincronización automática de mapas
- [x] Gestión de usuarios para administradores

## 🎯 Próximas Funcionalidades

### Fase 6: Filtros y Búsqueda
- [ ] Filtros por institución y rol
- [ ] Búsqueda de operadores
- [ ] Estadísticas de disponibilidad

### Fase 7: Comunicación
- [ ] Chat interno entre operadores
- [ ] Historial de ubicaciones
- [ ] Reportes de actividad

### Fase 8: Optimización
- [ ] Optimización de rendimiento del mapa
- [ ] Cache de datos de operadores
- [ ] Compresión de respuestas API
- [ ] Carga lazy de marcadores

## 👥 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Federico Caffettaro**
- Email: fedecaff@gmail.com
- GitHub: [@Fedecaff](https://github.com/Fedecaff)

## 🙏 Agradecimientos

- **Bomberos de Catamarca** por su colaboración
- **Railway** por el hosting gratuito
- **Leaflet.js** por la librería de mapas
- **Font Awesome** por los iconos
- **Socket.IO** por la comunicación en tiempo real

---

**Versión**: 2.0.0  
**Última actualización**: Enero 2025  
**Estado**: Sistema completo y funcional

### 🚨 Notas de la Versión 2.0.0

**Nuevas Funcionalidades:**
- ✅ Sistema de notificaciones en tiempo real
- ✅ Gestión completa de usuarios para administradores
- ✅ Sincronización automática de alertas en mapas
- ✅ Panel de notificaciones con historial
- ✅ Corrección de problemas de persistencia de datos
- ✅ Mejoras en la interfaz de usuario

**Correcciones:**
- ✅ Problema de doble ventana en subida de fotos
- ✅ Visualización de fotos de perfil
- ✅ Persistencia de datos después de reinicios
- ✅ Sincronización de eliminación de alertas
- ✅ Validación de tipos en WebSocket
