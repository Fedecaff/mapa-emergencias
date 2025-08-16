import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class BaseDeDatos {
    constructor() {
        this.db = null;
        this.conectado = false;
        this.rutaDB = join(__dirname, '../../datos/mapa_emergencias.db');
    }

    async conectar() {
        if (this.conectado && this.db) {
            return this.db;
        }

        // Crear directorio datos si no existe
        const directorioDatos = dirname(this.rutaDB);
        if (!fs.existsSync(directorioDatos)) {
            fs.mkdirSync(directorioDatos, { recursive: true });
        }

        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.rutaDB, (err) => {
                if (err) {
                    console.error('❌ Error conectando a la base de datos:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Conectado a la base de datos SQLite');
                    this.conectado = true;
                    resolve(this.db);
                }
            });
        });
    }

    async ejecutar(sql, parametros = []) {
        await this.conectar();
        return new Promise((resolve, reject) => {
            this.db.run(sql, parametros, function(err) {
                if (err) {
                    console.error('❌ Error ejecutando consulta:', err.message);
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    async obtenerUno(sql, parametros = []) {
        await this.conectar();
        return new Promise((resolve, reject) => {
            this.db.get(sql, parametros, (err, row) => {
                if (err) {
                    console.error('❌ Error obteniendo registro:', err.message);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async obtenerTodos(sql, parametros = []) {
        await this.conectar();
        return new Promise((resolve, reject) => {
            this.db.all(sql, parametros, (err, rows) => {
                if (err) {
                    console.error('❌ Error obteniendo registros:', err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async inicializarTablas() {
        console.log('📋 Inicializando tablas...');
        
        // Tabla usuarios
        await this.ejecutar(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                rol TEXT DEFAULT 'usuario',
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla categorias
        await this.ejecutar(`
            CREATE TABLE IF NOT EXISTS categorias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                descripcion TEXT,
                icono TEXT,
                color TEXT DEFAULT '#007bff',
                campos_personalizados TEXT,
                estado TEXT DEFAULT 'activo',
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla puntos
        await this.ejecutar(`
            CREATE TABLE IF NOT EXISTS puntos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                descripcion TEXT,
                latitud REAL NOT NULL,
                longitud REAL NOT NULL,
                categoria_id INTEGER NOT NULL,
                datos_personalizados TEXT,
                estado TEXT DEFAULT 'activo',
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (categoria_id) REFERENCES categorias (id)
            )
        `);

        // Tabla historial de cambios
        await this.ejecutar(`
            CREATE TABLE IF NOT EXISTS historial_cambios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tabla TEXT NOT NULL,
                registro_id INTEGER NOT NULL,
                accion TEXT NOT NULL,
                datos_anteriores TEXT,
                datos_nuevos TEXT,
                usuario_id INTEGER,
                fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
            )
        `);

        console.log('✅ Tablas inicializadas correctamente');
    }

    async insertarDatosIniciales() {
        console.log('📝 Insertando datos iniciales...');

        // Verificar si ya existen datos
        const categoriasExistentes = await this.obtenerTodos('SELECT COUNT(*) as count FROM categorias');
        if (categoriasExistentes[0].count > 0) {
            console.log('ℹ️ Los datos iniciales ya existen, saltando inserción...');
            return;
        }

        // Insertar categorías por defecto
        const categorias = [
            {
                nombre: 'Hidrantes',
                descripcion: 'Puntos de agua para emergencias',
                icono: 'fa-tint',
                color: '#007bff',
                campos_personalizados: JSON.stringify({
                    'tipo_conexion': 'select',
                    'caudal': 'text',
                    'estado': 'select',
                    'presion': 'text'
                })
            },
            {
                nombre: 'Comisarías',
                descripcion: 'Estaciones de policía',
                icono: 'fa-shield-alt',
                color: '#007bff',
                campos_personalizados: JSON.stringify({
                    'horarios': 'text',
                    'telefono': 'text',
                    'jurisdiccion': 'text'
                })
            },
            {
                nombre: 'Escuelas',
                descripcion: 'Instituciones educativas',
                icono: 'fa-graduation-cap',
                color: '#28a745',
                campos_personalizados: JSON.stringify({
                    'nivel_educativo': 'select',
                    'turnos': 'text',
                    'capacidad': 'text'
                })
            },
            {
                nombre: 'Hospitales',
                descripcion: 'Centros de salud',
                icono: 'fa-hospital',
                color: '#ffc107',
                campos_personalizados: JSON.stringify({
                    'especialidades': 'text',
                    'emergencias': 'select',
                    'horarios': 'text'
                })
            }
        ];

        for (const categoria of categorias) {
            await this.ejecutar(
                'INSERT INTO categorias (nombre, descripcion, icono, color, campos_personalizados) VALUES (?, ?, ?, ?, ?)',
                [categoria.nombre, categoria.descripcion, categoria.icono, categoria.color, categoria.campos_personalizados]
            );
        }

        // Insertar usuario administrador por defecto
        const bcrypt = await import('bcrypt');
        const passwordHash = await bcrypt.hash('admin123', 10);
        
        await this.ejecutar(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            ['Administrador', 'federico.gomez.sc@gmail.com', passwordHash, 'admin']
        );

        // Insertar usuario admin adicional
        const adminPasswordHash = await bcrypt.hash('admin123', 10);
        await this.ejecutar(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            ['Admin', 'admin@test.com', adminPasswordHash, 'admin']
        );

        // Insertar algunos puntos de ejemplo
        const puntosEjemplo = [
            {
                nombre: 'Hidrante Central',
                descripcion: 'Hidrante principal del centro',
                latitud: -28.4691,
                longitud: -65.7795,
                categoria_id: 1,
                datos_personalizados: JSON.stringify({
                    tipo_conexion: 'Roscada',
                    caudal: '1000 L/min',
                    estado: 'Funcionando',
                    presion: '3.5 bar'
                })
            },
            {
                nombre: 'Comisaría Primera',
                descripcion: 'Comisaría del centro de la ciudad',
                latitud: -28.4680,
                longitud: -65.7780,
                categoria_id: 2,
                datos_personalizados: JSON.stringify({
                    horarios: '24 horas',
                    telefono: '0383-4221234',
                    jurisdiccion: 'Centro'
                })
            },
            {
                nombre: 'Escuela Normal',
                descripcion: 'Escuela secundaria pública',
                latitud: -28.4700,
                longitud: -65.7800,
                categoria_id: 3,
                datos_personalizados: JSON.stringify({
                    nivel_educativo: 'Secundario',
                    turnos: 'Mañana y Tarde',
                    capacidad: '800 alumnos'
                })
            },
            {
                nombre: 'Hospital San Juan Bautista',
                descripcion: 'Hospital público principal',
                latitud: -28.4670,
                longitud: -65.7810,
                categoria_id: 4,
                datos_personalizados: JSON.stringify({
                    especialidades: 'Medicina General, Pediatría, Emergencias',
                    emergencias: 'Sí',
                    horarios: '24 horas'
                })
            }
        ];

        for (const punto of puntosEjemplo) {
            await this.ejecutar(
                'INSERT INTO puntos (nombre, descripcion, latitud, longitud, categoria_id, datos_personalizados) VALUES (?, ?, ?, ?, ?, ?)',
                [punto.nombre, punto.descripcion, punto.latitud, punto.longitud, punto.categoria_id, punto.datos_personalizados]
            );
        }

        console.log('✅ Datos iniciales insertados correctamente');
    }

    async cerrar() {
        if (this.db) {
            return new Promise((resolve) => {
                this.db.close((err) => {
                    if (err) {
                        console.error('❌ Error cerrando base de datos:', err.message);
                    } else {
                        console.log('✅ Conexión a base de datos cerrada');
                        this.conectado = false;
                    }
                    resolve();
                });
            });
        }
    }
}

const baseDeDatos = new BaseDeDatos();
export default baseDeDatos;
