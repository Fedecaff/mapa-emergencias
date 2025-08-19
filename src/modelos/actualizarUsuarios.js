import baseDeDatos from './baseDeDatosPostgres.js';
import bcrypt from 'bcrypt';

async function actualizarUsuarios() {
    try {
        console.log('🔄 Actualizando tabla usuarios...');
        
        // Verificar si la columna teléfono existe
        const columnaExiste = await baseDeDatos.obtenerUno(`
            SELECT COUNT(*) as count
            FROM information_schema.columns
            WHERE table_name = 'usuarios'
            AND column_name = 'telefono'
        `);

        if (parseInt(columnaExiste.count) === 0) {
            console.log('📱 Agregando columna teléfono...');
            await baseDeDatos.ejecutar(`
                ALTER TABLE usuarios
                ADD COLUMN telefono VARCHAR(20)
            `);
        }

        // Limpiar todos los usuarios existentes
        console.log('🗑️ Limpiando usuarios existentes...');
        await baseDeDatos.ejecutar('DELETE FROM usuarios');
        
        // Crear usuario Federico con teléfono
        console.log('👤 Creando usuario Federico...');
        const passwordHash = await bcrypt.hash('admin123', 10);
        
        await baseDeDatos.ejecutar(`
            INSERT INTO usuarios (nombre, email, contraseña, telefono, rol)
            VALUES ($1, $2, $3, $4, $5)
        `, ['Federico G.', 'federico.gomez.sc@gmail.com', passwordHash, '+54 9 383 427-6843', 'admin']);
        
        console.log('✅ Usuarios actualizados correctamente');
        
    } catch (error) {
        console.error('❌ Error actualizando usuarios:', error);
        throw error;
    }
}

export default actualizarUsuarios;
