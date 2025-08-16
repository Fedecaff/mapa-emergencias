# 🚨 PROMPT: APP MÓVIL - MAPA DE EMERGENCIAS

## 📱 **CONTEXTO DEL PROYECTO ACTUAL**

### **Aplicación Web Existente:**
- **Nombre:** Mapa de Emergencias
- **Autor:** Federico Caffettaro
- **Estado:** ✅ **COMPLETAMENTE FUNCIONAL** y desplegado en Netlify
- **URL:** https://mapa-emergencias-federico-caffettaro.netlify.app

### **Arquitectura Actual:**
- **Backend:** Node.js + Express + SQLite
- **Frontend:** HTML5 + CSS3 + JavaScript (Vanilla)
- **Mapas:** Leaflet.js + OpenStreetMap
- **Autenticación:** JWT (JSON Web Tokens)
- **Base de Datos:** SQLite con tablas: usuarios, categorias, puntos, historial_cambios

### **Funcionalidades Implementadas:**
- ✅ Sistema de login (admin/usuario)
- ✅ Mapa interactivo de Catamarca
- ✅ Gestión de puntos (CRUD completo)
- ✅ Categorías: Hidrantes, Comisarías, Escuelas, Hospitales
- ✅ Filtros por categorías
- ✅ Búsqueda de ubicaciones
- ✅ Geolocalización ("Mi ubicación")
- ✅ Creación de usuarios (solo admin)
- ✅ Historial de cambios
- ✅ Campos personalizados por categoría

---

## 🎯 **OBJETIVO: DESARROLLAR APP MÓVIL**

### **Tecnología Recomendada:**
**React Native con Expo** (mejor adaptación y facilidad de desarrollo)

### **Razones:**
- ✅ **JavaScript/TypeScript** (conocimiento existente)
- ✅ **Expo** (desarrollo rápido, testing fácil)
- ✅ **Comunidad grande** y documentación excelente
- ✅ **Despliegue sencillo** a App Store y Google Play
- ✅ **Funcionalidades nativas** (cámara, GPS, notificaciones)

---

## 📋 **ESPECIFICACIONES TÉCNICAS**

### **Plataforma:**
- **React Native** con Expo SDK 50+
- **TypeScript** para mejor mantenibilidad
- **Expo Router** para navegación
- **Expo SQLite** para base de datos local
- **Expo Location** para geolocalización
- **Expo Camera** para fotos/videos
- **Expo Notifications** para push notifications

### **Arquitectura:**
```
📱 App Móvil (React Native + Expo)
    ↓
🌐 API Backend (Node.js + Express + SQLite)
    ↓
🗄️ Base de Datos (SQLite)
```

### **Sincronización:**
- **Modo offline:** SQLite local
- **Sincronización:** Cuando hay conexión
- **Conflictos:** Resolución automática por timestamp

---

## 🎨 **DISEÑO Y UX**

### **Principios de Diseño:**
- **Material Design 3** (Android) / **Human Interface Guidelines** (iOS)
- **Modo oscuro/claro** automático
- **Accesibilidad** completa
- **Interfaz intuitiva** para emergencias

### **Pantallas Principales:**
1. **Splash Screen** (logo + carga)
2. **Login/Registro** (email + password + biometría)
3. **Mapa Principal** (puntos + ubicación actual)
4. **Detalles de Punto** (información completa)
5. **Agregar/Editar Punto** (formulario dinámico)
6. **Perfil de Usuario** (configuración + logout)
7. **Panel de Admin** (gestión de usuarios)

---

## 🚨 **FUNCIONALIDADES ESPECÍFICAS MÓVILES**

### **1. Autenticación Avanzada:**
- ✅ **Biometría:** Huella dactilar / Face ID
- ✅ **Login persistente** (recordar sesión)
- ✅ **Recuperación de contraseña**
- ✅ **Verificación en dos pasos** (opcional)

### **2. Geolocalización Mejorada:**
- ✅ **GPS en tiempo real** (alta precisión)
- ✅ **Seguimiento de ruta** (para emergencias)
- ✅ **Alertas de proximidad** (puntos cercanos)
- ✅ **Modo offline** (última ubicación conocida)

### **3. Multimedia:**
- ✅ **Fotos de puntos** (cámara + galería)
- ✅ **Videos cortos** (máximo 30 segundos)
- ✅ **Audio notes** (descripción por voz)
- ✅ **Compresión automática** (optimizar almacenamiento)

### **4. Notificaciones Push:**
- ✅ **Alertas de emergencia** (admin → usuarios)
- ✅ **Nuevos puntos cercanos**
- ✅ **Actualizaciones de puntos**
- ✅ **Recordatorios** (mantenimiento hidrantes)

### **5. Funcionalidades de Emergencia:**
- ✅ **Botón de pánico** (ubicación + llamada automática)
- ✅ **Llamadas directas** a emergencias
- ✅ **Compartir ubicación** por WhatsApp/SMS
- ✅ **Modo SOS** (pantalla roja + sonido)

### **6. Modo Offline:**
- ✅ **Mapa offline** (tiles descargados)
- ✅ **Datos sincronizados** localmente
- ✅ **Reportes offline** (sincronizar después)
- ✅ **Indicador de conexión**

---

## 🗄️ **ESTRUCTURA DE DATOS**

### **Tablas Existentes (mantener compatibilidad):**
```sql
-- Usuarios
usuarios (id, nombre, email, password, rol, fecha_creacion)

-- Categorías
categorias (id, nombre, descripcion, icono, color, campos_personalizados)

-- Puntos
puntos (id, nombre, descripcion, latitud, longitud, categoria_id, datos_personalizados, estado, fecha_creacion, fecha_actualizacion)

-- Historial
historial_cambios (id, tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id, fecha)
```

### **Nuevas Tablas para App Móvil:**
```sql
-- Fotos/Videos de puntos
multimedia (id, punto_id, tipo, url, descripcion, fecha_creacion)

-- Reportes offline
reportes_offline (id, tipo, datos, sincronizado, fecha_creacion)

-- Configuración local
configuracion_local (clave, valor, fecha_actualizacion)
```

---

## 🔧 **CONFIGURACIÓN TÉCNICA**

### **Dependencias Principales:**
```json
{
  "expo": "^50.0.0",
  "react-native": "0.73.0",
  "expo-router": "^3.0.0",
  "expo-sqlite": "^13.0.0",
  "expo-location": "^16.0.0",
  "expo-camera": "^14.0.0",
  "expo-notifications": "^0.27.0",
  "expo-local-authentication": "^13.0.0",
  "react-native-maps": "^1.8.0",
  "@react-native-async-storage/async-storage": "^1.21.0"
}
```

### **Configuración de Expo:**
```json
{
  "expo": {
    "name": "Mapa de Emergencias",
    "slug": "mapa-emergencias-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.federicocaffettaro.mapadeemergencias"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.federicocaffettaro.mapadeemergencias",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "RECORD_AUDIO",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-location",
      "expo-camera",
      "expo-notifications"
    ]
  }
}
```

---

## 🎯 **FUNCIONALIDADES POR ROL**

### **Usuario Normal:**
- ✅ Ver mapa con puntos
- ✅ Filtrar por categorías
- ✅ Buscar ubicaciones
- ✅ Ver detalles de puntos
- ✅ Usar "Mi ubicación"
- ✅ Recibir notificaciones
- ✅ Modo offline

### **Administrador:**
- ✅ Todas las funciones de usuario
- ✅ Agregar/editar/eliminar puntos
- ✅ Subir fotos/videos
- ✅ Gestionar usuarios
- ✅ Ver historial de cambios
- ✅ Enviar notificaciones
- ✅ Estadísticas de uso

---

## 🚀 **PLAN DE DESARROLLO**

### **Fase 1: Configuración Base (1-2 días)**
- ✅ Setup de React Native + Expo
- ✅ Configuración de navegación
- ✅ Integración con API existente
- ✅ Autenticación básica

### **Fase 2: Mapa y Puntos (2-3 días)**
- ✅ Implementar mapa interactivo
- ✅ Cargar y mostrar puntos
- ✅ Filtros por categorías
- ✅ Geolocalización

### **Fase 3: Funcionalidades Avanzadas (3-4 días)**
- ✅ Cámara y multimedia
- ✅ Modo offline
- ✅ Notificaciones push
- ✅ Botón de pánico

### **Fase 4: Testing y Optimización (2-3 días)**
- ✅ Testing en dispositivos reales
- ✅ Optimización de rendimiento
- ✅ Corrección de bugs
- ✅ Preparación para publicación

---

## 📱 **REQUISITOS DE PUBLICACIÓN**

### **App Store (iOS):**
- ✅ Cuenta de desarrollador ($99/año)
- ✅ Iconos en diferentes tamaños
- ✅ Screenshots de todas las pantallas
- ✅ Descripción detallada
- ✅ Política de privacidad

### **Google Play (Android):**
- ✅ Cuenta de desarrollador ($25/una vez)
- ✅ APK firmado
- ✅ Iconos y screenshots
- ✅ Descripción en español
- ✅ Permisos justificados

---

## 🎨 **DISEÑO VISUAL**

### **Paleta de Colores:**
- **Primario:** #FF4444 (Rojo emergencia)
- **Secundario:** #2196F3 (Azul confianza)
- **Acento:** #FFC107 (Amarillo alerta)
- **Neutro:** #424242 (Gris oscuro)
- **Fondo:** #FAFAFA (Gris claro)

### **Iconografía:**
- **Material Design Icons** para consistencia
- **Iconos personalizados** para categorías
- **Indicadores de estado** claros
- **Botones de acción** prominentes

---

## 🔒 **SEGURIDAD Y PRIVACIDAD**

### **Medidas de Seguridad:**
- ✅ **Encriptación** de datos sensibles
- ✅ **Validación** de entrada de datos
- ✅ **Autenticación** robusta
- ✅ **Backup** automático de datos

### **Privacidad:**
- ✅ **Política de privacidad** clara
- ✅ **Consentimiento** explícito
- ✅ **Datos mínimos** necesarios
- ✅ **Eliminación** de datos a pedido

---

## 📊 **MÉTRICAS Y ANALÍTICAS**

### **Datos a Recolectar:**
- ✅ **Uso de la app** (sesiones, tiempo)
- ✅ **Funcionalidades más usadas**
- ✅ **Errores y crashes**
- ✅ **Rendimiento** (tiempo de carga)

### **Herramientas:**
- ✅ **Expo Analytics** (básico)
- ✅ **Firebase Analytics** (avanzado)
- ✅ **Crashlytics** (errores)

---

## 🎯 **CRITERIOS DE ÉXITO**

### **Funcionales:**
- ✅ **100% compatibilidad** con API existente
- ✅ **Funcionamiento offline** completo
- ✅ **Rendimiento** fluido (60fps)
- ✅ **Batería optimizada** (uso mínimo)

### **UX/UI:**
- ✅ **Intuitiva** para usuarios de emergencias
- ✅ **Accesible** para personas con discapacidades
- ✅ **Responsive** en diferentes tamaños
- ✅ **Rápida** (menos de 2 segundos de carga)

### **Técnicos:**
- ✅ **Código limpio** y mantenible
- ✅ **Documentación** completa
- ✅ **Testing** automatizado
- ✅ **CI/CD** configurado

---

## 🚀 **COMANDOS DE INICIO**

```bash
# Crear proyecto
npx create-expo-app@latest mapa-emergencias-mobile --template

# Instalar dependencias
npm install expo-router expo-sqlite expo-location expo-camera expo-notifications

# Iniciar desarrollo
npx expo start

# Build para producción
npx expo build:android
npx expo build:ios
```

---

## 📞 **CONTACTO Y SOPORTE**

- **Desarrollador:** Federico Caffettaro
- **Email:** federico.gomez.sc@gmail.com
- **Proyecto:** Mapa de Emergencias
- **Versión:** 1.0.0 (App Móvil)

---

**¡LISTO PARA DESARROLLAR LA APP MÓVIL MÁS COMPLETA Y PROFESIONAL!** 🚀📱


