import baseDeDatos from '../modelos/baseDeDatosPostgres.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FotosController {
    // Subir foto para un punto
    async subirFoto(req, res) {
        try {
            // Verificar que el usuario sea administrador
            if (req.usuario.rol !== 'admin') {
                return res.status(403).json({
                    error: 'Solo los administradores pueden subir fotos'
                });
            }

            const { punto_id, descripcion } = req.body;
            
            if (!req.file) {
                return res.status(400).json({
                    error: 'No se proporcionó ningún archivo'
                });
            }

            if (!punto_id) {
                return res.status(400).json({
                    error: 'ID del punto es requerido'
                });
            }

            // Verificar que el punto existe
            const punto = await baseDeDatos.obtenerUno(
                'SELECT id FROM puntos WHERE id = $1',
                [punto_id]
            );

            if (!punto) {
                return res.status(404).json({
                    error: 'Punto no encontrado'
                });
            }

            // Validar tipo de archivo
            const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
            if (!tiposPermitidos.includes(req.file.mimetype)) {
                // Eliminar archivo subido
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    error: 'Tipo de archivo no permitido. Solo se permiten JPG, PNG y HEIC'
                });
            }

            // Validar tamaño (5MB máximo)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (req.file.size > maxSize) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    error: 'El archivo es demasiado grande. Máximo 5MB'
                });
            }

            // Verificar número máximo de fotos por punto (5 máximo)
            const fotosExistentes = await baseDeDatos.obtenerUno(
                'SELECT COUNT(*) as count FROM fotos_puntos WHERE punto_id = $1',
                [punto_id]
            );

            if (parseInt(fotosExistentes.count) >= 5) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    error: 'Ya se alcanzó el límite máximo de 5 fotos para este punto'
                });
            }

            // Para Railway, vamos a usar un enfoque simplificado
            // Convertir la imagen a base64 y guardarla en la base de datos
            const imageBuffer = fs.readFileSync(req.file.path);
            const base64Image = imageBuffer.toString('base64');
            const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
            
            // Limpiar archivo temporal
            fs.unlinkSync(req.file.path);
            
            // Generar nombre único para el archivo
            const extension = path.extname(req.file.originalname);
            const nombreArchivo = `foto_${punto_id}_${Date.now()}${extension}`;
            const rutaArchivo = dataUrl; // Guardamos la imagen como data URL

            // Insertar registro en la base de datos
            const resultado = await baseDeDatos.ejecutar(
                `INSERT INTO fotos_puntos 
                (punto_id, nombre_archivo, ruta_archivo, descripcion, tamaño_bytes, tipo_mime, usuario_id) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING id`,
                [punto_id, nombreArchivo, rutaArchivo, descripcion || null, req.file.size, req.file.mimetype, req.usuario.id]
            );

            // Registrar en historial
            await baseDeDatos.ejecutar(
                `INSERT INTO historial_cambios 
                (tabla, registro_id, accion, datos_nuevos, usuario_id) 
                VALUES ($1, $2, $3, $4, $5)`,
                ['fotos_puntos', resultado.rows[0].id, 'crear', JSON.stringify({
                    punto_id,
                    nombre_archivo,
                    descripcion
                }), req.usuario.id]
            );

            res.status(201).json({
                mensaje: 'Foto subida exitosamente',
                foto: {
                    id: resultado.rows[0].id,
                    punto_id,
                    nombre_archivo,
                    ruta_archivo,
                    descripcion,
                    fecha_subida: new Date()
                }
            });

        } catch (error) {
            console.error('Error subiendo foto:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Obtener fotos de un punto
    async obtenerFotosPunto(req, res) {
        try {
            const { punto_id } = req.params;

            const fotos = await baseDeDatos.obtenerTodos(
                `SELECT f.*, u.nombre as usuario_nombre 
                FROM fotos_puntos f 
                LEFT JOIN usuarios u ON f.usuario_id = u.id 
                WHERE f.punto_id = $1 
                ORDER BY f.fecha_subida DESC`,
                [punto_id]
            );

            res.json({
                fotos: fotos
            });

        } catch (error) {
            console.error('Error obteniendo fotos:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Eliminar foto
    async eliminarFoto(req, res) {
        try {
            // Verificar que el usuario sea administrador
            if (req.usuario.rol !== 'admin') {
                return res.status(403).json({
                    error: 'Solo los administradores pueden eliminar fotos'
                });
            }

            const { id } = req.params;

            // Obtener información de la foto
            const foto = await baseDeDatos.obtenerUno(
                'SELECT * FROM fotos_puntos WHERE id = $1',
                [id]
            );

            if (!foto) {
                return res.status(404).json({
                    error: 'Foto no encontrada'
                });
            }

            // No necesitamos eliminar archivos físicos ya que usamos data URLs
            // Las imágenes se almacenan directamente en la base de datos

            // Eliminar registro de la base de datos
            await baseDeDatos.ejecutar(
                'DELETE FROM fotos_puntos WHERE id = $1',
                [id]
            );

            // Registrar en historial
            await baseDeDatos.ejecutar(
                `INSERT INTO historial_cambios 
                (tabla, registro_id, accion, datos_anteriores, usuario_id) 
                VALUES ($1, $2, $3, $4, $5)`,
                ['fotos_puntos', id, 'eliminar', JSON.stringify(foto), req.usuario.id]
            );

            res.json({
                mensaje: 'Foto eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error eliminando foto:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Obtener todas las fotos (para administradores)
    async obtenerTodasFotos(req, res) {
        try {
            // Verificar que el usuario sea administrador
            if (req.usuario.rol !== 'admin') {
                return res.status(403).json({
                    error: 'Solo los administradores pueden ver todas las fotos'
                });
            }

            const fotos = await baseDeDatos.obtenerTodos(
                `SELECT f.*, p.nombre as punto_nombre, u.nombre as usuario_nombre 
                FROM fotos_puntos f 
                LEFT JOIN puntos p ON f.punto_id = p.id 
                LEFT JOIN usuarios u ON f.usuario_id = u.id 
                ORDER BY f.fecha_subida DESC`
            );

            res.json({
                fotos: fotos
            });

        } catch (error) {
            console.error('Error obteniendo todas las fotos:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }
}

export default new FotosController();
