import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CargadorHidrantesRailway {
    constructor() {
        this.client = null;
        this.categoriaHidrantesId = 1;
    }

    async conectar() {
        try {
            console.log('🔌 Conectando a PostgreSQL en Railway...');
            
            // Usar la variable de entorno de Railway (URL pública)
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

    async verificarCategoria() {
        try {
            console.log('🔍 Verificando categoría hidrantes...');
            
            const result = await this.ejecutarQuery(
                'SELECT * FROM categorias WHERE id = $1',
                [this.categoriaHidrantesId]
            );

            if (result.rows.length === 0) {
                throw new Error('❌ Categoría hidrantes no encontrada');
            }

            const categoria = result.rows[0];
            console.log(`✅ Categoría encontrada: ${categoria.nombre} (ID: ${categoria.id})`);
            
            return categoria;
        } catch (error) {
            console.error('❌ Error verificando categoría:', error);
            throw error;
        }
    }

    async contarHidrantesExistentes() {
        try {
            const result = await this.ejecutarQuery(
                'SELECT COUNT(*) as total FROM puntos WHERE categoria_id = $1',
                [this.categoriaHidrantesId]
            );
            
            const total = parseInt(result.rows[0].total);
            console.log(`📊 Hidrantes existentes en BD: ${total}`);
            return total;
        } catch (error) {
            console.error('❌ Error contando hidrantes:', error);
            throw error;
        }
    }

    async leerCSV() {
        try {
            console.log('📖 Leyendo archivo CSV...');
            
            const csvPath = path.join(__dirname, '..', 'data', 'hidrantes.csv');
            
            if (!fs.existsSync(csvPath)) {
                throw new Error(`❌ Archivo CSV no encontrado en: ${csvPath}`);
            }

            const contenido = fs.readFileSync(csvPath, 'utf-8');
            const lineas = contenido.split('\n').filter(linea => linea.trim());
            
            // Remover encabezado
            const datos = lineas.slice(1);
            
            console.log(`✅ CSV leído correctamente. ${datos.length} hidrantes encontrados.`);
            return datos;
        } catch (error) {
            console.error('❌ Error leyendo CSV:', error);
            throw error;
        }
    }

    async insertarHidrantes(hidrantes) {
        try {
            console.log('🚀 Iniciando inserción de hidrantes...');
            
            const batchSize = 50;
            const totalBatches = Math.ceil(hidrantes.length / batchSize);
            
            for (let i = 0; i < totalBatches; i++) {
                const inicio = i * batchSize;
                const fin = Math.min(inicio + batchSize, hidrantes.length);
                const lote = hidrantes.slice(inicio, fin);
                
                console.log(`🔄 Procesando lote ${i + 1}/${totalBatches} (${lote.length} hidrantes)...`);
                
                await this.procesarLote(lote);
                
                // Pequeña pausa para no sobrecargar la BD
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            console.log('✅ Inserción de hidrantes completada');
        } catch (error) {
            console.error('❌ Error insertando hidrantes:', error);
            throw error;
        }
    }

    async procesarLote(hidrantes) {
        const client = await this.client.connect();
        
        try {
            await client.query('BEGIN');
            
            for (const linea of hidrantes) {
                const campos = linea.split(',');
                
                if (campos.length < 3) continue;
                
                const nombre = campos[0].trim();
                const latitud = parseFloat(campos[1].trim());
                const longitud = parseFloat(campos[2].trim());
                
                if (isNaN(latitud) || isNaN(longitud)) {
                    console.warn(`⚠️ Coordenadas inválidas para: ${nombre}`);
                    continue;
                }
                
                // Datos personalizados para hidrantes
                const datosPersonalizados = {
                    tipo: 'Hidrante público',
                    presion: 'Variable',
                    estado_operativo: 'Activo'
                };
                
                await client.query(`
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
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async ejecutar() {
        try {
            console.log('🚒 INICIANDO CARGA DE HIDRANTES EN RAILWAY');
            console.log('==========================================');
            
            await this.conectar();
            await this.verificarCategoria();
            
            const existentes = await this.contarHidrantesExistentes();
            
            if (existentes > 0) {
                console.log(`⚠️ Ya existen ${existentes} hidrantes en la base de datos`);
                console.log('¿Deseas continuar y agregar más? (S/N)');
                // En Railway, asumimos que sí
            }
            
            const hidrantes = await this.leerCSV();
            await this.insertarHidrantes(hidrantes);
            
            const finales = await this.contarHidrantesExistentes();
            console.log(`🎉 Carga completada. Total de hidrantes: ${finales}`);
            
        } catch (error) {
            console.error('💥 ERROR CRÍTICO:', error);
            throw error;
        } finally {
            await this.desconectar();
        }
    }
}

// Ejecutar carga
const cargador = new CargadorHidrantesRailway();
cargador.ejecutar()
    .then(() => {
        console.log('\n✅ Carga de hidrantes completada exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error:', error);
        process.exit(1);
    });
