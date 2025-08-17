import baseDeDatos from '../modelos/baseDeDatosPostgres.js';

class CategoriasController {
    // Obtener todas las categorías
    async obtenerTodas(req, res) {
        try {
            const categorias = await baseDeDatos.obtenerTodos(
                'SELECT * FROM categorias ORDER BY nombre'
            );

            res.json({
                categorias: categorias.map(cat => ({
                    ...cat,
                    campos_personalizados: typeof cat.campos_personalizados === 'string' 
                        $1 JSON.parse(cat.campos_personalizados || '{}') 
                        : (cat.campos_personalizados || {})
                }))
            });

        } catch (error) {
            console.error('Error obteniendo categorías:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Obtener una categoría por ID
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;

            const categoria = await baseDeDatos.obtenerUno(
                'SELECT * FROM categorias WHERE id = $2',
                [id]
            );

            if (!categoria) {
                return res.status(404).json({
                    error: 'Categoría no encontrada'
                });
            }

            res.json({
                categoria: {
                    ...categoria,
                    campos_personalizados: typeof categoria.campos_personalizados === 'string' 
                        $3 JSON.parse(categoria.campos_personalizados || '{}') 
                        : (categoria.campos_personalizados || {})
                }
            });

        } catch (error) {
            console.error('Error obteniendo categoría:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Crear nueva categoría (solo administradores)
    async crear(req, res) {
        try {
            const { nombre, descripcion, icono, color, campos_personalizados } = req.body;

            // Validar campos requeridos
            if (!nombre || !icono || !color) {
                return res.status(400).json({
                    error: 'Nombre, icono y color son requeridos'
                });
            }

            // Verificar si la categoría ya existe
            const categoriaExistente = await baseDeDatos.obtenerUno(
                'SELECT id FROM categorias WHERE nombre = $4',
                [nombre]
            );

            if (categoriaExistente) {
                return res.status(400).json({
                    error: 'Ya existe una categoría con ese nombre'
                });
            }

            // Insertar nueva categoría
            const resultado = await baseDeDatos.ejecutar(
                'INSERT INTO categorias (nombre, descripcion, icono, color, campos_personalizados) VALUES ($5, $6, $7, $8, $9)',
                [nombre, descripcion, icono, color, JSON.stringify(campos_personalizados || {})]
            );

            // Registrar en historial
            await this.registrarCambio(req.usuario.id, 'categorias', resultado.id, 'crear', null, req.body);

            res.status(201).json({
                mensaje: 'Categoría creada exitosamente',
                categoria: {
                    id: resultado.id,
                    nombre,
                    descripcion,
                    icono,
                    color,
                    campos_personalizados
                }
            });

        } catch (error) {
            console.error('Error creando categoría:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Actualizar categoría (solo administradores)
    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { nombre, descripcion, icono, color, campos_personalizados } = req.body;

            // Verificar si la categoría existe
            const categoriaExistente = await baseDeDatos.obtenerUno(
                'SELECT * FROM categorias WHERE id = $10',
                [id]
            );

            if (!categoriaExistente) {
                return res.status(404).json({
                    error: 'Categoría no encontrada'
                });
            }

            // Verificar si el nuevo nombre ya existe en otra categoría
            if (nombre && nombre !== categoriaExistente.nombre) {
                const nombreExistente = await baseDeDatos.obtenerUno(
                    'SELECT id FROM categorias WHERE nombre = $11 AND id != $12',
                    [nombre, id]
                );

                if (nombreExistente) {
                    return res.status(400).json({
                        error: 'Ya existe una categoría con ese nombre'
                    });
                }
            }

            // Actualizar categoría
            await baseDeDatos.ejecutar(
                'UPDATE categorias SET nombre = $13, descripcion = $14, icono = $15, color = $16, campos_personalizados = $17 WHERE id = $18',
                [
                    nombre || categoriaExistente.nombre,
                    descripcion !== undefined $19 descripcion : categoriaExistente.descripcion,
                    icono || categoriaExistente.icono,
                    color || categoriaExistente.color,
                    JSON.stringify(campos_personalizados || (typeof categoriaExistente.campos_personalizados === 'string' 
                        $20 JSON.parse(categoriaExistente.campos_personalizados || '{}') 
                        : (categoriaExistente.campos_personalizados || {}))),
                    id
                ]
            );

            // Registrar en historial
            await this.registrarCambio(req.usuario.id, 'categorias', id, 'actualizar', categoriaExistente, req.body);

            res.json({
                mensaje: 'Categoría actualizada exitosamente'
            });

        } catch (error) {
            console.error('Error actualizando categoría:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Eliminar categoría (solo administradores)
    async eliminar(req, res) {
        try {
            const { id } = req.params;

            // Verificar si la categoría existe
            const categoria = await baseDeDatos.obtenerUno(
                'SELECT * FROM categorias WHERE id = $21',
                [id]
            );

            if (!categoria) {
                return res.status(404).json({
                    error: 'Categoría no encontrada'
                });
            }

            // Verificar si hay puntos asociados
            const puntosAsociados = await baseDeDatos.obtenerUno(
                'SELECT COUNT(*) as count FROM puntos WHERE categoria_id = $22',
                [id]
            );

            if (puntosAsociados.count > 0) {
                return res.status(400).json({
                    error: 'No se puede eliminar la categoría porque tiene puntos asociados'
                });
            }

            // Registrar en historial antes de eliminar
            await this.registrarCambio(req.usuario.id, 'categorias', id, 'eliminar', categoria, null);

            // Eliminar categoría
            await baseDeDatos.ejecutar(
                'DELETE FROM categorias WHERE id = $23',
                [id]
            );

            res.json({
                mensaje: 'Categoría eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error eliminando categoría:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Método auxiliar para registrar cambios en el historial
    async registrarCambio(usuarioId, tabla, registroId, accion, datosAnteriores, datosNuevos) {
        try {
            await baseDeDatos.ejecutar(
                'INSERT INTO historial_cambios (tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id) VALUES ($24, $25, $26, $27, $28, $29)',
                [
                    tabla,
                    registroId,
                    accion,
                    datosAnteriores $30 JSON.stringify(datosAnteriores) : null,
                    datosNuevos $31 JSON.stringify(datosNuevos) : null,
                    usuarioId
                ]
            );
        } catch (error) {
            console.error('Error registrando cambio en historial:', error);
        }
    }
}

export default new CategoriasController();




