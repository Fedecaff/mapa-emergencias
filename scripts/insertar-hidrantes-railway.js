import pg from 'pg';

class InsertadorHidrantesRailway {
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

    // Generar coordenadas aleatorias en el área de Catamarca
    generarCoordenadas() {
        // Área aproximada de Catamarca capital
        const latMin = -28.5;
        const latMax = -28.4;
        const lngMin = -65.8;
        const lngMax = -65.7;
        
        const latitud = latMin + Math.random() * (latMax - latMin);
        const longitud = lngMin + Math.random() * (lngMax - lngMin);
        
        return [latitud, longitud];
    }

    async insertarHidrantes() {
        try {
            console.log('🚀 Iniciando inserción de 850 hidrantes...');
            
            const batchSize = 50;
            const totalHidrantes = 850;
            const totalBatches = Math.ceil(totalHidrantes / batchSize);
            
            for (let i = 0; i < totalBatches; i++) {
                const inicio = i * batchSize;
                const fin = Math.min(inicio + batchSize, totalHidrantes);
                const lote = fin - inicio;
                
                console.log(`🔄 Procesando lote ${i + 1}/${totalBatches} (${lote} hidrantes)...`);
                
                await this.procesarLote(inicio, lote);
                
                // Pequeña pausa para no sobrecargar la BD
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            console.log('✅ Inserción de hidrantes completada');
        } catch (error) {
            console.error('❌ Error insertando hidrantes:', error);
            throw error;
        }
    }

    async procesarLote(inicio, cantidad) {
        try {
            await this.client.query('BEGIN');
            
            for (let i = 0; i < cantidad; i++) {
                const numeroHidrante = inicio + i + 1;
                const [latitud, longitud] = this.generarCoordenadas();
                
                const nombre = `Hidrante ${numeroHidrante}`;
                
                // Datos personalizados para hidrantes
                const datosPersonalizados = {
                    tipo: 'Hidrante público',
                    presion: 'Variable',
                    estado_operativo: 'Activo',
                    numero: numeroHidrante
                };
                
                await this.client.query(`
                    INSERT INTO puntos (nombre, latitud, longitud, categoria_id, estado, datos_personalizados, fecha_creacion)
                    VALUES ($1, $2, $3, $4, $5, $6, NOW())
                    ON CONFLICT (nombre, categoria_id) DO NOTHING
                `, [
                    nombre,
                    latitud,
                    longitud,
                    this.categoriaHidrantesId,
                    'activo',
                    JSON.stringify(datosPersonalizados)
                ]);
            }
            
            await this.client.query('COMMIT');
            
        } catch (error) {
            await this.client.query('ROLLBACK');
            throw error;
        }
    }

    async contarHidrantes() {
        try {
            const result = await this.ejecutarQuery(
                'SELECT COUNT(*) as total FROM puntos WHERE categoria_id = $1',
                [this.categoriaHidrantesId]
            );
            
            const total = parseInt(result.rows[0].total);
            console.log(`📊 Total de hidrantes en BD: ${total}`);
            return total;
        } catch (error) {
            console.error('❌ Error contando hidrantes:', error);
            throw error;
        }
    }

    async ejecutar() {
        try {
            console.log('🚒 INICIANDO INSERCIÓN DE 850 HIDRANTES EN RAILWAY');
            console.log('==================================================');
            
            await this.conectar();
            
            const existentes = await this.contarHidrantes();
            console.log(`📊 Hidrantes existentes antes de la inserción: ${existentes}`);
            
            await this.insertarHidrantes();
            
            const finales = await this.contarHidrantes();
            console.log(`🎉 Inserción completada. Total de hidrantes: ${finales}`);
            console.log(`📈 Hidrantes agregados: ${finales - existentes}`);
            
        } catch (error) {
            console.error('💥 ERROR CRÍTICO:', error);
            throw error;
        } finally {
            await this.desconectar();
        }
    }
}

// Ejecutar inserción
const insertador = new InsertadorHidrantesRailway();
insertador.ejecutar()
    .then(() => {
        console.log('\n✅ Inserción de hidrantes completada exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error:', error);
        process.exit(1);
    });
