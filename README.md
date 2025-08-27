# 🚒 Mapa de Emergencias - Catamarca

Sistema integral de mapeo de emergencias para bomberos de Catamarca, Argentina. Permite la gestión de puntos de interés, geolocalización de operadores en tiempo real, y coordinación de emergencias.

## 🌟 Características Principales

### 🔐 Autenticación y Gestión de Usuarios
- **Sistema de login/logout** con JWT
- **Roles diferenciados**: Administrador y Operador
- **Persistencia de sesión** con "Mantener sesión"
- **Gestión de perfiles** con foto y datos personales

### 🗺️ Mapa Interactivo
- **Mapa base** centrado en Catamarca
- **Marcadores dinámicos** para puntos de interés
- **Filtros por categorías** (Bomberos, Hospitales, Policía, etc.)
- **Información detallada** en popups
- **Geolocalización** de operadores en tiempo real

### 👥 Gestión de Operadores
- **Panel de disponibilidad** para operadores
- **Geolocalización automática** cada 30 segundos
- **Lista de operadores** con estado en tiempo real
- **Perfiles completos** con foto e información personal
- **Modos "Ver Info" y "Editar Info"** para perfiles

### 🚨 Sistema de Alertas
- **Creación de emergencias** desde el mapa
- **Formulario completo** con ubicación, descripción y fotos
- **Gestión de alertas activas**
- **Sistema de concurrencia** para múltiples unidades

### 📸 Gestión de Fotos
- **Subida de fotos** para puntos de interés
- **Fotos de perfil** para operadores
- **Visualización en galerías**
- **Almacenamiento temporal** en Base64

### 🔄 Actualizaciones en Tiempo Real
- **Polling automático** cada 5 segundos
- **Manejo de errores** y reintentos
- **Detección de cambios** para optimizar actualizaciones
- **Sincronización** de estado de operadores

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** con Express
- **PostgreSQL** como base de datos principal
- **JWT** para autenticación
- **bcrypt** para encriptación de contraseñas
- **Multer** para manejo de archivos

### Frontend
- **HTML5** y **CSS3** con diseño responsive
- **JavaScript ES6+** modular
- **Leaflet.js** para mapas interactivos
- **Font Awesome** para iconografía

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
│   │   └── geolocalizacion.js  # Geolocalización
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
│   │   └── actualizarCampoFoto.js
│   ├── rutas/
│   │   ├── autenticacion.js
│   │   ├── usuarios.js
│   │   ├── puntos.js
│   │   ├── categorias.js
│   │   ├── alertas.js
│   │   └── fotos.js
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
- `contraseña`: Contraseña encriptada
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
- `concurrencia_solicitada`: Unidades solicitadas
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

### Sistema de Mapas
- **Centrado automático** en Catamarca
- **Zoom adaptativo** según el contenido
- **Marcadores categorizados** con colores e iconos
- **Popups informativos** con detalles completos
- **Integración con geolocalización** de operadores

### Alertas de Emergencia
- **Creación desde el mapa** con clic derecho
- **Formulario completo** con validaciones
- **Subida de fotos** para documentar la emergencia
- **Sistema de concurrencia** para múltiples unidades
- **Gestión de estado** (activa/inactiva)

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

### Puntos y Categorías
- `GET /api/puntos` - Listar puntos
- `POST /api/puntos` - Crear punto (admin)
- `GET /api/categorias` - Listar categorías
- `POST /api/categorias` - Crear categoría (admin)

### Alertas
- `GET /api/alertas` - Listar alertas
- `POST /api/alertas` - Crear alerta
- `PUT /api/alertas/:id` - Actualizar alerta
- `DELETE /api/alertas/:id` - Eliminar alerta

### Fotos
- `GET /api/fotos/punto/:puntoId` - Fotos de un punto
- `POST /api/fotos/punto/:puntoId` - Subir foto a punto

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

## 📱 Responsive Design

El sistema está optimizado para:
- **Desktop**: Pantallas grandes con todas las funcionalidades
- **Tablet**: Adaptación de paneles y controles
- **Mobile**: Navegación simplificada y controles táctiles

## 🎯 Próximas Funcionalidades

### Fase 6: Filtros y Búsqueda
- [ ] Filtros por institución y rol
- [ ] Búsqueda de operadores
- [ ] Estadísticas de disponibilidad

### Fase 7: Comunicación
- [ ] Notificaciones de emergencia
- [ ] Chat interno entre operadores
- [ ] Historial de ubicaciones

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

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025  
**Estado**: En desarrollo activo
