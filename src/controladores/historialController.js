import baseDeDatos from '../modelos/baseDeDatos.js';

class HistorialController {
    // Obtener historial de cambios (solo administradores)
    async obtenerHistorial(req, res) {
        try {
            const { tabla, registro_id, accion, fecha_desde, fecha_hasta, limit = 50, offset = 0 } = req.query;

            let sql = `
                SELECT h.*, u.nombre as usuario_nombre, u.email as usuario_email
                FROM historial_cambios h
                LEFT JOIN usuarios u ON h.usuario_id = u.id
                WHERE 1=1
            `;
            let parametros = [];

            // Filtros opcionales
            if (tabla) {
                sql += ' AND h.tabla = ?';
                parametros.push(tabla);
            }

            if (registro_id) {
                sql += ' AND h.registro_id = ?';
                parametros.push(registro_id);
            }

            if (accion) {
                sql += ' AND h.accion = ?';
                parametros.push(accion);
            }

            if (fecha_desde) {
                sql += ' AND h.fecha_cambio >= ?';
                parametros.push(fecha_desde);
            }

            if (fecha_hasta) {
                sql += ' AND h.fecha_cambio <= ?';
                parametros.push(fecha_hasta);
            }

            sql += ' ORDER BY h.fecha_cambio DESC LIMIT ? OFFSET ?';
            parametros.push(parseInt(limit), parseInt(offset));

            const historial = await baseDeDatos.obtenerTodos(sql, parametros);

            res.json({
                historial: historial.map(registro => ({
                    ...registro,
                    datos_anteriores: registro.datos_anteriores ? JSON.parse(registro.datos_anteriores) : null,
                    datos_nuevos: registro.datos_nuevos ? JSON.parse(registro.datos_nuevos) : null
                }))
            });

        } catch (error) {
            console.error('Error obteniendo historial:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Obtener historial de un registro específico
    async obtenerHistorialRegistro(req, res) {
        try {
            const { tabla, registro_id } = req.params;

            const historial = await baseDeDatos.obtenerTodos(`
                SELECT h.*, u.nombre as usuario_nombre, u.email as usuario_email
                FROM historial_cambios h
                LEFT JOIN usuarios u ON h.usuario_id = u.id
                WHERE h.tabla = ? AND h.registro_id = ?
                ORDER BY h.fecha_cambio DESC
            `, [tabla, registro_id]);

            res.json({
                historial: historial.map(registro => ({
                    ...registro,
                    datos_anteriores: registro.datos_anteriores ? JSON.parse(registro.datos_anteriores) : null,
                    datos_nuevos: registro.datos_nuevos ? JSON.parse(registro.datos_nuevos) : null
                }))
            });

        } catch (error) {
            console.error('Error obteniendo historial del registro:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Obtener estadísticas del historial
    async obtenerEstadisticas(req, res) {
        try {
            const { fecha_desde, fecha_hasta } = req.query;

            let whereClause = 'WHERE 1=1';
            let parametros = [];

            if (fecha_desde) {
                whereClause += ' AND fecha_cambio >= ?';
                parametros.push(fecha_desde);
            }

            if (fecha_hasta) {
                whereClause += ' AND fecha_cambio <= ?';
                parametros.push(fecha_hasta);
            }

            // Total de cambios
            const totalCambios = await baseDeDatos.obtenerUno(`
                SELECT COUNT(*) as total FROM historial_cambios ${whereClause}
            `, parametros);

            // Cambios por tabla
            const cambiosPorTabla = await baseDeDatos.obtenerTodos(`
                SELECT tabla, COUNT(*) as cantidad 
                FROM historial_cambios ${whereClause}
                GROUP BY tabla
                ORDER BY cantidad DESC
            `, parametros);

            // Cambios por acción
            const cambiosPorAccion = await baseDeDatos.obtenerTodos(`
                SELECT accion, COUNT(*) as cantidad 
                FROM historial_cambios ${whereClause}
                GROUP BY accion
                ORDER BY cantidad DESC
            `, parametros);

            // Usuarios más activos
            const usuariosActivos = await baseDeDatos.obtenerTodos(`
                SELECT u.nombre, u.email, COUNT(*) as cambios
                FROM historial_cambios h
                JOIN usuarios u ON h.usuario_id = u.id
                ${whereClause}
                GROUP BY h.usuario_id, u.nombre, u.email
                ORDER BY cambios DESC
                LIMIT 10
            `, parametros);

            res.json({
                estadisticas: {
                    total_cambios: totalCambios.total,
                    cambios_por_tabla: cambiosPorTabla,
                    cambios_por_accion: cambiosPorAccion,
                    usuarios_activos: usuariosActivos
                }
            });

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }
}

export default new HistorialController();




