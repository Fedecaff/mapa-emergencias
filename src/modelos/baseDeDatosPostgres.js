import pg from 'pg';

const { Pool } = pg;

class BaseDeDatosPostgres {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    async conectar() {
        try {
            // Configuración para Railway PostgreSQL
            const config = {
                host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
                port: process.env.PGPORT || process.env.DB_PORT || 5432,
                database: process.env.PGDATABASE || process.env.DB_NAME || 'mapa_emergencias',
                user: process.env.PGUSER || process.env.DB_USER || 'postgres',
                password: process.env.PGPASSWORD || process.env.DB_PASSWORD || 'password',
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
                max: 20, // Máximo número de conexiones
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            };
            
            // Si tenemos DATABASE_URL, usarla (Railway la proporciona)
            if (process.env.DATABASE_URL) {
                this.pool = new Pool({
                    connectionString: process.env.DATABASE_URL,
                    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
                    max: 20,
                    idleTimeoutMillis: 30000,
                    connectionTimeoutMillis: 2000,
                });
            } else {
                this.pool = new Pool(config);
            }
            
            // Probar conexión
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            
            this.isConnected = true;
            console.log('✅ Conectado a PostgreSQL');
            
        } catch (error) {
            console.error('❌ Error conectando a PostgreSQL:', error);
            throw error;
        }
    }

    async desconectar() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            console.log('🔌 Desconectado de PostgreSQL');
        }
    }

    async ejecutar(query, parametros = []) {
        if (!this.isConnected) {
            await this.conectar();
        }

        try {
            const client = await this.pool.connect();
            const resultado = await client.query(query, parametros);
            client.release();
            return resultado;
        } catch (error) {
            console.error('❌ Error ejecutando query:', error);
            throw error;
        }
    }

    async obtenerUno(query, parametros = []) {
        const resultado = await this.ejecutar(query, parametros);
        return resultado.rows[0] || null;
    }

    async obtenerTodos(query, parametros = []) {
        const resultado = await this.ejecutar(query, parametros);
        return resultado.rows;
    }

    async inicializarTablas() {
        console.log('📋 Inicializando tablas en PostgreSQL...');
        
        // Verificar si las tablas ya existen
        const tablasExistentes = await this.obtenerUno(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('usuarios', 'categorias', 'puntos', 'historial_cambios', 'fotos_puntos')
        `);
        
        if (parseInt(tablasExistentes.count) === 5) {
            console.log('ℹ️ Las tablas ya existen, saltando creación...');
            return;
        }
        
        console.log('🔄 Creando tablas...');
        
        // Tabla usuarios
        await this.ejecutar(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                contraseña VARCHAR(255) NOT NULL,
                telefono VARCHAR(20),
                rol VARCHAR(50) DEFAULT 'usuario',
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla categorias
        await this.ejecutar(`
            CREATE TABLE IF NOT EXISTS categorias (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                icono VARCHAR(100),
                color VARCHAR(7) DEFAULT '#007bff',
                campos_personalizados JSONB,
                estado VARCHAR(50) DEFAULT 'activo',
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla puntos
        await this.ejecutar(`
            CREATE TABLE IF NOT EXISTS puntos (
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
            )
        `);
        
        // Tabla historial de cambios
        await this.ejecutar(`
            CREATE TABLE IF NOT EXISTS historial_cambios (
                id SERIAL PRIMARY KEY,
                tabla VARCHAR(100) NOT NULL,
                registro_id INTEGER NOT NULL,
                accion VARCHAR(50) NOT NULL,
                datos_anteriores JSONB,
                datos_nuevos JSONB,
                usuario_id INTEGER REFERENCES usuarios(id),
                fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla fotos de puntos
        await this.ejecutar(`
            CREATE TABLE IF NOT EXISTS fotos_puntos (
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
            )
        `);

        // Índices para mejor rendimiento
        await this.ejecutar(`
            CREATE INDEX IF NOT EXISTS idx_puntos_categoria ON puntos(categoria_id);
            CREATE INDEX IF NOT EXISTS idx_puntos_estado ON puntos(estado);
            CREATE INDEX IF NOT EXISTS idx_historial_tabla ON historial_cambios(tabla);
            CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_cambios(fecha_cambio);
            CREATE INDEX IF NOT EXISTS idx_fotos_punto ON fotos_puntos(punto_id);
            CREATE INDEX IF NOT EXISTS idx_fotos_usuario ON fotos_puntos(usuario_id);
        `);

        console.log('✅ Tablas inicializadas correctamente en PostgreSQL');
    }

    async insertarDatosIniciales() {
        console.log('📝 Insertando datos iniciales en PostgreSQL...');

        // Verificar si ya existen usuarios
        const usuariosExistentes = await this.obtenerUno('SELECT COUNT(*) as count FROM usuarios');
        if (parseInt(usuariosExistentes.count) > 0) {
            console.log('ℹ️ Los usuarios ya existen, saltando inserción...');
            return;
        }

        // Insertar categorías por defecto
        const categorias = [
            {
                nombre: 'Hidrantes',
                descripcion: 'Puntos de agua para emergencias',
                icono: 'fa-tint',
                color: '#007bff',
                campos_personalizados: {
                    'tipo_conexion': 'text',
                    'caudal': 'text',
                    'estado': 'text',
                    'presion': 'text'
                }
            },
            {
                nombre: 'Comisarías',
                descripcion: 'Estaciones de policía',
                icono: 'fa-shield-alt',
                color: '#007bff',
                campos_personalizados: {
                    'horarios': 'text',
                    'telefono': 'text',
                    'jurisdiccion': 'text'
                }
            },
            {
                nombre: 'Escuelas',
                descripcion: 'Instituciones educativas',
                icono: 'fa-graduation-cap',
                color: '#28a745',
                campos_personalizados: {
                    'nivel_educativo': 'text',
                    'turnos': 'text',
                    'capacidad': 'text'
                }
            },
            {
                nombre: 'Hospitales',
                descripcion: 'Centros de salud',
                icono: 'fa-hospital',
                color: '#ffc107',
                campos_personalizados: {
                    'especialidades': 'text',
                    'emergencias': 'text',
                    'horarios': 'text'
                }
            }
        ];

        for (const categoria of categorias) {
            await this.ejecutar(
                'INSERT INTO categorias (nombre, descripcion, icono, color, campos_personalizados) VALUES ($1, $2, $3, $4, $5)',
                [categoria.nombre, categoria.descripcion, categoria.icono, categoria.color, categoria.campos_personalizados]
            );
        }

        // Insertar usuario administrador por defecto
        const bcrypt = await import('bcrypt');
        const passwordHash = await bcrypt.hash('admin123', 10);
        
        await this.ejecutar(
            'INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES ($1, $2, $3, $4)',
            ['Administrador', 'federico.gomez.sc@gmail.com', passwordHash, 'admin']
        );

        // Insertar usuario admin adicional
        const adminPasswordHash = await bcrypt.hash('admin123', 10);
        await this.ejecutar(
            'INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES ($1, $2, $3, $4)',
            ['Admin', 'admin@test.com', adminPasswordHash, 'admin']
        );

        console.log('✅ Datos iniciales insertados correctamente en PostgreSQL');
    }
}

// Crear y exportar una instancia única
const baseDeDatosPostgres = new BaseDeDatosPostgres();
export default baseDeDatosPostgres;
