import baseDeDatos from './baseDeDatosPostgres.js';

async function actualizarCampoFoto() {
    const db = baseDeDatos;
    
    try {
        await db.conectar();
        console.log('🔄 Actualizando campo foto_perfil...');
        
        // Verificar el tipo actual del campo
        const tipoActual = await db.obtenerUno(`
            SELECT data_type, character_maximum_length
            FROM information_schema.columns 
            WHERE table_name = 'usuarios' 
            AND column_name = 'foto_perfil'
        `);
        
        console.log('📋 Tipo actual del campo foto_perfil:', tipoActual);
        
        if (tipoActual && tipoActual.data_type === 'character varying' && tipoActual.character_maximum_length === 500) {
            console.log('🔄 Cambiando tipo de campo de VARCHAR(500) a TEXT...');
            await db.ejecutar(`
                ALTER TABLE usuarios 
                ALTER COLUMN foto_perfil TYPE TEXT
            `);
            console.log('✅ Campo foto_perfil cambiado a TEXT exitosamente');
        } else {
            console.log('ℹ️ El campo foto_perfil ya es de tipo TEXT o no existe');
        }
        
        console.log('✅ Actualización completada');
        
    } catch (error) {
        console.error('❌ Error actualizando campo foto_perfil:', error);
        throw error;
    } finally {
        await db.desconectar();
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    actualizarCampoFoto()
        .then(() => {
            console.log('🎉 Script completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en el script:', error);
            process.exit(1);
        });
}

export default actualizarCampoFoto;
