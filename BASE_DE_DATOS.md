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
│  ├── nombre, email, password_hash                              │
│  ├── rol (operador/administrador)                              │
│  ├── foto_perfil, disponible                                   │
│  ├── ultima_ubicacion (JSONB)                                  │
│  └── fecha_creacion, fecha_actualizacion                       │
│                                                                 │
│  🚨 ALERTAS (Depende de USUARIOS)                              │
│  ├── id (SERIAL PRIMARY KEY)                                   │
│  ├── titulo, descripcion, tipo, prioridad                      │
│  ├── latitud, longitud, direccion                              │
│  ├── estado (activa/inactiva)                                  │
│  ├── usuario_id → usuarios(id) [FOREIGN KEY]                   │
│  └── fecha_creacion                                            │
│                                                                 │
│  📍 PUNTOS (Depende de CATEGORIAS)                             │
│  ├── id (SERIAL PRIMARY KEY)                                   │
│  ├── nombre, descripcion, direccion                            │
│  ├── latitud, longitud                                         │
│  ├── categoria_id → categorias(id) [FOREIGN KEY]               │
│  └── fecha_creacion                                            │
│                                                                 │
│  🏷️ CATEGORIAS (Tabla independiente)                          │
│  ├── id (SERIAL PRIMARY KEY)                                   │
│  ├── nombre, descripcion                                       │
│  ├── icono, color                                              │
│  └── fecha_creacion                                            │
│                                                                 │
│  📸 FOTOS (Depende de PUNTOS)                                  │
│  ├── id (SERIAL PRIMARY KEY)                                   │
│  ├── url, descripcion                                          │
│  ├── punto_id → puntos(id) [FOREIGN KEY]                       │
│  └── fecha_subida                                              │
│                                                                 │
│  📋 HISTORIAL (Depende de USUARIOS)                            │
│  ├── id (SERIAL PRIMARY KEY)                                   │
│  ├── accion, detalles                                          │
│  ├── usuario_id → usuarios(id) [FOREIGN KEY]                   │
│  └── fecha                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 **RELACIONES ENTRE TABLAS**

### **1. USUARIOS → ALERTAS (1:N)**
```sql
-- Un usuario puede crear múltiples alertas
usuarios (1) ←→ (N) alertas

-- Ejemplo de consulta:
SELECT u.nombre, a.titulo, a.fecha_creacion 
FROM usuarios u 
JOIN alertas a ON u.id = a.usuario_id 
WHERE a.estado = 'activa';
```

### **2. CATEGORIAS → PUNTOS (1:N)**
```sql
-- Una categoría puede tener múltiples puntos
categorias (1) ←→ (N) puntos

-- Ejemplo de consulta:
SELECT c.nombre as categoria, p.nombre as punto, p.latitud, p.longitud
FROM categorias c 
JOIN puntos p ON c.id = p.categoria_id;
```

### **3. PUNTOS → FOTOS (1:N)**
```sql
-- Un punto puede tener múltiples fotos
puntos (1) ←→ (N) fotos

-- Ejemplo de consulta:
SELECT p.nombre as punto, f.url, f.descripcion
FROM puntos p 
JOIN fotos f ON p.id = f.punto_id;
```

### **4. USUARIOS → HISTORIAL (1:N)**
```sql
-- Un usuario puede tener múltiples registros en historial
usuarios (1) ←→ (N) historial

-- Ejemplo de consulta:
SELECT u.nombre, h.accion, h.fecha
FROM usuarios u 
JOIN historial h ON u.id = h.usuario_id
ORDER BY h.fecha DESC;
```

---

## 📋 **ESTRUCTURA DETALLADA DE CADA TABLA**

### **👥 TABLA: usuarios**
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'operador',
    foto_perfil TEXT,
    disponible BOOLEAN DEFAULT true,
    ultima_ubicacion JSONB,  -- {lat: -28.4685, lng: -65.7789}
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Descripción de campos:**
- `id`: Identificador único autoincremental
- `nombre`: Nombre completo del usuario
- `email`: Email único para login
- `password_hash`: Contraseña encriptada con bcrypt
- `rol`: 'operador' o 'administrador'
- `foto_perfil`: URL de la foto de perfil (Cloudinary)
- `disponible`: Si el operador está disponible para emergencias
- `ultima_ubicacion`: Coordenadas GPS en formato JSONB
- `fecha_creacion`: Cuándo se creó la cuenta
- `fecha_actualizacion`: Última actualización del perfil

### **🚨 TABLA: alertas**
```sql
CREATE TABLE alertas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(100),  -- 'incendio_estructural', 'accidente_vehicular', etc.
    prioridad VARCHAR(50) DEFAULT 'media',  -- 'alta', 'media', 'baja'
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    direccion TEXT,
    estado VARCHAR(50) DEFAULT 'activa',  -- 'activa', 'inactiva'
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Descripción de campos:**
- `id`: Identificador único autoincremental
- `titulo`: Título descriptivo de la alerta
- `descripcion`: Descripción detallada de la emergencia
- `tipo`: Tipo de emergencia (incendio, accidente, rescate, etc.)
- `prioridad`: Nivel de urgencia (alta, media, baja)
- `latitud/longitud`: Coordenadas GPS de la emergencia
- `direccion`: Dirección textual de la ubicación
- `estado`: Estado actual de la alerta
- `usuario_id`: Quién creó la alerta (referencia a usuarios)
- `fecha_creacion`: Cuándo se creó la alerta

### **🏷️ TABLA: categorias**
```sql
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(100),  -- 'fa-fire', 'fa-hospital', etc.
    color VARCHAR(7),    -- '#e74c3c', '#27ae60', etc.
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Descripción de campos:**
- `id`: Identificador único autoincremental
- `nombre`: Nombre de la categoría (Hidrantes, Hospitales, etc.)
- `descripcion`: Descripción de la categoría
- `icono`: Clase CSS del icono (Font Awesome)
- `color`: Color hexadecimal para el marcador
- `fecha_creacion`: Cuándo se creó la categoría

### **📍 TABLA: puntos**
```sql
CREATE TABLE puntos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    direccion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Descripción de campos:**
- `id`: Identificador único autoincremental
- `nombre`: Nombre del punto (ej: "Hidrante Plaza 25 de Mayo")
- `descripcion`: Descripción detallada del punto
- `categoria_id`: A qué categoría pertenece (referencia a categorias)
- `latitud/longitud`: Coordenadas GPS del punto
- `direccion`: Dirección textual del punto
- `fecha_creacion`: Cuándo se agregó el punto

### **📸 TABLA: fotos**
```sql
CREATE TABLE fotos (
    id SERIAL PRIMARY KEY,
    punto_id INTEGER REFERENCES puntos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    descripcion TEXT,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Descripción de campos:**
- `id`: Identificador único autoincremental
- `punto_id`: A qué punto pertenece la foto (referencia a puntos)
- `url`: URL de la imagen en Cloudinary
- `descripcion`: Descripción de la foto
- `fecha_subida`: Cuándo se subió la foto

### **📋 TABLA: historial**
```sql
CREATE TABLE historial (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(255) NOT NULL,  -- 'login', 'crear_alerta', 'editar_punto'
    detalles JSONB,                -- {punto_id: 123, cambios: {...}}
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Descripción de campos:**
- `id`: Identificador único autoincremental
- `usuario_id`: Quién realizó la acción (referencia a usuarios)
- `accion`: Tipo de acción realizada
- `detalles`: Información adicional en formato JSONB
- `fecha`: Cuándo se realizó la acción

---

## 🔍 **CONSULTAS TÍPICAS**

### **Obtener alertas activas con información del usuario:**
```sql
SELECT 
    a.id, a.titulo, a.descripcion, a.prioridad,
    a.latitud, a.longitud, a.fecha_creacion,
    u.nombre as creador
FROM alertas a
LEFT JOIN usuarios u ON a.usuario_id = u.id
WHERE a.estado = 'activa'
ORDER BY a.fecha_creacion DESC;
```

### **Obtener puntos por categoría:**
```sql
SELECT 
    p.id, p.nombre, p.descripcion,
    p.latitud, p.longitud,
    c.nombre as categoria, c.icono, c.color
FROM puntos p
JOIN categorias c ON p.categoria_id = c.id
ORDER BY c.nombre, p.nombre;
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
    p.id, p.nombre, p.descripcion,
    p.latitud, p.longitud,
    c.nombre as categoria,
    COUNT(f.id) as total_fotos
FROM puntos p
JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN fotos f ON p.id = f.punto_id
GROUP BY p.id, c.nombre
ORDER BY c.nombre, p.nombre;
```

### **Obtener historial de acciones:**
```sql
SELECT 
    h.id, h.accion, h.detalles, h.fecha,
    u.nombre as usuario
FROM historial h
LEFT JOIN usuarios u ON h.usuario_id = u.id
ORDER BY h.fecha DESC
LIMIT 50;
```

### **Obtener operadores disponibles:**
```sql
SELECT 
    id, nombre, email, rol,
    ultima_ubicacion,
    fecha_actualizacion
FROM usuarios
WHERE disponible = true 
AND rol = 'operador'
ORDER BY nombre;
```

---

## 📊 **ÍNDICES RECOMENDADOS**

```sql
-- Índices para mejorar el rendimiento
CREATE INDEX idx_alertas_estado ON alertas(estado);
CREATE INDEX idx_alertas_fecha ON alertas(fecha_creacion);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_disponible ON usuarios(disponible);
CREATE INDEX idx_puntos_categoria ON puntos(categoria_id);
CREATE INDEX idx_fotos_punto ON fotos(punto_id);
CREATE INDEX idx_historial_usuario ON historial(usuario_id);
CREATE INDEX idx_historial_fecha ON historial(fecha);
```

---

## 🔧 **OPERACIONES CRUD TÍPICAS**

### **INSERTAR USUARIO:**
```sql
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES ('Juan Pérez', 'juan@bomberos.com', '$2b$10$...', 'operador')
RETURNING id, nombre, email, rol;
```

### **ACTUALIZAR UBICACIÓN:**
```sql
UPDATE usuarios 
SET ultima_ubicacion = '{"lat": -28.4685, "lng": -65.7789}',
    fecha_actualizacion = CURRENT_TIMESTAMP
WHERE id = 1;
```

### **CREAR ALERTA:**
```sql
INSERT INTO alertas (titulo, descripcion, tipo, prioridad, latitud, longitud, usuario_id)
VALUES ('Incendio en edificio', 'Fuego en el tercer piso', 'incendio_estructural', 'alta', -28.4685, -65.7789, 1)
RETURNING id, titulo, fecha_creacion;
```

### **DAR DE BAJA ALERTA:**
```sql
UPDATE alertas 
SET estado = 'inactiva'
WHERE id = 123;
```

### **AGREGAR PUNTO:**
```sql
INSERT INTO puntos (nombre, descripcion, categoria_id, latitud, longitud)
VALUES ('Hidrante Plaza Central', 'Hidrante principal de la plaza', 1, -28.4685, -65.7789)
RETURNING id, nombre;
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
- **Relaciones:** 4 relaciones principales (1:N)
- **Campos JSONB:** 2 campos (ubicación, historial)
- **Índices:** 8 índices para optimización
- **Tecnología:** PostgreSQL 14+
- **Hosting:** Railway PostgreSQL

---

*Documentación de la base de datos del Sistema de Mapeo de Emergencias*
*Versión: 1.0.0*
