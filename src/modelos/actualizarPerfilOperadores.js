import BaseDeDatosPostgres from './baseDeDatosPostgres.js';

async function actualizarPerfilOperadores() {
    const db = new BaseDeDatosPostgres();
    
    try {
        await db.conectar();
        console.log('🔄 Actualizando perfil de operadores...');
        
        // Verificar si las columnas ya existen
        const columnasExistentes = await db.obtenerTodos(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'usuarios' 
            AND column_name IN ('foto_perfil', 'institucion', 'rol_institucion')
        `);
        
        const columnasExistentesNombres = columnasExistentes.map(col => col.column_name);
        
        // Agregar columna foto_perfil si no existe
        if (!columnasExistentesNombres.includes('foto_perfil')) {
            console.log('📸 Agregando columna foto_perfil...');
            await db.ejecutar(`
                ALTER TABLE usuarios 
                ADD COLUMN foto_perfil VARCHAR(500)
            `);
            console.log('✅ Columna foto_perfil agregada');
        } else {
            console.log('ℹ️ Columna foto_perfil ya existe');
        }
        
        // Agregar columna institucion si no existe
        if (!columnasExistentesNombres.includes('institucion')) {
            console.log('🏢 Agregando columna institucion...');
            await db.ejecutar(`
                ALTER TABLE usuarios 
                ADD COLUMN institucion VARCHAR(100)
            `);
            console.log('✅ Columna institucion agregada');
        } else {
            console.log('ℹ️ Columna institucion ya existe');
        }
        
        // Agregar columna rol_institucion si no existe
        if (!columnasExistentesNombres.includes('rol_institucion')) {
            console.log('👤 Agregando columna rol_institucion...');
            await db.ejecutar(`
                ALTER TABLE usuarios 
                ADD COLUMN rol_institucion VARCHAR(50)
            `);
            console.log('✅ Columna rol_institucion agregada');
        } else {
            console.log('ℹ️ Columna rol_institucion ya existe');
        }
        
        console.log('✅ Perfil de operadores actualizado correctamente');
        
    } catch (error) {
        console.error('❌ Error actualizando perfil de operadores:', error);
        throw error;
    } finally {
        await db.desconectar();
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    actualizarPerfilOperadores()
        .then(() => {
            console.log('🎉 Script completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en el script:', error);
            process.exit(1);
        });
}

export default actualizarPerfilOperadores;
