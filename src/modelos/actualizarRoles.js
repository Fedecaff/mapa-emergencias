import baseDeDatos from './baseDeDatosPostgres.js';

async function actualizarRoles() {
    try {
        console.log('🔄 Actualizando roles de usuarios...');
        
        // Actualizar admin a administrador
        const resultadoAdmin = await baseDeDatos.ejecutar(`
            UPDATE usuarios 
            SET rol = 'administrador' 
            WHERE rol = 'admin'
        `);
        console.log('✅ Roles de administrador actualizados');
        
        // Actualizar usuario a operador
        const resultadoOperador = await baseDeDatos.ejecutar(`
            UPDATE usuarios 
            SET rol = 'operador' 
            WHERE rol = 'usuario'
        `);
        console.log('✅ Roles de operador actualizados');
        
        // Verificar cambios
        const usuarios = await baseDeDatos.obtenerTodos(`
            SELECT id, nombre, email, rol 
            FROM usuarios 
            ORDER BY rol, nombre
        `);
        
        console.log('📊 Usuarios después de la actualización:');
        usuarios.forEach(usuario => {
            console.log(`  - ${usuario.nombre} (${usuario.email}): ${usuario.rol}`);
        });
        
        console.log('✅ Actualización de roles completada');
        
    } catch (error) {
        console.error('❌ Error actualizando roles:', error);
        throw error;
    }
}

export default actualizarRoles;
