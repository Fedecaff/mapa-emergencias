import baseDeDatos from './baseDeDatosPostgres.js';

async function verificarRoles() {
    try {
        console.log('🔍 Verificando roles de usuarios...');
        
        // Obtener todos los usuarios
        const usuarios = await baseDeDatos.obtenerTodos(`
            SELECT id, nombre, email, rol, disponible 
            FROM usuarios 
            ORDER BY rol, nombre
        `);
        
        console.log('📊 Usuarios encontrados:');
        usuarios.forEach(usuario => {
            console.log(`  - ${usuario.nombre} (${usuario.email}): ${usuario.rol} - Disponible: ${usuario.disponible}`);
        });
        
        // Contar por rol
        const conteoRoles = {};
        usuarios.forEach(usuario => {
            conteoRoles[usuario.rol] = (conteoRoles[usuario.rol] || 0) + 1;
        });
        
        console.log('📈 Conteo por roles:');
        Object.entries(conteoRoles).forEach(([rol, cantidad]) => {
            console.log(`  - ${rol}: ${cantidad} usuarios`);
        });
        
        // Verificar si hay roles antiguos
        const rolesAntiguos = usuarios.filter(u => u.rol === 'admin' || u.rol === 'usuario');
        if (rolesAntiguos.length > 0) {
            console.log('⚠️ Usuarios con roles antiguos encontrados:');
            rolesAntiguos.forEach(usuario => {
                console.log(`  - ${usuario.nombre}: ${usuario.rol} → necesita actualización`);
            });
        } else {
            console.log('✅ Todos los usuarios tienen roles actualizados');
        }
        
    } catch (error) {
        console.error('❌ Error verificando roles:', error);
        throw error;
    }
}

export default verificarRoles;
