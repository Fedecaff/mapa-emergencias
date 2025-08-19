import baseDeDatos from './baseDeDatosPostgres.js';

async function actualizarTablaAlertas() {
    try {
        console.log('🔧 Verificando tabla alertas_emergencia...');
        
        // Verificar si la tabla existe
        const tablaExiste = await baseDeDatos.obtenerUno(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'alertas_emergencia'
        `);
        
        if (parseInt(tablaExiste.count) === 0) {
            console.log('📋 Creando tabla alertas_emergencia...');
            
            // Crear tabla alertas_emergencia
            await baseDeDatos.ejecutar(`
                CREATE TABLE IF NOT EXISTS alertas_emergencia (
                    id SERIAL PRIMARY KEY,
                    tipo VARCHAR(50) NOT NULL,
                    prioridad VARCHAR(20) NOT NULL DEFAULT 'media',
                    titulo VARCHAR(255) NOT NULL,
                    descripcion TEXT,
                    latitud DECIMAL(10, 8) NOT NULL,
                    longitud DECIMAL(11, 8) NOT NULL,
                    direccion TEXT,
                    personas_afectadas INTEGER DEFAULT 0,
                    riesgos_especificos TEXT,
                    concurrencia_solicitada INTEGER DEFAULT 1,
                    estado VARCHAR(20) DEFAULT 'activa',
                    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
                    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Crear índices
            await baseDeDatos.ejecutar(`
                CREATE INDEX IF NOT EXISTS idx_alertas_estado ON alertas_emergencia(estado);
                CREATE INDEX IF NOT EXISTS idx_alertas_fecha ON alertas_emergencia(fecha_creacion);
                CREATE INDEX IF NOT EXISTS idx_alertas_usuario ON alertas_emergencia(usuario_id);
            `);
            
            console.log('✅ Tabla alertas_emergencia creada correctamente');
        } else {
            console.log('ℹ️ Tabla alertas_emergencia ya existe');
        }
        
    } catch (error) {
        console.error('❌ Error actualizando tabla alertas:', error);
        throw error;
    }
}

export default actualizarTablaAlertas;
