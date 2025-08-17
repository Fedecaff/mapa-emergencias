# 🗄️ Migración a PostgreSQL

## 📋 Resumen

Este documento describe la migración del sistema de SQLite a PostgreSQL para mejorar la persistencia de datos en producción.

## 🎯 Beneficios de la migración

- ✅ **Persistencia de datos** - Los datos no se pierden entre reinicios
- ✅ **Mejor rendimiento** - PostgreSQL es más rápido que SQLite
- ✅ **Escalabilidad** - Puede manejar más conexiones simultáneas
- ✅ **Backups automáticos** - Railway hace backups automáticos
- ✅ **Gratis** - PostgreSQL es gratuito en Railway

## 🚀 Pasos para la migración

### 1. Configuración local (Desarrollo)

```bash
# Instalar dependencias
npm install

# Crear archivo .env con las variables de entorno
cp env.example .env

# Editar .env con tus credenciales de PostgreSQL local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mapa_emergencias
DB_USER=postgres
DB_PASSWORD=tu_password
```

### 2. Configuración en Railway (Producción)

1. **Crear base de datos PostgreSQL en Railway:**
   - Ve a tu proyecto en Railway
   - Haz clic en "New"
   - Selecciona "Database" → "PostgreSQL"
   - Railway generará automáticamente las variables de entorno

2. **Configurar variables de entorno:**
   - Railway automáticamente agrega las variables:
     - `DATABASE_URL`
     - `PGHOST`
     - `PGPORT`
     - `PGDATABASE`
     - `PGUSER`
     - `PGPASSWORD`

### 3. Migrar datos existentes (Opcional)

Si tienes datos en SQLite que quieres migrar:

```bash
# Ejecutar migración
npm run migrate
```

### 4. Inicializar base de datos

```bash
# Inicializar tablas y datos por defecto
npm run init-db
```

### 5. Probar la aplicación

```bash
# Iniciar servidor
npm start
```

## 🔧 Configuración de variables de entorno

### Desarrollo local (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mapa_emergencias
DB_USER=postgres
DB_PASSWORD=password
PORT=8080
NODE_ENV=development
JWT_SECRET=tu_jwt_secret_aqui
```

### Producción (Railway)
Railway configura automáticamente las variables de entorno para PostgreSQL.

## 📊 Estructura de la base de datos

### Tablas creadas:
- **usuarios** - Usuarios del sistema
- **categorias** - Categorías de puntos (Hidrantes, Hospitales, etc.)
- **puntos** - Puntos de emergencia en el mapa
- **historial_cambios** - Registro de cambios en el sistema

### Índices creados:
- `idx_puntos_categoria` - Para búsquedas por categoría
- `idx_puntos_estado` - Para filtros por estado
- `idx_historial_tabla` - Para búsquedas en historial
- `idx_historial_fecha` - Para ordenamiento por fecha

## 🛠️ Comandos útiles

```bash
# Inicializar base de datos
npm run init-db

# Migrar datos de SQLite a PostgreSQL
npm run migrate

# Iniciar servidor en desarrollo
npm run dev

# Iniciar servidor en producción
npm start
```

## 🔍 Verificación

Para verificar que la migración fue exitosa:

1. **Acceder a la aplicación** en el navegador
2. **Iniciar sesión** con las credenciales por defecto:
   - Email: `federico.gomez.sc@gmail.com`
   - Password: `admin123`
3. **Verificar que:**
   - Las categorías se cargan correctamente
   - Se pueden crear nuevos puntos
   - El historial funciona
   - Se pueden crear usuarios

## 🚨 Solución de problemas

### Error de conexión a PostgreSQL
- Verificar que PostgreSQL esté instalado y ejecutándose
- Verificar las credenciales en el archivo .env
- Verificar que la base de datos exista

### Error de migración
- Verificar que SQLite tenga datos para migrar
- Verificar permisos de escritura en PostgreSQL

### Error en Railway
- Verificar que las variables de entorno estén configuradas
- Verificar que la base de datos PostgreSQL esté creada en Railway

## 📝 Notas importantes

- **Los datos ahora persisten** entre reinicios del servidor
- **Backups automáticos** en Railway
- **Mejor rendimiento** para múltiples usuarios
- **Escalabilidad** para futuras mejoras

---

**Desarrollado por:** Federico Caffettaro  
**Fecha:** Agosto 2024
