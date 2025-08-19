import baseDeDatos from './baseDeDatosPostgres.js';

// Script de diagnóstico para verificar persistencia de datos - PRUEBA FINAL
async function diagnosticarBaseDeDatos() {
    console.log('🔍 Iniciando diagnóstico de base de datos...');
    
    try {
        // Conectar a la base de datos
        await baseDeDatos.conectar();
        
        // Verificar conexión
        console.log('✅ Conexión establecida');
        
        // Verificar tablas existentes
        console.log('\n📋 Verificando tablas existentes...');
        const tablas = await baseDeDatos.obtenerTodos(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log('Tablas encontradas:', tablas.map(t => t.table_name));
        
        // Verificar datos en cada tabla
        console.log('\n📊 Verificando datos en tablas...');
        
        // Usuarios
        const usuarios = await baseDeDatos.obtenerTodos('SELECT COUNT(*) as count FROM usuarios');
        console.log(`👥 Usuarios: ${usuarios[0].count}`);
        
        if (parseInt(usuarios[0].count) > 0) {
            const usuariosDetalle = await baseDeDatos.obtenerTodos('SELECT id, nombre, email, rol, disponible FROM usuarios');
            console.log('Detalle de usuarios:', usuariosDetalle);
        }
        
        // Categorías
        const categorias = await baseDeDatos.obtenerTodos('SELECT COUNT(*) as count FROM categorias');
        console.log(`📂 Categorías: ${categorias[0].count}`);
        
        // Puntos
        const puntos = await baseDeDatos.obtenerTodos('SELECT COUNT(*) as count FROM puntos');
        console.log(`📍 Puntos: ${puntos[0].count}`);
        
        // Fotos
        const fotos = await baseDeDatos.obtenerTodos('SELECT COUNT(*) as count FROM fotos_puntos');
        console.log(`📸 Fotos: ${fotos[0].count}`);
        
        // Alertas
        const alertas = await baseDeDatos.obtenerTodos('SELECT COUNT(*) as count FROM alertas_emergencia');
        console.log(`🚨 Alertas: ${alertas[0].count}`);
        
        // Verificar variables de entorno
        console.log('\n🔧 Variables de entorno de base de datos:');
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'No configurada');
        console.log('PGHOST:', process.env.PGHOST || 'No configurada');
        console.log('PGDATABASE:', process.env.PGDATABASE || 'No configurada');
        console.log('NODE_ENV:', process.env.NODE_ENV || 'No configurada');
        
        // Verificar configuración de Railway
        console.log('\n🚂 Verificación Railway:');
        if (process.env.DATABASE_URL) {
            console.log('✅ DATABASE_URL detectada (Railway)');
            const urlParts = process.env.DATABASE_URL.split('@');
            if (urlParts.length > 1) {
                const hostPart = urlParts[1].split('/')[0];
                console.log('Host:', hostPart);
            }
        } else {
            console.log('❌ DATABASE_URL no encontrada');
        }
        
        console.log('\n✅ Diagnóstico completado');
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
    } finally {
        await baseDeDatos.desconectar();
    }
}

// Ejecutar diagnóstico si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    diagnosticarBaseDeDatos();
}

export default diagnosticarBaseDeDatos;
