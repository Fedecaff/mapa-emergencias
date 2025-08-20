import baseDeDatos from './baseDeDatosPostgres.js';

async function actualizarTablaAlertas() {
    try {
        console.log('🔧 Verificando tabla alertas_emergencia...');
        
        // Verificar si la tabla existe
        const tablaExiste = await baseDeDatos.obtenerUno(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'alertas_emergencia'
            );
        `);
        
        if (!tablaExiste.exists) {
            console.log('📋 Creando tabla alertas_emergencia...');
            await baseDeDatos.ejecutar(`
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
                    usuario_id INTEGER REFERENCES usuarios(id),
                    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log('✅ Tabla alertas_emergencia creada');
        } else {
            console.log('ℹ️ Tabla alertas_emergencia ya existe');
        }
        
        // Verificar el tipo de la columna concurrencia_solicitada
        const columnaInfo = await baseDeDatos.obtenerUno(`
            SELECT data_type, character_maximum_length
            FROM information_schema.columns 
            WHERE table_name = 'alertas_emergencia' 
            AND column_name = 'concurrencia_solicitada';
        `);
        
        if (columnaInfo) {
            console.log(`📊 Tipo actual de concurrencia_solicitada: ${columnaInfo.data_type}`);
            
            // Si es INTEGER, cambiarlo a VARCHAR(10)
            if (columnaInfo.data_type === 'integer') {
                console.log('🔄 Cambiando tipo de concurrencia_solicitada de INTEGER a VARCHAR(10)...');
                await baseDeDatos.ejecutar(`
                    ALTER TABLE alertas_emergencia 
                    ALTER COLUMN concurrencia_solicitada TYPE VARCHAR(10);
                `);
                console.log('✅ Tipo de columna actualizado correctamente');
            } else {
                console.log('ℹ️ La columna ya tiene el tipo correcto');
            }
        }
        
        // Crear índices si no existen
        console.log('🔍 Verificando índices...');
        await baseDeDatos.ejecutar(`
            CREATE INDEX IF NOT EXISTS idx_alertas_estado ON alertas_emergencia(estado);
        `);
        await baseDeDatos.ejecutar(`
            CREATE INDEX IF NOT EXISTS idx_alertas_prioridad ON alertas_emergencia(prioridad);
        `);
        await baseDeDatos.ejecutar(`
            CREATE INDEX IF NOT EXISTS idx_alertas_fecha ON alertas_emergencia(fecha_creacion);
        `);
        console.log('✅ Índices verificados/creados');
        
        console.log('✅ Tabla alertas_emergencia actualizada correctamente');
        
    } catch (error) {
        console.error('❌ Error actualizando tabla alertas_emergencia:', error);
        throw error;
    }
}

export default actualizarTablaAlertas;
