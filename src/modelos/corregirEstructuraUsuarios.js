import baseDeDatos from './baseDeDatosPostgres.js';

async function corregirEstructuraUsuarios() {
    try {
        console.log('🔄 Verificando estructura de tabla usuarios...');
        
        // Verificar si existe la columna 'contraseña'
        const columnaContraseña = await baseDeDatos.obtenerUno(`
            SELECT COUNT(*) as count
            FROM information_schema.columns
            WHERE table_name = 'usuarios'
            AND column_name = 'contraseña'
        `);

        // Verificar si existe la columna 'password'
        const columnaPassword = await baseDeDatos.obtenerUno(`
            SELECT COUNT(*) as count
            FROM information_schema.columns
            WHERE table_name = 'usuarios'
            AND column_name = 'password'
        `);

        console.log('📊 Estado de columnas:', {
            contraseña: parseInt(columnaContraseña.count),
            password: parseInt(columnaPassword.count)
        });

        // Si existe 'contraseña' pero no 'password', renombrar
        if (parseInt(columnaContraseña.count) > 0 && parseInt(columnaPassword.count) === 0) {
            console.log('🔄 Renombrando columna "contraseña" a "password"...');
            await baseDeDatos.ejecutar(`
                ALTER TABLE usuarios 
                RENAME COLUMN contraseña TO password
            `);
            console.log('✅ Columna renombrada correctamente');
        } else if (parseInt(columnaPassword.count) > 0) {
            console.log('✅ Columna "password" ya existe');
        } else {
            console.log('⚠️ No se encontró ninguna columna de contraseña');
        }
        
        console.log('✅ Estructura de usuarios verificada correctamente');
        
    } catch (error) {
        console.error('❌ Error corrigiendo estructura de usuarios:', error);
        throw error;
    }
}

export default corregirEstructuraUsuarios;
