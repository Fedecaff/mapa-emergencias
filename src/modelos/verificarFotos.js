import baseDeDatos from './baseDeDatosPostgres.js';

async function verificarFotos() {
    try {
        console.log('🔍 Verificando estado de fotos en la base de datos...');
        
        // Contar total de fotos
        const totalFotos = await baseDeDatos.obtenerUno('SELECT COUNT(*) as count FROM fotos_puntos');
        console.log(`📊 Total de fotos en la base de datos: ${totalFotos.count}`);
        
        // Obtener algunas fotos de ejemplo
        const fotosEjemplo = await baseDeDatos.obtenerTodos(`
            SELECT f.id, f.punto_id, f.nombre_archivo, f.ruta_archivo, f.public_id, f.fecha_subida,
                   p.nombre as punto_nombre
            FROM fotos_puntos f
            LEFT JOIN puntos p ON f.punto_id = p.id
            ORDER BY f.fecha_subida DESC
            LIMIT 5
        `);
        
        console.log('📸 Fotos de ejemplo:');
        fotosEjemplo.forEach(foto => {
            console.log(`  - ID: ${foto.id}, Punto: ${foto.punto_nombre} (${foto.punto_id})`);
            console.log(`    Archivo: ${foto.nombre_archivo}`);
            console.log(`    URL: ${foto.ruta_archivo ? foto.ruta_archivo.substring(0, 50) + '...' : 'NULL'}`);
            console.log(`    Public ID: ${foto.public_id || 'NULL'}`);
            console.log(`    Fecha: ${foto.fecha_subida}`);
            console.log('');
        });
        
        // Verificar fotos sin URL
        const fotosSinUrl = await baseDeDatos.obtenerTodos(`
            SELECT COUNT(*) as count 
            FROM fotos_puntos 
            WHERE ruta_archivo IS NULL OR ruta_archivo = ''
        `);
        console.log(`⚠️ Fotos sin URL: ${fotosSinUrl[0].count}`);
        
        // Verificar fotos sin public_id
        const fotosSinPublicId = await baseDeDatos.obtenerTodos(`
            SELECT COUNT(*) as count 
            FROM fotos_puntos 
            WHERE public_id IS NULL OR public_id = ''
        `);
        console.log(`⚠️ Fotos sin public_id: ${fotosSinPublicId[0].count}`);
        
        // Verificar si las URLs de Cloudinary siguen siendo válidas
        if (fotosEjemplo.length > 0) {
            console.log('🔍 Verificando URLs de Cloudinary...');
            for (const foto of fotosEjemplo) {
                if (foto.ruta_archivo && foto.ruta_archivo.includes('cloudinary')) {
                    try {
                        const response = await fetch(foto.ruta_archivo, { method: 'HEAD' });
                        console.log(`  - Foto ${foto.id}: ${response.ok ? '✅ URL válida' : '❌ URL inválida'} (${response.status})`);
                    } catch (error) {
                        console.log(`  - Foto ${foto.id}: ❌ Error verificando URL - ${error.message}`);
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error verificando fotos:', error);
    }
}

export default verificarFotos;
