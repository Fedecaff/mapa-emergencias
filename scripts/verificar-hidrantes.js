import baseDeDatos from '../src/modelos/baseDeDatosPostgres.js';

class VerificadorHidrantes {
    constructor() {
        this.categoriaHidrantesId = 1;
    }

    // Verificar hidrantes en la base de datos
    async verificarHidrantes() {
        try {
            console.log('🔍 VERIFICANDO HIDRANTES EN LA BASE DE DATOS');
            console.log('============================================');

            // 1. Contar hidrantes totales
            const count = await baseDeDatos.obtenerUno(
                'SELECT COUNT(*) as total FROM puntos WHERE categoria_id = $1',
                [this.categoriaHidrantesId]
            );

            console.log(`📊 Total de hidrantes en BD: ${count.total}`);

            // 2. Verificar hidrantes activos
            const countActivos = await baseDeDatos.obtenerUno(
                'SELECT COUNT(*) as total FROM puntos WHERE categoria_id = $1 AND estado = $2',
                [this.categoriaHidrantesId, 'activo']
            );

            console.log(`✅ Hidrantes activos: ${countActivos.total}`);

            // 3. Verificar hidrantes inactivos
            const countInactivos = await baseDeDatos.obtenerUno(
                'SELECT COUNT(*) as total FROM puntos WHERE categoria_id = $1 AND estado = $2',
                [this.categoriaHidrantesId, 'inactivo']
            );

            console.log(`❌ Hidrantes inactivos: ${countInactivos.total}`);

            // 4. Mostrar algunos ejemplos
            const ejemplos = await baseDeDatos.obtenerTodos(
                'SELECT id, nombre, latitud, longitud, estado, datos_personalizados FROM puntos WHERE categoria_id = $1 LIMIT 5',
                [this.categoriaHidrantesId]
            );

            console.log('\n📋 EJEMPLOS DE HIDRANTES:');
            console.log('==========================');
            ejemplos.forEach((hidrante, index) => {
                console.log(`${index + 1}. ID: ${hidrante.id}`);
                console.log(`   Nombre: ${hidrante.nombre}`);
                console.log(`   Coordenadas: (${hidrante.latitud}, ${hidrante.longitud})`);
                console.log(`   Estado: ${hidrante.estado}`);
                console.log(`   Datos: ${hidrante.datos_personalizados}`);
                console.log('');
            });

            // 5. Verificar categoría
            const categoria = await baseDeDatos.obtenerUno(
                'SELECT * FROM categorias WHERE id = $1',
                [this.categoriaHidrantesId]
            );

            console.log('🏷️  CATEGORÍA HIDRANTES:');
            console.log('========================');
            console.log(`ID: ${categoria.id}`);
            console.log(`Nombre: ${categoria.nombre}`);
            console.log(`Icono: ${categoria.icono}`);
            console.log(`Color: ${categoria.color}`);
            console.log(`Estado: ${categoria.estado || 'activo'}`);

            // 6. Verificar si hay problemas de coordenadas
            const coordenadasInvalidas = await baseDeDatos.obtenerTodos(
                'SELECT id, nombre, latitud, longitud FROM puntos WHERE categoria_id = $1 AND (latitud IS NULL OR longitud IS NULL OR latitud = 0 OR longitud = 0)',
                [this.categoriaHidrantesId]
            );

            if (coordenadasInvalidas.length > 0) {
                console.log('\n⚠️  HIDRANTES CON COORDENADAS INVÁLIDAS:');
                console.log('==========================================');
                coordenadasInvalidas.forEach(hidrante => {
                    console.log(`ID: ${hidrante.id}, Nombre: ${hidrante.nombre}, Coord: (${hidrante.latitud}, ${hidrante.longitud})`);
                });
            } else {
                console.log('\n✅ Todas las coordenadas son válidas');
            }

            return {
                total: parseInt(count.total),
                activos: parseInt(countActivos.total),
                inactivos: parseInt(countInactivos.total),
                categoria: categoria,
                ejemplos: ejemplos
            };

        } catch (error) {
            console.error('❌ Error verificando hidrantes:', error);
            throw error;
        }
    }

    // Verificar API de puntos
    async verificarAPI() {
        try {
            console.log('\n🌐 VERIFICANDO API DE PUNTOS');
            console.log('============================');

            // Simular llamada a la API
            const puntos = await baseDeDatos.obtenerTodos(`
                SELECT p.*, c.nombre as categoria_nombre, c.icono, c.color 
                FROM puntos p 
                JOIN categorias c ON p.categoria_id = c.id 
                WHERE p.estado = 'activo' AND p.categoria_id = $1
                ORDER BY p.nombre
                LIMIT 10
            `, [this.categoriaHidrantesId]);

            console.log(`📡 Puntos disponibles en API: ${puntos.length}`);
            
            if (puntos.length > 0) {
                console.log('\n📋 EJEMPLOS DE API:');
                puntos.slice(0, 3).forEach((punto, index) => {
                    console.log(`${index + 1}. ${punto.nombre} - ${punto.categoria_nombre}`);
                    console.log(`   Coord: (${punto.latitud}, ${punto.longitud})`);
                    console.log(`   Icono: ${punto.icono}, Color: ${punto.color}`);
                });
            }

            return puntos;
        } catch (error) {
            console.error('❌ Error verificando API:', error);
            throw error;
        }
    }

    // Ejecutar verificación completa
    async ejecutar() {
        try {
            await this.verificarHidrantes();
            await this.verificarAPI();

            console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
            console.log('==========================');
            console.log('Si los hidrantes están en la BD pero no se ven en el mapa:');
            console.log('1. Verifica que el frontend esté cargando la categoría correcta');
            console.log('2. Revisa la consola del navegador por errores');
            console.log('3. Verifica que el servidor esté corriendo');
            console.log('4. Comprueba que Railway haya desplegado los cambios');

        } catch (error) {
            console.error('💥 Error en verificación:', error);
        }
    }
}

// Ejecutar verificación
const verificador = new VerificadorHidrantes();
verificador.ejecutar()
    .then(() => {
        console.log('\n✅ Verificación completada');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error:', error);
        process.exit(1);
    });

