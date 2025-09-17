# BASE DE DATOS
## Sistema de Mapeo de Emergencias - Catamarca

---

## 🗄️ **ESTRUCTURA DE LA BASE DE DATOS**

### **🏗️ Diagrama de Relaciones**
```
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS POSTGRESQL                    │
├─────────────────────────────────────────────────────────────────┤
│  👥 USUARIOS (Tabla principal)                                 │
│  ├── id (SERIAL PRIMARY KEY)                                   │
│  ├── nombre, email, password                                   │
│  ├── rol (operador/administrador)                              │
│  ├── telefono, disponible                                      │
│  ├── foto_perfil, institucion, rol_institucion                 │
│  ├── latitud, longitud, ultima_actualizacion_ubicacion         │
│  └── created_at                                                │
│                                                                 │
│  🚨 ALERTAS_EMERGENCIA (Depende de USUARIOS)                   │
│  ├── id (SERIAL PRIMARY KEY)                                   │
│  ├── tipo, prioridad, titulo, descripcion                      │
│  ├── latitud, longitud, direccion                              │
│  ├── personas_afectadas, riesgos_especificos                   │
│  ├── concurrencia_solicitada, estado                           │
│  ├── usuario_id → usuarios(id) [FOREIGN KEY]                   │
│  └── fecha_creacion, fecha_actualizacion                       │
│                                                                 │
│  📍 PUNTOS (Depende de CATEGORIAS)                             │
│  ├── id (SERIAL PRIMARY KEY)                                   │
│  ├── nombre, descripcion                                       │
│  ├── latitud, longitud                                         │
│  ├── categoria_id → categorias(id) [FOREIGN KEY]               │
│  ├── datos_personalizados (JSONB)                              │
│  ├── estado                                                    │
│  └── fecha_creacion, fecha_actualizacion                       │
│                                                                 │
│  🏷️ CATEGORIAS (Tabla independiente)                          │
│  ├── id (SERIAL PRIMARY KEY)                                   │
│  ├── nombre, descripcion                                       │
│  ├── icono, color                                              │
│  ├── campos_personalizados (JSONB)                             │
│  ├── estado                                                    │
│  └── fecha_creacion                                            │
│                                                                 │
│  📸 FOTOS_PUNTOS (Depende de PUNTOS)                           │
│  ├── id (SERIAL PRIMARY KEY)                                   │
│  ├── punto_id → puntos(id) [FOREIGN KEY]                       │
│  ├── nombre_archivo, ruta_archivo, ruta_miniatura              │
│  ├── descripcion, tamaño_bytes, tipo_mime                      │
│  ├── usuario_id → usuarios(id) [FOREIGN KEY]                   │
│  ├── public_id                                                 │
│  └── fecha_subida                                              │
│                                                                 │
│  📋 HISTORIAL_CAMBIOS (Depende de USUARIOS)                    │
│  ├── id (SERIAL PRIMARY KEY)                                   │
│  ├── tabla, registro_id, accion                                │
│  ├── datos_anteriores (JSONB), datos_nuevos (JSONB)            │
│  ├── usuario_id → usuarios(id) [FOREIGN KEY]                   │
│  └── fecha_cambio                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 **RELACIONES ENTRE TABLAS**

### **1. USUARIOS → ALERTAS_EMERGENCIA (1:N)**
```sql
-- Un usuario puede crear múltiples alertas de emergencia
usuarios (1) ←→ (N) alertas_emergencia

-- Ejemplo de consulta:
SELECT usuarios.nombre, alertas_emergencia.titulo, alertas_emergencia.fecha_creacion 
FROM usuarios 
JOIN alertas_emergencia ON usuarios.id = alertas_emergencia.usuario_id 
WHERE alertas_emergencia.estado = 'activa';
```

### **2. CATEGORIAS → PUNTOS (1:N)**
```sql
-- Una categoría puede tener múltiples puntos
categorias (1) ←→ (N) puntos

-- Ejemplo de consulta:
SELECT categorias.nombre as categoria, puntos.nombre as punto, puntos.latitud, puntos.longitud
FROM categorias 
JOIN puntos ON categorias.id = puntos.categoria_id;
```

### **3. PUNTOS → FOTOS_PUNTOS (1:N)**
```sql
-- Un punto puede tener múltiples fotos
puntos (1) ←→ (N) fotos_puntos

-- Ejemplo de consulta:
SELECT puntos.nombre as punto, fotos_puntos.ruta_archivo, fotos_puntos.descripcion
FROM puntos 
JOIN fotos_puntos ON puntos.id = fotos_puntos.punto_id;
```

### **4. USUARIOS → HISTORIAL_CAMBIOS (1:N)**
```sql
-- Un usuario puede tener múltiples registros en historial de cambios
usuarios (1) ←→ (N) historial_cambios

-- Ejemplo de consulta:
SELECT usuarios.nombre, historial_cambios.accion, historial_cambios.fecha_cambio
FROM usuarios 
JOIN historial_cambios ON usuarios.id = historial_cambios.usuario_id
ORDER BY historial_cambios.fecha_cambio DESC;
```

### **5. USUARIOS → FOTOS_PUNTOS (1:N)**
```sql
-- Un usuario puede subir múltiples fotos
usuarios (1) ←→ (N) fotos_puntos

-- Ejemplo de consulta:
SELECT usuarios.nombre, fotos_puntos.nombre_archivo, fotos_puntos.fecha_subida
FROM usuarios 
JOIN fotos_puntos ON usuarios.id = fotos_puntos.usuario_id;
```

---

## 📋 **ESTRUCTURA DETALLADA DE CADA TABLA**

### **👥 TABLA: usuarios**
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'operador',
    telefono VARCHAR(20),
    disponible BOOLEAN DEFAULT true,
    foto_perfil VARCHAR(500),
    institucion VARCHAR(100),
    rol_institucion VARCHAR(50),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    ultima_actualizacion_ubicacion TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Descripción de campos:**
- `id`: Identificador único autoincremental
- `email`: Email único para login
- `password`: Contraseña encriptada con bcrypt
- `nombre`: Nombre completo del usuario
- `rol`: 'operador' o 'administrador'
- `telefono`: Número de teléfono del usuario
- `disponible`: Si el operador está disponible para emergencias
- `foto_perfil`: URL de la foto de perfil (Cloudinary)
- `institucion`: Institución a la que pertenece el usuario
- `rol_institucion`: Rol dentro de la institución
- `latitud`: Coordenada de latitud GPS
- `longitud`: Coordenada de longitud GPS
- `ultima_actualizacion_ubicacion`: Última vez que se actualizó la ubicación
- `created_at`: Cuándo se creó la cuenta

### **🚨 TABLA: alertas_emergencia**
```sql
CREATE TABLE alertas_emergencia (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    prioridad VARCHAR(20) DEFAULT 'media',
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    direccion TEXT,
    personas_afectadas INTEGER DEFAULT 0,
    riesgos_especificos TEXT,
    concurrencia_solicitada VARCHAR(10) DEFAULT '1',
    estado VARCHAR(20) DEFAULT 'activa',
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Descripción de campos:**
- `id`: Identificador único autoincremental
- `tipo`: Tipo de emergencia (incendio_estructural, accidente_vehicular, rescate, etc.)
- `prioridad`: Nivel de urgencia (alta, media, baja)
- `titulo`: Título descriptivo de la alerta
- `descripcion`: Descripción detallada de la emergencia
- `latitud/longitud`: Coordenadas GPS de la emergencia
- `direccion`: Dirección textual de la ubicación
- `personas_afectadas`: Número de personas afectadas por la emergencia
- `riesgos_especificos`: Descripción de riesgos específicos
- `concurrencia_solicitada`: Número de unidades solicitadas
- `estado`: Estado actual de la alerta (activa, inactiva)
- `usuario_id`: Quién creó la alerta (referencia a usuarios)
- `fecha_creacion`: Cuándo se creó la alerta
- `fecha_actualizacion`: Última actualización de la alerta

### **🏷️ TABLA: categorias**
```sql
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(100),
    color VARCHAR(7) DEFAULT '#007bff',
    campos_personalizados JSONB,
    estado VARCHAR(50) DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Descripción de campos:**
- `id`: Identificador único autoincremental
- `nombre`: Nombre de la categoría (Hidrantes, Hospitales, etc.)
- `descripcion`: Descripción de la categoría
- `icono`: Clase CSS del icono (Font Awesome)
- `color`: Color hexadecimal para el marcador
- `campos_personalizados`: Campos adicionales específicos de la categoría en formato JSONB
- `estado`: Estado de la categoría (activo, inactivo)
- `fecha_creacion`: Cuándo se creó la categoría

### **📍 TABLA: puntos**
```sql
CREATE TABLE puntos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    datos_personalizados JSONB,
    estado VARCHAR(50) DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Descripción de campos:**
- `id`: Identificador único autoincremental
- `nombre`: Nombre del punto (ej: "Hidrante Plaza 25 de Mayo")
- `descripcion`: Descripción detallada del punto
- `latitud/longitud`: Coordenadas GPS del punto
- `categoria_id`: A qué categoría pertenece (referencia a categorias)
- `datos_personalizados`: Datos adicionales específicos del punto en formato JSONB
- `estado`: Estado del punto (activo, eliminado)
- `fecha_creacion`: Cuándo se agregó el punto
- `fecha_actualizacion`: Última actualización del punto

### **📸 TABLA: fotos_puntos**
```sql
CREATE TABLE fotos_puntos (
    id SERIAL PRIMARY KEY,
    punto_id INTEGER NOT NULL REFERENCES puntos(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo TEXT NOT NULL,
    ruta_miniatura TEXT,
    descripcion TEXT,
    tamaño_bytes INTEGER,
    tipo_mime VARCHAR(100),
    usuario_id INTEGER REFERENCES usuarios(id),
    public_id VARCHAR(255),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Descripción de campos:**
- `id`: Identificador único autoincremental
- `punto_id`: A qué punto pertenece la foto (referencia a puntos)
- `nombre_archivo`: Nombre original del archivo
- `ruta_archivo`: Ruta completa del archivo en el servidor
- `ruta_miniatura`: Ruta de la miniatura si existe
- `descripcion`: Descripción de la foto
- `tamaño_bytes`: Tamaño del archivo en bytes
- `tipo_mime`: Tipo MIME del archivo (image/jpeg, image/png, etc.)
- `usuario_id`: Usuario que subió la foto (referencia a usuarios)
- `public_id`: ID público en Cloudinary
- `fecha_subida`: Cuándo se subió la foto

### **📋 TABLA: historial_cambios**
```sql
CREATE TABLE historial_cambios (
    id SERIAL PRIMARY KEY,
    tabla VARCHAR(100) NOT NULL,
    registro_id INTEGER NOT NULL,
    accion VARCHAR(50) NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    usuario_id INTEGER REFERENCES usuarios(id),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Descripción de campos:**
- `id`: Identificador único autoincremental
- `tabla`: Nombre de la tabla que fue modificada
- `registro_id`: ID del registro que fue modificado
- `accion`: Tipo de acción realizada (INSERT, UPDATE, DELETE)
- `datos_anteriores`: Datos anteriores en formato JSONB
- `datos_nuevos`: Datos nuevos en formato JSONB
- `usuario_id`: Usuario que realizó la acción (referencia a usuarios)
- `fecha_cambio`: Cuándo se realizó el cambio

---

## 🔍 **CONSULTAS TÍPICAS**

### **Obtener alertas activas con información del usuario:**
```sql
SELECT 
    alertas_emergencia.id, 
    alertas_emergencia.titulo, 
    alertas_emergencia.descripcion, 
    alertas_emergencia.prioridad,
    alertas_emergencia.latitud, 
    alertas_emergencia.longitud, 
    alertas_emergencia.fecha_creacion,
    usuarios.nombre as creador
FROM alertas_emergencia
LEFT JOIN usuarios ON alertas_emergencia.usuario_id = usuarios.id
WHERE alertas_emergencia.estado = 'activa'
ORDER BY alertas_emergencia.fecha_creacion DESC;
```

### **Obtener puntos por categoría:**
```sql
SELECT 
    puntos.id, 
    puntos.nombre, 
    puntos.descripcion,
    puntos.latitud, 
    puntos.longitud,
    categorias.nombre as categoria, 
    categorias.icono, 
    categorias.color
FROM puntos
JOIN categorias ON puntos.categoria_id = categorias.id
WHERE puntos.estado = 'activo'
ORDER BY categorias.nombre, puntos.nombre;
```

### **Obtener estadísticas de usuarios:**
```sql
SELECT 
    rol,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN disponible = true THEN 1 END) as disponibles
FROM usuarios
GROUP BY rol;
```

### **Obtener puntos con fotos:**
```sql
SELECT 
    puntos.id, 
    puntos.nombre, 
    puntos.descripcion,
    puntos.latitud, 
    puntos.longitud,
    categorias.nombre as categoria,
    COUNT(fotos_puntos.id) as total_fotos
FROM puntos
JOIN categorias ON puntos.categoria_id = categorias.id
LEFT JOIN fotos_puntos ON puntos.id = fotos_puntos.punto_id
WHERE puntos.estado = 'activo'
GROUP BY puntos.id, categorias.nombre
ORDER BY categorias.nombre, puntos.nombre;
```

### **Obtener historial de cambios:**
```sql
SELECT 
    historial_cambios.id, 
    historial_cambios.accion, 
    historial_cambios.tabla,
    historial_cambios.registro_id,
    historial_cambios.fecha_cambio,
    usuarios.nombre as usuario
FROM historial_cambios
LEFT JOIN usuarios ON historial_cambios.usuario_id = usuarios.id
ORDER BY historial_cambios.fecha_cambio DESC
LIMIT 50;
```

### **Obtener operadores disponibles:**
```sql
SELECT 
    id, 
    nombre, 
    email, 
    rol,
    latitud,
    longitud,
    ultima_actualizacion_ubicacion
FROM usuarios
WHERE disponible = true 
AND rol = 'operador'
ORDER BY nombre;
```

---

## 📊 **ÍNDICES RECOMENDADOS**

```sql
-- Índices para mejorar el rendimiento
CREATE INDEX idx_alertas_emergencia_estado ON alertas_emergencia(estado);
CREATE INDEX idx_alertas_emergencia_fecha ON alertas_emergencia(fecha_creacion);
CREATE INDEX idx_alertas_emergencia_prioridad ON alertas_emergencia(prioridad);
CREATE INDEX idx_alertas_emergencia_usuario ON alertas_emergencia(usuario_id);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_disponible ON usuarios(disponible);
CREATE INDEX idx_puntos_categoria ON puntos(categoria_id);
CREATE INDEX idx_puntos_estado ON puntos(estado);
CREATE INDEX idx_fotos_puntos_punto ON fotos_puntos(punto_id);
CREATE INDEX idx_fotos_puntos_usuario ON fotos_puntos(usuario_id);
CREATE INDEX idx_historial_cambios_tabla ON historial_cambios(tabla);
CREATE INDEX idx_historial_cambios_fecha ON historial_cambios(fecha_cambio);
CREATE INDEX idx_historial_cambios_usuario ON historial_cambios(usuario_id);
```

---

## 🔧 **OPERACIONES CRUD TÍPICAS**

### **INSERTAR USUARIO:**
```sql
INSERT INTO usuarios (nombre, email, password, rol, telefono)
VALUES ('Juan Pérez', 'juan@bomberos.com', '$2b$10$...', 'operador', '+54 9 383 123-4567')
RETURNING id, nombre, email, rol;
```

### **ACTUALIZAR UBICACIÓN:**
```sql
UPDATE usuarios 
SET latitud = -28.4685, 
    longitud = -65.7789,
    ultima_actualizacion_ubicacion = CURRENT_TIMESTAMP
WHERE id = 1;
```

### **CREAR ALERTA DE EMERGENCIA:**
```sql
INSERT INTO alertas_emergencia (titulo, descripcion, tipo, prioridad, latitud, longitud, usuario_id)
VALUES ('Incendio en edificio', 'Fuego en el tercer piso', 'incendio_estructural', 'alta', -28.4685, -65.7789, 1)
RETURNING id, titulo, fecha_creacion;
```

### **DAR DE BAJA ALERTA:**
```sql
UPDATE alertas_emergencia 
SET estado = 'inactiva',
    fecha_actualizacion = CURRENT_TIMESTAMP
WHERE id = 123;
```

### **AGREGAR PUNTO:**
```sql
INSERT INTO puntos (nombre, descripcion, categoria_id, latitud, longitud)
VALUES ('Hidrante Plaza Central', 'Hidrante principal de la plaza', 1, -28.4685, -65.7789)
RETURNING id, nombre;
```

### **SUBIR FOTO A PUNTO:**
```sql
INSERT INTO fotos_puntos (punto_id, nombre_archivo, ruta_archivo, descripcion, usuario_id)
VALUES (1, 'hidrante_plaza.jpg', '/uploads/hidrante_plaza.jpg', 'Foto del hidrante principal', 1)
RETURNING id, nombre_archivo;
```

### **REGISTRAR CAMBIO EN HISTORIAL:**
```sql
INSERT INTO historial_cambios (tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id)
VALUES ('puntos', 1, 'UPDATE', '{"nombre": "Hidrante Viejo"}', '{"nombre": "Hidrante Nuevo"}', 1)
RETURNING id, fecha_cambio;
```

---

## 🚀 **VENTAJAS DE ESTA ESTRUCTURA**

✅ **Normalización:** Evita redundancia de datos  
✅ **Integridad referencial:** Las relaciones están protegidas con FOREIGN KEYS  
✅ **Escalabilidad:** Fácil agregar nuevas funcionalidades  
✅ **Consultas eficientes:** Índices en claves primarias y foráneas  
✅ **Flexibilidad:** JSONB para datos dinámicos (ubicación, historial)  
✅ **Seguridad:** Contraseñas encriptadas, roles de usuario  
✅ **Auditoría:** Historial de todas las acciones  
✅ **Geolocalización:** Coordenadas precisas para mapas  

---

## 📈 **ESTADÍSTICAS DE LA BASE DE DATOS**

- **Total de tablas:** 6 tablas principales
- **Relaciones:** 5 relaciones principales (1:N)
- **Campos JSONB:** 4 campos (datos_personalizados, campos_personalizados, datos_anteriores, datos_nuevos)
- **Índices:** 13 índices para optimización
- **Tecnología:** PostgreSQL 14+
- **Hosting:** Railway PostgreSQL

---

*Documentación de la base de datos del Sistema de Mapeo de Emergencias*
*Versión: 1.0.0*
