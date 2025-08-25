import baseDeDatos from './baseDeDatosPostgres.js';

async function actualizarGeolocalizacion() {
    const db = baseDeDatos;
    
    try {
        await db.conectar();
        console.log('🔄 Actualizando geolocalización de operadores...');
        
        // Verificar si las columnas ya existen
        const columnasExistentes = await db.obtenerTodos(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'usuarios' 
            AND column_name IN ('latitud', 'longitud', 'ultima_actualizacion_ubicacion')
        `);
        
        const columnasExistentesNombres = columnasExistentes.map(col => col.column_name);
        
        // Agregar columna latitud si no existe
        if (!columnasExistentesNombres.includes('latitud')) {
            console.log('📍 Agregando columna latitud...');
            await db.ejecutar(`
                ALTER TABLE usuarios 
                ADD COLUMN latitud DECIMAL(10, 8)
            `);
            console.log('✅ Columna latitud agregada');
        } else {
            console.log('ℹ️ Columna latitud ya existe');
        }
        
        // Agregar columna longitud si no existe
        if (!columnasExistentesNombres.includes('longitud')) {
            console.log('📍 Agregando columna longitud...');
            await db.ejecutar(`
                ALTER TABLE usuarios 
                ADD COLUMN longitud DECIMAL(11, 8)
            `);
            console.log('✅ Columna longitud agregada');
        } else {
            console.log('ℹ️ Columna longitud ya existe');
        }
        
        // Agregar columna ultima_actualizacion_ubicacion si no existe
        if (!columnasExistentesNombres.includes('ultima_actualizacion_ubicacion')) {
            console.log('⏰ Agregando columna ultima_actualizacion_ubicacion...');
            await db.ejecutar(`
                ALTER TABLE usuarios 
                ADD COLUMN ultima_actualizacion_ubicacion TIMESTAMP
            `);
            console.log('✅ Columna ultima_actualizacion_ubicacion agregada');
        } else {
            console.log('ℹ️ Columna ultima_actualizacion_ubicacion ya existe');
        }
        
        console.log('✅ Geolocalización de operadores actualizada correctamente');
        
    } catch (error) {
        console.error('❌ Error actualizando geolocalización:', error);
        throw error;
    } finally {
        await db.desconectar();
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    actualizarGeolocalizacion()
        .then(() => {
            console.log('🎉 Script completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en el script:', error);
            process.exit(1);
        });
}

export default actualizarGeolocalizacion;
