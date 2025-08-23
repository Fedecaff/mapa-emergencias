import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import baseDeDatos from '../src/modelos/baseDeDatosPostgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CargadorHidrantes {
    constructor() {
        this.csvPath = path.join(__dirname, '../datos/hidrantes_catamarca.csv');
        this.categoriaHidrantesId = 1; // ID de la categoría hidrantes
    }

    // Leer y parsear el CSV
    async leerCSV() {
        try {
            console.log('📖 Leyendo archivo CSV...');
            const contenido = fs.readFileSync(this.csvPath, 'utf-8');
            const lineas = contenido.split('\n');
            
            // Remover encabezado y líneas vacías
            const datos = lineas
                .slice(1) // Remover encabezado
                .filter(linea => linea.trim() !== '') // Remover líneas vacías
                .map(linea => {
                    const [gid, latitude, longitude, en_catamarca] = linea.split(',');
                    return {
                        gid: parseFloat(gid),
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude),
                        en_catamarca: en_catamarca === 'True'
                    };
                })
                .filter(hidrante => 
                    !isNaN(hidrante.gid) && 
                    !isNaN(hidrante.latitude) && 
                    !isNaN(hidrante.longitude)
                );

            console.log(`✅ CSV leído correctamente. ${datos.length} hidrantes encontrados.`);
            return datos;
        } catch (error) {
            console.error('❌ Error leyendo CSV:', error);
            throw error;
        }
    }

    // Verificar si la categoría hidrantes existe
    async verificarCategoria() {
        try {
            console.log('🔍 Verificando categoría hidrantes...');
            const categoria = await baseDeDatos.obtenerUno(
                'SELECT id, nombre FROM categorias WHERE id = $1',
                [this.categoriaHidrantesId]
            );

            if (!categoria) {
                throw new Error(`Categoría con ID ${this.categoriaHidrantesId} no encontrada`);
            }

            console.log(`✅ Categoría encontrada: ${categoria.nombre} (ID: ${categoria.id})`);
            return categoria;
        } catch (error) {
            console.error('❌ Error verificando categoría:', error);
            throw error;
        }
    }

    // Verificar si ya existen hidrantes
    async verificarHidrantesExistentes() {
        try {
            const count = await baseDeDatos.obtenerUno(
                'SELECT COUNT(*) as total FROM puntos WHERE categoria_id = $1',
                [this.categoriaHidrantesId]
            );

            const total = parseInt(count.total);
            console.log(`📊 Hidrantes existentes en BD: ${total}`);
            return total;
        } catch (error) {
            console.error('❌ Error verificando hidrantes existentes:', error);
            throw error;
        }
    }

    // Insertar hidrantes en lotes
    async insertarHidrantes(hidrantes) {
        try {
            console.log('🚀 Iniciando inserción de hidrantes...');
            
            let insertados = 0;
            let errores = 0;
            const loteSize = 50; // Insertar en lotes de 50

            for (let i = 0; i < hidrantes.length; i += loteSize) {
                const lote = hidrantes.slice(i, i + loteSize);
                
                console.log(`📦 Procesando lote ${Math.floor(i/loteSize) + 1}/${Math.ceil(hidrantes.length/loteSize)}...`);

                for (const hidrante of lote) {
                    try {
                        // Verificar si ya existe un hidrante con estas coordenadas
                        const existente = await baseDeDatos.obtenerUno(
                            'SELECT id FROM puntos WHERE latitud = $1 AND longitud = $2 AND categoria_id = $3',
                            [hidrante.latitude, hidrante.longitude, this.categoriaHidrantesId]
                        );

                        if (existente) {
                            console.log(`⚠️  Hidrante ya existe en coordenadas (${hidrante.latitude}, ${hidrante.longitude})`);
                            continue;
                        }

                        // Insertar nuevo hidrante
                        await baseDeDatos.ejecutar(
                            `INSERT INTO puntos (nombre, latitud, longitud, categoria_id, datos_personalizados, estado) 
                             VALUES ($1, $2, $3, $4, $5, 'activo')`,
                            [
                                `Hidrante ${hidrante.gid}`,
                                hidrante.latitude,
                                hidrante.longitude,
                                this.categoriaHidrantesId,
                                JSON.stringify({
                                    gid_original: hidrante.gid,
                                    en_catamarca: hidrante.en_catamarca
                                })
                            ]
                        );

                        insertados++;
                    } catch (error) {
                        console.error(`❌ Error insertando hidrante ${hidrante.gid}:`, error.message);
                        errores++;
                    }
                }
            }

            console.log(`✅ Inserción completada:`);
            console.log(`   📈 Hidrantes insertados: ${insertados}`);
            console.log(`   ❌ Errores: ${errores}`);
            console.log(`   📊 Total procesados: ${hidrantes.length}`);

            return { insertados, errores, total: hidrantes.length };
        } catch (error) {
            console.error('❌ Error en inserción masiva:', error);
            throw error;
        }
    }

    // Ejecutar el proceso completo
    async ejecutar() {
        try {
            console.log('🚒 INICIANDO CARGA DE HIDRANTES');
            console.log('================================');

            // 1. Verificar categoría
            await this.verificarCategoria();

            // 2. Verificar hidrantes existentes
            const existentes = await this.verificarHidrantesExistentes();

            // 3. Leer CSV
            const hidrantes = await this.leerCSV();

            // 4. Confirmar si continuar
            if (existentes > 0) {
                console.log(`⚠️  ADVERTENCIA: Ya existen ${existentes} hidrantes en la base de datos.`);
                console.log('   El script verificará duplicados por coordenadas antes de insertar.');
            }

            // 5. Insertar hidrantes
            const resultado = await this.insertarHidrantes(hidrantes);

            // 6. Resumen final
            console.log('\n🎉 CARGA COMPLETADA');
            console.log('==================');
            console.log(`📊 Resumen:`);
            console.log(`   • Hidrantes en CSV: ${hidrantes.length}`);
            console.log(`   • Nuevos insertados: ${resultado.insertados}`);
            console.log(`   • Errores: ${resultado.errores}`);
            console.log(`   • Total en BD después: ${existentes + resultado.insertados}`);

        } catch (error) {
            console.error('💥 ERROR CRÍTICO:', error);
            process.exit(1);
        }
    }
}

// Ejecutar el script
const cargador = new CargadorHidrantes();
cargador.ejecutar()
    .then(() => {
        console.log('\n✅ Script completado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error ejecutando script:', error);
        process.exit(1);
    });
