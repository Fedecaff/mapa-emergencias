import pg from 'pg';

class VerificadorHidrantesRailway {
    constructor() {
        this.client = null;
        this.categoriaHidrantesId = 1;
    }

    async conectar() {
        try {
            console.log('🔌 Conectando a PostgreSQL en Railway...');
            
            const databaseUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
            if (!databaseUrl) {
                throw new Error('❌ DATABASE_URL no encontrada en las variables de entorno');
            }

            console.log('📡 URL de base de datos encontrada');
            
            this.client = new pg.Client({
                connectionString: databaseUrl,
                ssl: {
                    rejectUnauthorized: false
                }
            });

            await this.client.connect();
            console.log('✅ Conectado a PostgreSQL en Railway');
            
        } catch (error) {
            console.error('❌ Error conectando a PostgreSQL:', error);
            throw error;
        }
    }

    async desconectar() {
        if (this.client) {
            await this.client.end();
            console.log('🔌 Desconectado de PostgreSQL');
        }
    }

    async ejecutarQuery(query, params = []) {
        try {
            const result = await this.client.query(query, params);
            return result;
        } catch (error) {
            console.error('❌ Error ejecutando query:', error);
            throw error;
        }
    }

    async verificarHidrantes() {
        try {
            console.log('🔍 VERIFICANDO HIDRANTES EN RAILWAY');
            console.log('====================================');

            // 1. Contar hidrantes totales
            const count = await this.ejecutarQuery(
                'SELECT COUNT(*) as total FROM puntos WHERE categoria_id = $1',
                [this.categoriaHidrantesId]
            );

            console.log(`📊 Total de hidrantes en BD: ${count.rows[0].total}`);

            // 2. Verificar hidrantes activos
            const countActivos = await this.ejecutarQuery(
                'SELECT COUNT(*) as total FROM puntos WHERE categoria_id = $1 AND estado = $2',
                [this.categoriaHidrantesId, 'activo']
            );

            console.log(`✅ Hidrantes activos: ${countActivos.rows[0].total}`);

            // 3. Verificar hidrantes inactivos
            const countInactivos = await this.ejecutarQuery(
                'SELECT COUNT(*) as total FROM puntos WHERE categoria_id = $1 AND estado = $2',
                [this.categoriaHidrantesId, 'inactivo']
            );

            console.log(`❌ Hidrantes inactivos: ${countInactivos.rows[0].total}`);

            // 4. Mostrar algunos ejemplos
            const ejemplos = await this.ejecutarQuery(
                'SELECT id, nombre, latitud, longitud, estado, datos_personalizados FROM puntos WHERE categoria_id = $1 LIMIT 5',
                [this.categoriaHidrantesId]
            );

            console.log('\n📋 EJEMPLOS DE HIDRANTES:');
            console.log('==========================');
            ejemplos.rows.forEach((hidrante, index) => {
                console.log(`${index + 1}. ID: ${hidrante.id}`);
                console.log(`   Nombre: ${hidrante.nombre}`);
                console.log(`   Coordenadas: (${hidrante.latitud}, ${hidrante.longitud})`);
                console.log(`   Estado: ${hidrante.estado}`);
                console.log(`   Datos: ${hidrante.datos_personalizados}`);
                console.log('');
            });

            // 5. Verificar categoría
            const categoria = await this.ejecutarQuery(
                'SELECT * FROM categorias WHERE id = $1',
                [this.categoriaHidrantesId]
            );

            console.log('🏷️  CATEGORÍA HIDRANTES:');
            console.log('========================');
            console.log(`ID: ${categoria.rows[0].id}`);
            console.log(`Nombre: ${categoria.rows[0].nombre}`);
            console.log(`Icono: ${categoria.rows[0].icono}`);
            console.log(`Color: ${categoria.rows[0].color}`);
            console.log(`Estado: ${categoria.rows[0].estado || 'activo'}`);

            return {
                total: parseInt(count.rows[0].total),
                activos: parseInt(countActivos.rows[0].total),
                inactivos: parseInt(countInactivos.rows[0].total),
                categoria: categoria.rows[0],
                ejemplos: ejemplos.rows
            };

        } catch (error) {
            console.error('❌ Error verificando hidrantes:', error);
            throw error;
        }
    }

    async ejecutar() {
        try {
            await this.conectar();
            await this.verificarHidrantes();

            console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
            console.log('==========================');
            console.log('Si los hidrantes están en la BD pero no se ven en el mapa:');
            console.log('1. Verifica que el frontend esté cargando la categoría correcta');
            console.log('2. Revisa la consola del navegador por errores');
            console.log('3. Verifica que el servidor esté corriendo');
            console.log('4. Comprueba que Railway haya desplegado los cambios');

        } catch (error) {
            console.error('💥 Error en verificación:', error);
        } finally {
            await this.desconectar();
        }
    }
}

// Ejecutar verificación
const verificador = new VerificadorHidrantesRailway();
verificador.ejecutar()
    .then(() => {
        console.log('\n✅ Verificación completada');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error:', error);
        process.exit(1);
    });
