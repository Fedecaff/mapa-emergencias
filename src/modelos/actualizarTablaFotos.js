import baseDeDatos from './baseDeDatosPostgres.js';

async function actualizarTablaFotos() {
    try {
        console.log('🔄 Actualizando tabla fotos_puntos...');
        
        // Verificar si la columna public_id existe
        const columnaExiste = await baseDeDatos.obtenerUno(`
            SELECT COUNT(*) as count 
            FROM information_schema.columns 
            WHERE table_name = 'fotos_puntos' 
            AND column_name = 'public_id'
        `);
        
        if (parseInt(columnaExiste.count) === 0) {
            console.log('➕ Agregando columna public_id...');
            await baseDeDatos.ejecutar(`
                ALTER TABLE fotos_puntos 
                ADD COLUMN public_id VARCHAR(255)
            `);
            console.log('✅ Columna public_id agregada exitosamente');
        } else {
            console.log('ℹ️ La columna public_id ya existe');
        }
        
        console.log('✅ Tabla fotos_puntos actualizada correctamente');
        
    } catch (error) {
        console.error('❌ Error actualizando tabla:', error);
        throw error;
    }
}

export default actualizarTablaFotos;
