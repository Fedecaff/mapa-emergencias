# PROMPT PARA DESARROLLO DE APP MÓVIL
## Sistema de Mapeo de Emergencias - Catamarca

---

## 🎯 **OBJETIVO DEL PROYECTO**

Desarrollar una aplicación móvil nativa que complemente y extienda la funcionalidad del sistema web de mapeo de emergencias para bomberos de Catamarca. La app debe permitir a los operadores y administradores gestionar emergencias desde dispositivos móviles con funcionalidades específicas para trabajo en campo.

---

## 📱 **ESPECIFICACIONES TÉCNICAS**

### **Tecnología Recomendada:**
- **Framework:** React Native con Expo
- **Base de datos:** PostgreSQL (misma del proyecto web)
- **Backend:** Node.js con Express (reutilizar APIs existentes)
- **Autenticación:** JWT tokens
- **Mapas:** React Native Maps + Google Maps API
- **Notificaciones:** Expo Notifications + Push Notifications
- **Geolocalización:** Expo Location
- **Almacenamiento local:** AsyncStorage
- **Estado global:** Redux Toolkit o Zustand

### **Plataformas Objetivo:**
- ✅ Android (prioridad alta)
- ✅ iOS (prioridad media)
- 📱 Mínimo: Android 6.0 (API 23)
- 📱 Mínimo: iOS 12.0

---

## 🏗️ **ARQUITECTURA DE LA APLICACIÓN**

### **Estructura de Carpetas:**
```
src/
├── components/          # Componentes reutilizables
│   ├── Map/            # Componentes de mapas
│   ├── Alerts/         # Componentes de alertas
│   ├── Auth/           # Componentes de autenticación
│   └── UI/             # Componentes de interfaz
├── screens/            # Pantallas principales
│   ├── Auth/           # Login, registro
│   ├── Map/            # Mapa principal
│   ├── Alerts/         # Gestión de alertas
│   ├── Profile/        # Perfil de usuario
│   └── Settings/       # Configuraciones
├── services/           # Servicios de API
│   ├── api.js          # Cliente HTTP
│   ├── auth.js         # Autenticación
│   ├── alerts.js       # Gestión de alertas
│   ├── location.js     # Geolocalización
│   └── notifications.js # Notificaciones push
├── store/              # Estado global
│   ├── slices/         # Slices de Redux
│   └── index.js        # Configuración del store
├── utils/              # Utilidades
│   ├── constants.js    # Constantes
│   ├── helpers.js      # Funciones auxiliares
│   └── permissions.js  # Gestión de permisos
└── assets/             # Recursos estáticos
    ├── images/
    ├── icons/
    └── fonts/
```

---

## 🎨 **DISEÑO DE INTERFAZ (UI/UX)**

### **Paleta de Colores:**
```css
/* Colores principales */
--primary: #e74c3c;        /* Rojo bomberos */
--secondary: #2c3e50;      /* Azul oscuro */
--accent: #f39c12;         /* Naranja emergencia */
--success: #27ae60;        /* Verde éxito */
--warning: #f1c40f;        /* Amarillo advertencia */
--danger: #c0392b;         /* Rojo peligro */
--light: #ecf0f1;         /* Gris claro */
--dark: #2c3e50;          /* Gris oscuro */
--white: #ffffff;
--black: #000000;
```

### **Tipografía:**
- **Familia:** Roboto (Android) / San Francisco (iOS)
- **Tamaños:** 12px, 14px, 16px, 18px, 20px, 24px, 32px
- **Pesos:** Regular (400), Medium (500), Bold (700)

### **Componentes de Diseño:**
- **Botones:** Bordes redondeados, sombras suaves
- **Cards:** Elevación con sombras, bordes redondeados
- **Inputs:** Bordes con estados (focus, error, success)
- **Modales:** Fondo semi-transparente, animaciones suaves
- **Navegación:** Bottom tabs para navegación principal

---

## 📋 **FUNCIONALIDADES PRINCIPALES**

### **1. 🔐 AUTENTICACIÓN Y SEGURIDAD**
```javascript
// Funcionalidades requeridas:
✅ Login con email/password
✅ Autenticación biométrica (huella dactilar)
✅ Persistencia de sesión
✅ Logout seguro
✅ Recuperación de contraseña
✅ Validación de tokens JWT
✅ Roles de usuario (operador/administrador)
```

### **2. 🗺️ MAPA INTERACTIVO**
```javascript
// Funcionalidades del mapa:
✅ Visualización de mapa base (Google Maps)
✅ Marcadores de puntos de interés (hidrantes, hospitales, etc.)
✅ Marcadores de alertas activas
✅ Ubicación actual del usuario
✅ Seguimiento de ubicación en tiempo real
✅ Zoom y navegación táctil
✅ Búsqueda de ubicaciones
✅ Modo offline (mapas descargados)
```

### **3. 🚨 GESTIÓN DE ALERTAS**
```javascript
// Creación de alertas:
✅ Botón de emergencia rápida (FAB)
✅ Formulario de creación de alerta
✅ Selección de tipo de emergencia
✅ Captura automática de ubicación
✅ Adjuntar fotos desde cámara/galería
✅ Grabación de audio (descripción por voz)
✅ Prioridad de alerta (alta, media, baja)

// Visualización de alertas:
✅ Lista de alertas activas
✅ Detalles completos de alerta
✅ Estado de alerta (activa, en progreso, resuelta)
✅ Filtros por tipo, prioridad, fecha
✅ Búsqueda de alertas
✅ Historial de alertas propias
```

### **4. 📍 PUNTOS DE INTERÉS**
```javascript
// Gestión de puntos:
✅ Visualización de puntos por categoría
✅ Filtros de puntos (hidrantes, hospitales, etc.)
✅ Detalles de punto con fotos
✅ Información de contacto
✅ Ruta hacia el punto
✅ Favoritos personales
✅ Reporte de puntos no encontrados
```

### **5. 👤 PERFIL Y CONFIGURACIÓN**
```javascript
// Perfil de usuario:
✅ Información personal editable
✅ Foto de perfil (cámara/galería)
✅ Estado de disponibilidad
✅ Historial de actividades
✅ Estadísticas personales
✅ Configuración de notificaciones
✅ Configuración de privacidad
```

### **6. 🔔 NOTIFICACIONES**
```javascript
// Sistema de notificaciones:
✅ Notificaciones push en tiempo real
✅ Notificaciones locales
✅ Sonidos de emergencia
✅ Vibración para alertas críticas
✅ Configuración de notificaciones por tipo
✅ Historial de notificaciones
✅ Modo silencioso inteligente
```

### **7. 📊 REPORTES Y ESTADÍSTICAS**
```javascript
// Funcionalidades de reportes:
✅ Dashboard personal
✅ Estadísticas de alertas creadas
✅ Tiempo de respuesta promedio
✅ Puntos visitados
✅ Reportes semanales/mensuales
✅ Exportación de datos
✅ Gráficos de actividad
```

---

## 🔧 **FUNCIONALIDADES AVANZADAS**

### **1. 🧭 NAVEGACIÓN Y RUTAS**
```javascript
// Sistema de navegación:
✅ Cálculo de rutas óptimas
✅ Navegación turn-by-turn
✅ Modo offline para rutas
✅ Estimación de tiempo de llegada
✅ Alertas de tráfico
✅ Puntos de referencia
✅ Modo emergencia (luces y sirena)
```

### **2. 📱 FUNCIONALIDADES DE DISPOSITIVO**
```javascript
// Características del dispositivo:
✅ Cámara para fotos/videos
✅ Micrófono para grabación de audio
✅ GPS de alta precisión
✅ Acelerómetro para detección de movimiento
✅ Brújula digital
✅ Linterna integrada
✅ Vibración para alertas
```

### **3. 🔄 SINCRONIZACIÓN**
```javascript
// Sincronización de datos:
✅ Sincronización automática en segundo plano
✅ Modo offline con sincronización posterior
✅ Resolución de conflictos
✅ Indicador de estado de conexión
✅ Reintentos automáticos
✅ Compresión de datos
```

### **4. 🛡️ SEGURIDAD AVANZADA**
```javascript
// Medidas de seguridad:
✅ Encriptación de datos locales
✅ Autenticación de dos factores
✅ Detección de dispositivos no autorizados
✅ Logs de seguridad
✅ Borrado remoto de datos
✅ Modo de emergencia (borrado rápido)
```

---

## 📱 **PANTALLAS PRINCIPALES**

### **1. 🚀 Pantalla de Inicio (Splash)**
- Logo de la aplicación
- Animación de carga
- Verificación de autenticación
- Carga de datos iniciales

### **2. 🔐 Pantalla de Login**
- Campos de email y contraseña
- Botón de login
- Opción de autenticación biométrica
- Enlace de recuperación de contraseña
- Recordar sesión

### **3. 🗺️ Pantalla de Mapa Principal**
- Mapa a pantalla completa
- Botón flotante de emergencia
- Barra superior con información
- Menú lateral deslizable
- Indicador de ubicación actual

### **4. 🚨 Pantalla de Crear Alerta**
- Formulario paso a paso
- Captura de ubicación automática
- Selección de tipo de emergencia
- Adjuntar multimedia
- Vista previa antes de enviar

### **5. 📋 Pantalla de Lista de Alertas**
- Lista con pull-to-refresh
- Filtros y búsqueda
- Estados visuales
- Acciones rápidas
- Paginación infinita

### **6. 👤 Pantalla de Perfil**
- Información del usuario
- Estadísticas personales
- Configuraciones
- Historial de actividades
- Opciones de cuenta

---

## 🔌 **INTEGRACIÓN CON BACKEND**

### **APIs a Reutilizar:**
```javascript
// Endpoints existentes a adaptar:
✅ POST /api/auth/login
✅ POST /api/auth/logout
✅ GET /api/usuarios/perfil
✅ PUT /api/usuarios/ubicacion
✅ GET /api/alertas
✅ POST /api/alertas/crear
✅ PUT /api/alertas/:id
✅ GET /api/puntos
✅ GET /api/categorias
✅ POST /api/historial
```

### **Nuevos Endpoints Necesarios:**
```javascript
// Endpoints específicos para móvil:
✅ POST /api/auth/refresh-token
✅ POST /api/alertas/:id/fotos
✅ POST /api/alertas/:id/audio
✅ GET /api/alertas/estadisticas
✅ POST /api/usuarios/notificaciones
✅ GET /api/puntos/favoritos
✅ POST /api/sincronizacion
```

---

## 📦 **CONFIGURACIÓN DE DESARROLLO**

### **Dependencias Principales:**
```json
{
  "dependencies": {
    "expo": "^49.0.0",
    "react-native": "0.72.0",
    "react-native-maps": "^1.7.1",
    "expo-location": "^16.1.0",
    "expo-notifications": "^0.20.1",
    "expo-camera": "^13.4.4",
    "expo-media-library": "^15.4.1",
    "expo-file-system": "^15.4.5",
    "expo-image-picker": "^14.3.2",
    "expo-av": "^13.10.4",
    "@react-navigation/native": "^6.1.7",
    "@react-navigation/bottom-tabs": "^6.5.8",
    "@react-navigation/stack": "^6.3.17",
    "@reduxjs/toolkit": "^1.9.5",
    "react-redux": "^8.1.2",
    "axios": "^1.5.0",
    "expo-secure-store": "^12.3.1",
    "expo-device": "^5.4.0",
    "expo-constants": "^14.4.2"
  }
}
```

### **Configuración de Expo:**
```json
{
  "expo": {
    "name": "Bomberos Catamarca",
    "slug": "bomberos-catamarca",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#e74c3c"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.bomberos.catamarca"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#e74c3c"
      },
      "package": "com.bomberos.catamarca",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "RECORD_AUDIO",
        "WRITE_EXTERNAL_STORAGE",
        "VIBRATE",
        "WAKE_LOCK"
      ]
    },
    "plugins": [
      "expo-location",
      "expo-notifications",
      "expo-camera"
    ]
  }
}
```

---

## 🚀 **PLAN DE DESARROLLO**

### **Fase 1: Configuración Base (1-2 semanas)**
```javascript
✅ Configuración del proyecto Expo
✅ Configuración de navegación
✅ Configuración de Redux
✅ Configuración de APIs
✅ Pantallas básicas (Login, Mapa)
✅ Autenticación básica
```

### **Fase 2: Funcionalidades Core (3-4 semanas)**
```javascript
✅ Mapa interactivo completo
✅ Gestión de alertas
✅ Geolocalización
✅ Notificaciones push
✅ Perfil de usuario
✅ Puntos de interés
```

### **Fase 3: Funcionalidades Avanzadas (2-3 semanas)**
```javascript
✅ Navegación y rutas
✅ Multimedia (fotos, audio)
✅ Modo offline
✅ Reportes y estadísticas
✅ Configuraciones avanzadas
```

### **Fase 4: Testing y Optimización (1-2 semanas)**
```javascript
✅ Testing en dispositivos reales
✅ Optimización de rendimiento
✅ Corrección de bugs
✅ Testing de usabilidad
✅ Preparación para producción
```

---

## 📊 **MÉTRICAS DE ÉXITO**

### **Técnicas:**
- ⚡ Tiempo de carga < 3 segundos
- 📱 Compatibilidad con 95% de dispositivos
- 🔋 Consumo de batería optimizado
- 📶 Funcionamiento offline
- 🛡️ 0 vulnerabilidades críticas

### **Funcionales:**
- 👥 100% de funcionalidades del web
- 📍 Geolocalización precisa
- 🔔 Notificaciones en tiempo real
- 📸 Captura multimedia
- 🧭 Navegación funcional

### **Usuarios:**
- ⭐ Rating de app store > 4.5
- 📈 90% de usuarios activos
- 🚨 Tiempo de respuesta < 30 segundos
- 💬 Feedback positivo de usuarios
- 📊 Reducción de tiempo de respuesta

---

## 🔧 **CONSIDERACIONES TÉCNICAS**

### **Rendimiento:**
- Lazy loading de componentes
- Optimización de imágenes
- Caché inteligente
- Compresión de datos
- Background tasks optimizadas

### **Seguridad:**
- Encriptación de datos sensibles
- Validación de entrada
- Sanitización de datos
- Certificados SSL
- Auditoría de seguridad

### **Accesibilidad:**
- Soporte para lectores de pantalla
- Contraste adecuado
- Tamaños de texto ajustables
- Navegación por teclado
- Subtítulos en videos

---

## 📋 **CHECKLIST DE ENTREGA**

### **Funcionalidades Core:**
- [ ] Autenticación completa
- [ ] Mapa funcional
- [ ] Gestión de alertas
- [ ] Notificaciones push
- [ ] Geolocalización
- [ ] Perfil de usuario

### **Funcionalidades Avanzadas:**
- [ ] Navegación y rutas
- [ ] Multimedia
- [ ] Modo offline
- [ ] Reportes
- [ ] Configuraciones

### **Calidad:**
- [ ] Testing completo
- [ ] Documentación
- [ ] Optimización
- [ ] Seguridad
- [ ] Accesibilidad

---

## 🎯 **PRÓXIMOS PASOS**

1. **Revisar y aprobar el prompt**
2. **Configurar entorno de desarrollo**
3. **Crear repositorio del proyecto móvil**
4. **Iniciar desarrollo con Fase 1**
5. **Testing continuo durante desarrollo**
6. **Deploy en stores (Google Play / App Store)**

---

*Prompt para desarrollo de aplicación móvil del Sistema de Mapeo de Emergencias*
*Versión: 1.0.0*
*Fecha: Diciembre 2024*
