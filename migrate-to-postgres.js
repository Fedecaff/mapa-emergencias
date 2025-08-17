import 'dotenv/config';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import baseDeDatosPostgres from './src/modelos/baseDeDatosPostgres.js';

async function migrarDatos() {
    console.log('🔄 Iniciando migración de SQLite a PostgreSQL...');
    
    try {
        // Conectar a PostgreSQL
        await baseDeDatosPostgres.conectar();
        
        // Conectar a SQLite
        const db = await open({
            filename: './datos/mapa_emergencias.db',
            driver: sqlite3.Database
        });
        
        console.log('✅ Conectado a ambas bases de datos');
        
        // Migrar usuarios
        console.log('📝 Migrando usuarios...');
        const usuarios = await db.all('SELECT * FROM usuarios');
        for (const usuario of usuarios) {
            await baseDeDatosPostgres.ejecutar(
                'INSERT INTO usuarios (nombre, email, password, rol, fecha_creacion) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
                [usuario.nombre, usuario.email, usuario.password, usuario.rol, usuario.fecha_creacion]
            );
        }
        console.log(`✅ ${usuarios.length} usuarios migrados`);
        
        // Migrar categorías
        console.log('📝 Migrando categorías...');
        const categorias = await db.all('SELECT * FROM categorias');
        for (const categoria of categorias) {
            const camposPersonalizados = JSON.parse(categoria.campos_personalizados || '{}');
            await baseDeDatosPostgres.ejecutar(
                'INSERT INTO categorias (nombre, descripcion, icono, color, campos_personalizados, estado, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
                [categoria.nombre, categoria.descripcion, categoria.icono, categoria.color, camposPersonalizados, categoria.estado, categoria.fecha_creacion]
            );
        }
        console.log(`✅ ${categorias.length} categorías migradas`);
        
        // Migrar puntos
        console.log('📝 Migrando puntos...');
        const puntos = await db.all('SELECT * FROM puntos');
        for (const punto of puntos) {
            const datosPersonalizados = JSON.parse(punto.datos_personalizados || '{}');
            await baseDeDatosPostgres.ejecutar(
                'INSERT INTO puntos (nombre, descripcion, latitud, longitud, categoria_id, datos_personalizados, estado, fecha_creacion, fecha_actualizacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
                [punto.nombre, punto.descripcion, punto.latitud, punto.longitud, punto.categoria_id, datosPersonalizados, punto.estado, punto.fecha_creacion, punto.fecha_actualizacion]
            );
        }
        console.log(`✅ ${puntos.length} puntos migrados`);
        
        // Migrar historial
        console.log('📝 Migrando historial...');
        const historial = await db.all('SELECT * FROM historial_cambios');
        for (const cambio of historial) {
            const datosAnteriores = cambio.datos_anteriores ? JSON.parse(cambio.datos_anteriores) : null;
            const datosNuevos = cambio.datos_nuevos ? JSON.parse(cambio.datos_nuevos) : null;
            await baseDeDatosPostgres.ejecutar(
                'INSERT INTO historial_cambios (tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id, fecha_cambio) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
                [cambio.tabla, cambio.registro_id, cambio.accion, datosAnteriores, datosNuevos, cambio.usuario_id, cambio.fecha_cambio]
            );
        }
        console.log(`✅ ${historial.length} registros de historial migrados`);
        
        // Cerrar conexiones
        await db.close();
        await baseDeDatosPostgres.desconectar();
        
        console.log('🎉 Migración completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

// Solo ejecutar si hay datos en SQLite
async function verificarDatosSQLite() {
    try {
        const db = await open({
            filename: './datos/mapa_emergencias.db',
            driver: sqlite3.Database
        });
        
        const count = await db.get('SELECT COUNT(*) as total FROM usuarios');
        await db.close();
        
        if (count.total > 0) {
            console.log(`📊 Encontrados ${count.total} usuarios en SQLite. Iniciando migración...`);
            await migrarDatos();
        } else {
            console.log('ℹ️ No hay datos en SQLite. Saltando migración.');
        }
    } catch (error) {
        console.log('ℹ️ No se encontró base de datos SQLite. Saltando migración.');
    }
}

verificarDatosSQLite();
