# 🗺️ Mapa de Emergencias - Catamarca

Sistema de mapeo interactivo para servicios de emergencia en Catamarca, Argentina.

## 🎯 Características

- **Mapa Interactivo** con OpenStreetMap y Leaflet.js
- **Sistema de Autenticación** con roles (Usuario/Administrador)
- **Gestión de Puntos de Emergencia:**
  - 🚒 **Hidrantes** - Puntos de agua para bomberos
  - 🚔 **Comisarías** - Estaciones de policía
  - 🏫 **Escuelas** - Instituciones educativas
  - 🏥 **Hospitales** - Centros de salud
- **Marcado Directo en Mapa** para administradores
- **Información Detallada** por categoría
- **Búsqueda y Filtros**
- **Geolocalización** del usuario
- **Interfaz Responsive**

## 🏗️ Arquitectura

```
mapa-emergencias/
├── src/
│   ├── configuracion/
│   │   └── servidor.js
│   ├── controladores/
│   │   ├── autenticacionController.js
│   │   ├── puntosController.js
│   │   └── categoriasController.js
│   ├── modelos/
│   │   ├── baseDeDatos.js
│   │   ├── usuarioModel.js
│   │   ├── puntoModel.js
│   │   └── categoriaModel.js
│   ├── rutas/
│   │   ├── autenticacion.js
│   │   ├── puntos.js
│   │   └── categorias.js
│   ├── middleware/
│   │   ├── autenticacion.js
│   │   └── validacion.js
│   └── utilidades/
│       ├── coordenadas.js
│       └── notificaciones.js
├── public/
│   ├── css/
│   │   ├── estilos.css
│   │   └── componentes.css
│   ├── js/
│   │   ├── mapa.js
│   │   ├── autenticacion.js
│   │   ├── administracion.js
│   │   └── utilidades.js
│   └── index.html
├── datos/
│   └── mapa_emergencias.db
└── package.json
```

## 🚀 Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone [url-del-repositorio]
   cd mapa-emergencias
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Inicializar la base de datos:**
   ```bash
   npm run init-db
   ```

4. **Iniciar el servidor:**
   ```bash
   npm start
   ```

5. **Acceder a la aplicación:**
   ```
   http://localhost:3000
   ```

## 👤 Credenciales por Defecto

- **Email:** `federico.gomez.sc@gmail.com`
- **Contraseña:** `admin123`
- **Rol:** Administrador

## 🛠️ Tecnologías

- **Backend:** Node.js, Express.js
- **Base de Datos:** SQLite
- **Autenticación:** JWT, bcrypt
- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Mapas:** Leaflet.js, OpenStreetMap
- **Iconos:** Font Awesome

## 📋 Funcionalidades por Rol

### 👤 Usuario Normal
- Visualizar puntos en el mapa
- Filtrar por categorías
- Buscar ubicaciones
- Ver detalles de puntos
- Geolocalización

### 🔧 Administrador
- Todas las funciones de usuario
- Agregar puntos haciendo clic en el mapa
- Editar información de puntos
- Gestionar categorías
- Ver historial de cambios

## 🔒 Seguridad

- Autenticación JWT
- Encriptación de contraseñas con bcrypt
- Middleware de autorización
- Validación de datos
- Headers de seguridad con Helmet

## 📱 Responsive Design

La aplicación está optimizada para:
- 📱 Dispositivos móviles
- 💻 Tablets
- 🖥️ Computadoras de escritorio

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

**Federico Caffettaro** - Desarrollador del Sistema de Mapeo de Emergencias

---

*Desarrollado para mejorar la gestión de servicios de emergencia en Catamarca*
