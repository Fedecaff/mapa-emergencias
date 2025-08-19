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

        // Agregar columna telefono si no existe
        await baseDeDatos.ejecutar(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS telefono VARCHAR(20)
        `);

        // Agregar columna disponible si no existe
        await baseDeDatos.ejecutar(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS disponible BOOLEAN DEFAULT true
        `);

        // Verificar si el usuario Federico ya existe
        const federicoExiste = await baseDeDatos.obtenerUno(`
            SELECT id FROM usuarios WHERE email = 'federico.gomez.sc@gmail.com'
        `);
        
        if (!federicoExiste) {
            // Solo crear usuario Federico si no existe
            console.log('👤 Creando usuario Federico...');
            const passwordHash = await bcrypt.hash('admin123', 10);
            
            await baseDeDatos.ejecutar(`
                INSERT INTO usuarios (nombre, email, contraseña, telefono, rol)
                VALUES ($1, $2, $3, $4, $5)
            `, ['Federico G.', 'federico.gomez.sc@gmail.com', passwordHash, '+54 9 383 427-6843', 'admin']);
        } else {
            console.log('ℹ️ Usuario Federico ya existe, saltando creación...');
        }
        
        console.log('✅ Usuarios actualizados correctamente');
        
    } catch (error) {
        console.error('❌ Error actualizando usuarios:', error);
        throw error;
    }
}

export default actualizarUsuarios;
