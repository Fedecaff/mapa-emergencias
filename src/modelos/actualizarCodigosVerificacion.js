import baseDeDatos from './baseDeDatosPostgres.js';

async function actualizarCodigosVerificacion() {
    const db = baseDeDatos;
    
    try {
        await db.conectar();
        console.log('🔄 Verificando tabla de códigos de verificación...');
        
        // Verificar si la tabla ya existe
        const tablaExistente = await db.obtenerUno(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'codigos_verificacion'
        `);
        
        if (!tablaExistente) {
            console.log('🔄 Creando tabla de códigos de verificación...');
            await db.ejecutar(`
                CREATE TABLE codigos_verificacion (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) NOT NULL,
                    codigo VARCHAR(6) NOT NULL,
                    expira_en TIMESTAMP NOT NULL,
                    usado BOOLEAN DEFAULT FALSE,
                    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Tabla de códigos de verificación creada exitosamente');
        } else {
            console.log('ℹ️ La tabla de códigos de verificación ya existe');
        }
        
        console.log('✅ Verificación completada');
        
    } catch (error) {
        console.error('❌ Error verificando códigos de verificación:', error);
        throw error;
    } finally {
        await db.desconectar();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    actualizarCodigosVerificacion()
        .then(() => {
            console.log('🎉 Script completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en el script:', error);
            process.exit(1);
        });
}

export default actualizarCodigosVerificacion;
