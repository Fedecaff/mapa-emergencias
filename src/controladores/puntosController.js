import baseDeDatos from '../modelos/baseDeDatosPostgres.js';

class PuntosController {
    // Obtener todos los puntos (con filtros opcionales)
    async obtenerTodos(req, res) {
        try {
            const { categoria_id, latitud, longitud, radio } = req.query;
            
            let sql = `
                SELECT p.*, c.nombre as categoria_nombre, c.icono, c.color 
                FROM puntos p 
                JOIN categorias c ON p.categoria_id = c.id 
                WHERE p.estado = 'activo'
            `;
            let parametros = [];

            // Filtro por categoría
            if (categoria_id) {
                sql += ' AND p.categoria_id = ?';
                parametros.push(categoria_id);
            }

            // Filtro por proximidad (radio en km)
            if (latitud && longitud && radio) {
                sql += ` AND (
                    6371 * acos(
                        cos(radians(?)) * cos(radians(p.latitud)) * 
                        cos(radians(p.longitud) - radians(?)) + 
                        sin(radians(?)) * sin(radians(p.latitud))
                    )
                ) <= ?`;
                parametros.push(parseFloat(latitud), parseFloat(longitud), parseFloat(latitud), parseFloat(radio));
            }

            sql += ' ORDER BY p.nombre';

            const puntos = await baseDeDatos.obtenerTodos(sql, parametros);

            res.json({
                puntos: puntos.map(punto => ({
                    ...punto,
                    datos_personalizados: JSON.parse(punto.datos_personalizados || '{}')
                }))
            });

        } catch (error) {
            console.error('Error obteniendo puntos:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Obtener un punto por ID
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;

            const punto = await baseDeDatos.obtenerUno(`
                SELECT p.*, c.nombre as categoria_nombre, c.icono, c.color 
                FROM puntos p 
                JOIN categorias c ON p.categoria_id = c.id 
                WHERE p.id = ? AND p.estado = 'activo'
            `, [id]);

            if (!punto) {
                return res.status(404).json({
                    error: 'Punto no encontrado'
                });
            }

            res.json({
                punto: {
                    ...punto,
                    datos_personalizados: JSON.parse(punto.datos_personalizados || '{}')
                }
            });

        } catch (error) {
            console.error('Error obteniendo punto:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Crear nuevo punto (solo administradores)
    async crear(req, res) {
        try {
            const { nombre, descripcion, latitud, longitud, categoria_id, datos_personalizados } = req.body;

            // Validar campos requeridos
            if (!nombre || !latitud || !longitud || !categoria_id) {
                return res.status(400).json({
                    error: 'Nombre, latitud, longitud y categoría son requeridos'
                });
            }

            // Validar coordenadas
            if (latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
                return res.status(400).json({
                    error: 'Coordenadas inválidas'
                });
            }

            // Verificar que la categoría existe
            const categoria = await baseDeDatos.obtenerUno(
                'SELECT id FROM categorias WHERE id = ?',
                [categoria_id]
            );

            if (!categoria) {
                return res.status(400).json({
                    error: 'Categoría no encontrada'
                });
            }

            // Insertar nuevo punto
            const resultado = await baseDeDatos.ejecutar(
                'INSERT INTO puntos (nombre, descripcion, latitud, longitud, categoria_id, datos_personalizados) VALUES (?, ?, ?, ?, ?, ?)',
                [nombre, descripcion, latitud, longitud, categoria_id, JSON.stringify(datos_personalizados || {})]
            );

            // Registrar en historial
            await puntosController.registrarCambio(req.usuario.id, 'puntos', resultado.id, 'crear', null, req.body);

            // Obtener el punto creado con información de categoría
            const puntoCreado = await baseDeDatos.obtenerUno(`
                SELECT p.*, c.nombre as categoria_nombre, c.icono, c.color 
                FROM puntos p 
                JOIN categorias c ON p.categoria_id = c.id 
                WHERE p.id = ?
            `, [resultado.id]);

            res.status(201).json({
                mensaje: 'Punto creado exitosamente',
                punto: {
                    ...puntoCreado,
                    datos_personalizados: JSON.parse(puntoCreado.datos_personalizados || '{}')
                }
            });

        } catch (error) {
            console.error('Error creando punto:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Actualizar punto (solo administradores)
    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { nombre, descripcion, latitud, longitud, categoria_id, datos_personalizados, estado } = req.body;

            console.log('Actualizando punto ID:', id, 'con datos:', req.body);

            // Verificar si el punto existe
            const puntoExistente = await baseDeDatos.obtenerUno(
                'SELECT * FROM puntos WHERE id = ?',
                [id]
            );

            if (!puntoExistente) {
                return res.status(404).json({
                    error: 'Punto no encontrado'
                });
            }

            console.log('Punto existente:', puntoExistente);

            // Validar coordenadas si se proporcionan
            if (latitud !== undefined && (latitud < -90 || latitud > 90)) {
                return res.status(400).json({
                    error: 'Latitud inválida'
                });
            }

            if (longitud !== undefined && (longitud < -180 || longitud > 180)) {
                return res.status(400).json({
                    error: 'Longitud inválida'
                });
            }

            // Verificar que la categoría existe si se cambia
            if (categoria_id && categoria_id !== puntoExistente.categoria_id) {
                const categoria = await baseDeDatos.obtenerUno(
                    'SELECT id FROM categorias WHERE id = ?',
                    [categoria_id]
                );

                if (!categoria) {
                    return res.status(400).json({
                        error: 'Categoría no encontrada'
                    });
                }
            }

            // Actualizar punto
            await baseDeDatos.ejecutar(
                `UPDATE puntos SET 
                    nombre = ?, 
                    descripcion = ?, 
                    latitud = ?, 
                    longitud = ?, 
                    categoria_id = ?, 
                    datos_personalizados = ?,
                    estado = ?,
                    fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [
                    nombre || puntoExistente.nombre,
                    descripcion !== undefined ? descripcion : puntoExistente.descripcion,
                    latitud || puntoExistente.latitud,
                    longitud || puntoExistente.longitud,
                    categoria_id || puntoExistente.categoria_id,
                    JSON.stringify(datos_personalizados || JSON.parse(puntoExistente.datos_personalizados || '{}')),
                    estado || puntoExistente.estado,
                    id
                ]
            );

            // Registrar en historial
            await puntosController.registrarCambio(req.usuario.id, 'puntos', id, 'actualizar', puntoExistente, req.body);

            res.json({
                mensaje: 'Punto actualizado exitosamente'
            });

        } catch (error) {
            console.error('Error actualizando punto:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Eliminar punto (solo administradores)
    async eliminar(req, res) {
        try {
            const { id } = req.params;

            // Verificar si el punto existe
            const punto = await baseDeDatos.obtenerUno(
                'SELECT * FROM puntos WHERE id = ?',
                [id]
            );

            if (!punto) {
                return res.status(404).json({
                    error: 'Punto no encontrado'
                });
            }

            // Registrar en historial antes de eliminar
            await puntosController.registrarCambio(req.usuario.id, 'puntos', id, 'eliminar', punto, null);

            // Eliminar punto (soft delete)
            await baseDeDatos.ejecutar(
                'UPDATE puntos SET estado = "eliminado", fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?',
                [id]
            );

            res.json({
                mensaje: 'Punto eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error eliminando punto:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Buscar puntos por texto
    async buscar(req, res) {
        try {
            const { q } = req.query;

            if (!q) {
                return res.status(400).json({
                    error: 'Término de búsqueda requerido'
                });
            }

            const puntos = await baseDeDatos.obtenerTodos(`
                SELECT p.*, c.nombre as categoria_nombre, c.icono, c.color 
                FROM puntos p 
                JOIN categorias c ON p.categoria_id = c.id 
                WHERE p.estado = 'activo' 
                AND (p.nombre LIKE ? OR p.descripcion LIKE ?)
                ORDER BY p.nombre
            `, [`%${q}%`, `%${q}%`]);

            res.json({
                puntos: puntos.map(punto => ({
                    ...punto,
                    datos_personalizados: JSON.parse(punto.datos_personalizados || '{}')
                }))
            });

        } catch (error) {
            console.error('Error buscando puntos:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Obtener puntos cercanos a una ubicación
    async obtenerCercanos(req, res) {
        try {
            const { latitud, longitud, radio = 5 } = req.query; // radio por defecto 5km

            if (!latitud || !longitud) {
                return res.status(400).json({
                    error: 'Latitud y longitud son requeridas'
                });
            }

            const puntos = await baseDeDatos.obtenerTodos(`
                SELECT p.*, c.nombre as categoria_nombre, c.icono, c.color,
                (6371 * acos(
                    cos(radians(?)) * cos(radians(p.latitud)) * 
                    cos(radians(p.longitud) - radians(?)) + 
                    sin(radians(?)) * sin(radians(p.latitud))
                )) as distancia
                FROM puntos p 
                JOIN categorias c ON p.categoria_id = c.id 
                WHERE p.estado = 'activo'
                AND (6371 * acos(
                    cos(radians(?)) * cos(radians(p.latitud)) * 
                    cos(radians(p.longitud) - radians(?)) + 
                    sin(radians(?)) * sin(radians(p.latitud))
                )) <= ?
                ORDER BY distancia
            `, [parseFloat(latitud), parseFloat(longitud), parseFloat(latitud), parseFloat(latitud), parseFloat(longitud), parseFloat(latitud), parseFloat(radio)]);

            res.json({
                puntos: puntos.map(punto => ({
                    ...punto,
                    datos_personalizados: JSON.parse(punto.datos_personalizados || '{}')
                }))
            });

        } catch (error) {
            console.error('Error obteniendo puntos cercanos:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Método auxiliar para registrar cambios en el historial
    async registrarCambio(usuarioId, tabla, registroId, accion, datosAnteriores, datosNuevos) {
        try {
            await baseDeDatos.ejecutar(
                'INSERT INTO historial_cambios (tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    tabla,
                    registroId,
                    accion,
                    datosAnteriores ? JSON.stringify(datosAnteriores) : null,
                    datosNuevos ? JSON.stringify(datosNuevos) : null,
                    usuarioId
                ]
            );
        } catch (error) {
            console.error('Error registrando cambio en historial:', error);
        }
    }
}

const puntosController = new PuntosController();
export default puntosController;
