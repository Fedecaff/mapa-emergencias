import baseDeDatos from './baseDeDatosPostgres.js';

async function actualizarCampoEmail() {
    const db = baseDeDatos;
    
    try {
        await db.conectar();
        console.log('🔄 Actualizando campo email_verificado...');
        
        // Verificar si el campo ya existe
        const campoExistente = await db.obtenerUno(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'usuarios' 
            AND column_name = 'email_verificado'
        `);
        
        if (!campoExistente) {
            console.log('🔄 Agregando campo email_verificado...');
            await db.ejecutar(`
                ALTER TABLE usuarios 
                ADD COLUMN email_verificado BOOLEAN DEFAULT FALSE
            `);
            console.log('✅ Campo email_verificado agregado exitosamente');
        } else {
            console.log('ℹ️ El campo email_verificado ya existe');
        }
        
        console.log('✅ Actualización completada');
        
    } catch (error) {
        console.error('❌ Error actualizando campo email_verificado:', error);
        throw error;
    } finally {
        await db.desconectar();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    actualizarCampoEmail()
        .then(() => {
            console.log('🎉 Script completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en el script:', error);
            process.exit(1);
        });
}

export default actualizarCampoEmail;

