# 🗺️ Mapa de Emergencias - Catamarca

Sistema completo de gestión de emergencias para bomberos de Catamarca, Argentina. Plataforma web interactiva para mapeo, alertas y coordinación de servicios de emergencia.

## 🎯 Características Principales

### 🗺️ **Sistema de Mapeo**
- **Mapa Interactivo** con OpenStreetMap y Leaflet.js
- **Puntos de Emergencia** categorizados (hidrantes, comisarías, hospitales, etc.)
- **Marcado Directo** en el mapa para administradores
- **Búsqueda y Filtros** avanzados
- **Geolocalización** automática del usuario

### 🚨 **Sistema de Alertas de Emergencia**
- **Creación de Alertas** por administradores
- **Tipos de Emergencia:** Incendio estructural, forestal, accidente vehicular, rescate, fuga de gas
- **Niveles de Prioridad:** Baja, Media, Alta
- **Concurrencia Solicitada:** Número específico o "Todos los disponibles"
- **Persistencia de Alertas** hasta dar de baja
- **Sonido de Sirena** para notificaciones

### 👥 **Gestión de Usuarios**
- **Sistema de Roles:** Administrador y Operador
- **Autenticación JWT** segura
- **Panel de Disponibilidad** para operadores
- **Gestión de Usuarios** por administradores
- **Teléfonos de Contacto** para notificaciones

### 📸 **Sistema de Fotos**
- **Carga de Fotos** para puntos de emergencia
- **Almacenamiento en Cloudinary** (nube)
- **Visualización** en galerías
- **Gestión** por administradores

## 🏗️ Arquitectura del Sistema

```
mapa-emergencias/
├── src/
│   ├── configuracion/
│   │   └── servidor.js                 # Configuración principal del servidor
│   ├── controladores/
│   │   ├── autenticacionController.js  # Gestión de usuarios y sesiones
│   │   ├── puntosController.js         # CRUD de puntos en el mapa
│   │   ├── categoriasController.js     # Gestión de categorías
│   │   ├── fotosController.js          # Gestión de fotos con Cloudinary
│   │   ├── alertasController.js        # Sistema de alertas de emergencia
│   │   └── usuariosController.js       # Gestión de usuarios y disponibilidad
│   ├── modelos/
│   │   ├── baseDeDatosPostgres.js      # Conexión PostgreSQL
│   │   ├── actualizarTablaFotos.js     # Scripts de migración
│   │   ├── actualizarUsuarios.js       # Actualización de usuarios
│   │   ├── actualizarTablaAlertas.js   # Migración de alertas
│   │   ├── actualizarRoles.js          # Actualización de roles
│   │   └── verificarRoles.js           # Diagnóstico de roles
│   ├── rutas/
│   │   ├── autenticacion.js            # Rutas de login/logout
│   │   ├── puntos.js                   # API de puntos
│   │   ├── categorias.js               # API de categorías
│   │   ├── fotos.js                    # API de fotos
│   │   ├── alertas.js                  # API de alertas
│   │   └── usuarios.js                 # API de usuarios
│   └── middleware/
│       └── autenticacion.js            # JWT y control de acceso
├── public/
│   ├── css/
│   │   └── estilos.css                 # Estilos completos del sistema
│   ├── js/
│   │   ├── app.js                      # Inicialización principal
│   │   ├── mapa.js                     # Gestión del mapa interactivo
│   │   ├── autenticacion.js            # Sistema de autenticación
│   │   ├── fotos.js                    # Gestión de fotos frontend
│   │   ├── alertas.js                  # Sistema de alertas frontend
│   │   ├── usuarios.js                 # Gestión de usuarios frontend
│   │   └── utilidades.js               # Funciones auxiliares
│   └── index.html                      # Interfaz principal
└── package.json
```

## 🚀 Instalación y Despliegue

### **Requisitos Previos**
- Node.js 18+
- PostgreSQL (base de datos)
- Cuenta en Cloudinary (fotos)
- Cuenta en Railway (hosting)

### **Configuración Local**
1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Fedecaff/mapa-emergencias.git
   cd mapa-emergencias
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```env
   DATABASE_URL=postgresql://usuario:password@localhost:5432/mapa_emergencias
   JWT_SECRET=tu_jwt_secret_super_seguro
   CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
   PORT=3000
   ```

4. **Inicializar base de datos:**
   ```bash
   npm start
   ```

5. **Acceder a la aplicación:**
   ```
   http://localhost:3000
   ```

## 👤 Sistema de Usuarios

### **Roles Implementados:**
- **🔧 Administrador:** Control total del sistema
- **👷 Operador:** Gestión de disponibilidad y visualización

### **Credenciales por Defecto:**
- **Email:** `federico.gomez.sc@gmail.com`
- **Contraseña:** `admin123`
- **Rol:** Administrador

## 🛠️ Tecnologías Implementadas

### **Backend:**
- **Node.js** + **Express.js** - Servidor web
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación segura
- **bcrypt** - Encriptación de contraseñas
- **Multer** - Manejo de archivos
- **Cloudinary** - Almacenamiento de imágenes

### **Frontend:**
- **HTML5** + **CSS3** - Interfaz de usuario
- **JavaScript ES6+** - Lógica del cliente
- **Leaflet.js** - Mapas interactivos
- **Font Awesome** - Iconografía
- **Responsive Design** - Adaptable a dispositivos

### **Infraestructura:**
- **Railway** - Hosting y base de datos
- **Cloudinary** - CDN para imágenes
- **GitHub** - Control de versiones

## 📋 Funcionalidades por Rol

### 👷 **Operador**
- ✅ Visualizar puntos en el mapa
- ✅ Filtrar por categorías
- ✅ Buscar ubicaciones
- ✅ Ver detalles de puntos
- ✅ Geolocalización automática
- ✅ **Panel de Disponibilidad** (disponible/no disponible)
- ✅ Visualizar alertas activas
- ✅ Ver fotos de puntos

### 🔧 **Administrador**
- ✅ Todas las funciones de operador
- ✅ **Crear Alertas de Emergencia** con prioridades
- ✅ **Solicitar Concurrencia** (número específico o "todos")
- ✅ Agregar puntos haciendo clic en el mapa
- ✅ Editar información de puntos
- ✅ Gestionar categorías
- ✅ **Sistema de Fotos** completo
- ✅ **Gestión de Usuarios** (crear, editar, eliminar)
- ✅ **Dar de Baja Alertas** de emergencia
- ✅ Ver historial de cambios

## 🚨 Sistema de Alertas de Emergencia

### **Tipos de Emergencia:**
- 🔥 **Incendio Estructural** - Edificios y construcciones
- 🌲 **Incendio Forestal** - Zonas rurales y bosques
- 🚗 **Accidente Vehicular** - Colisiones y rescates
- 🆘 **Rescate** - Personas en peligro
- ⛽ **Fuga de Gas** - Emergencias químicas
- ⚠️ **Otro** - Emergencias diversas

### **Niveles de Prioridad:**
- 🟢 **Baja** - Situaciones controladas
- 🟡 **Media** - Requiere atención moderada
- 🔴 **Alta** - Emergencia crítica

### **Flujo de Alerta:**
1. **Administrador** crea alerta seleccionando ubicación
2. **Sistema** valida datos y crea marcador
3. **Alerta** se muestra en mapa con información completa
4. **Sonido de sirena** notifica a usuarios
5. **Alerta persiste** hasta que administrador la da de baja

## 📸 Sistema de Gestión de Fotos

### **Características:**
- ✅ **Carga múltiple** de fotos por punto
- ✅ **Almacenamiento en la nube** (Cloudinary)
- ✅ **Visualización en galerías** modales
- ✅ **Eliminación segura** con respaldo
- ✅ **Optimización automática** de imágenes
- ✅ **Acceso controlado** por roles

## 🔒 Seguridad Implementada

- ✅ **Autenticación JWT** con tokens seguros
- ✅ **Encriptación bcrypt** para contraseñas
- ✅ **Middleware de autorización** por roles
- ✅ **Validación de datos** en frontend y backend
- ✅ **Headers de seguridad** con Helmet
- ✅ **CORS configurado** para producción
- ✅ **Sanitización** de entradas de usuario

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 📱 **Dispositivos móviles** (Android/iOS)
- 📱 **Tablets** (iPad, Android)
- 💻 **Laptops** y computadoras
- 🖥️ **Monitores grandes**

## 🚀 Estado Actual del Proyecto

### **✅ Funcionalidades Completadas:**
- Sistema de autenticación completo
- Gestión de puntos en mapa
- Sistema de alertas de emergencia
- Panel de disponibilidad para operadores
- Sistema de fotos con Cloudinary
- Gestión de usuarios por roles
- Persistencia de datos en PostgreSQL
- Interfaz responsive completa
- Despliegue en Railway

### **🔄 En Desarrollo:**
- Sistema de notificaciones por SMS/WhatsApp
- Aplicación móvil nativa
- Dashboard de estadísticas
- Integración con sistemas externos

### **📋 Próximas Mejoras:**
- Notificaciones push en tiempo real
- Geolocalización avanzada
- Reportes y analytics
- Integración con sistemas de emergencia oficiales

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Federico Caffettaro** - Desarrollador del Sistema de Mapeo de Emergencias

**Contacto:** federico.gomez.sc@gmail.com

---

*Desarrollado para mejorar la gestión y coordinación de servicios de emergencia en Catamarca, Argentina*

**Versión:** 1.0.0  
**Última actualización:** Enero 2024
