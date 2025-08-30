import baseDeDatos from '../modelos/baseDeDatosPostgres.js';
import websocketService from '../servicios/websocketService.js';

const alertasController = {

    // Crear nueva alerta de emergencia
    async crear(req, res) {
        try {
            console.log('🚨 === INICIO CREACIÓN ALERTA ===');
            console.log('📤 Datos recibidos:', req.body);
            console.log('👤 Usuario:', req.usuario);
            
            const {
                tipo,
                prioridad = 'media',
                titulo,
                descripcion,
                latitud,
                longitud,
                direccion,
                personas_afectadas = 0,
                riesgos_especificos,
                concurrencia_solicitada = 1
            } = req.body;

            // Validaciones básicas
            if (!tipo || !titulo || !latitud || !longitud) {
                console.log('❌ Validación fallida: campos requeridos');
                return res.status(400).json({
                    error: 'Tipo, título, latitud y longitud son requeridos'
                });
            }

            console.log('✅ Validaciones pasadas');
            console.log('🔍 Verificando conexión a BD...');

            // Verificar conexión a base de datos
            try {
                await baseDeDatos.ejecutar('SELECT 1');
                console.log('✅ Conexión a BD verificada');
            } catch (dbError) {
                console.error('❌ Error de conexión a BD:', dbError);
                return res.status(500).json({
                    error: 'Error de conexión a base de datos',
                    details: dbError.message
                });
            }

            console.log('🔍 Insertando alerta...');
            
            // Query con ID explícito usando nextval
            const resultado = await baseDeDatos.ejecutar(`
                INSERT INTO alertas_emergencia (
                    id, tipo, prioridad, titulo, descripcion, latitud, longitud, 
                    direccion, personas_afectadas, riesgos_especificos, 
                    concurrencia_solicitada, usuario_id
                ) VALUES (nextval('alertas_emergencia_id_seq'), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
                RETURNING id
            `, [
                tipo, prioridad, titulo, descripcion, latitud, longitud,
                direccion, personas_afectadas, riesgos_especificos,
                concurrencia_solicitada, req.usuario.id
            ]);

            console.log('✅ Alerta insertada, ID:', resultado.rows[0].id);

            // Obtener la alerta completa con información del usuario
            const alertaCompleta = await baseDeDatos.obtenerUno(`
                SELECT a.*, u.nombre as usuario_nombre, u.telefono as usuario_telefono
                FROM alertas_emergencia a
                JOIN usuarios u ON a.usuario_id = u.id
                WHERE a.id = $1
            `, [resultado.rows[0].id]);

            // Respuesta con alerta completa
            res.status(201).json({
                mensaje: 'Alerta creada exitosamente',
                alerta: alertaCompleta
            });

            // Enviar notificación WebSocket a todos los usuarios excepto al creador
            try {
                const notificationData = {
                    id: alertaCompleta.id,
                    type: 'alert',
                    title: '🚨 Nueva Alerta',
                    message: alertaCompleta.descripcion || 'Sin descripción',
                    location: alertaCompleta.direccion || 'Sin dirección',
                    category: alertaCompleta.prioridad,
                    timestamp: new Date().toISOString(),
                    alertId: alertaCompleta.id,
                    latitud: alertaCompleta.latitud,
                    longitud: alertaCompleta.longitud
                };
                
                websocketService.sendAlertNotification(notificationData, req.usuario.id);
                console.log('📢 Notificación WebSocket enviada');
            } catch (wsError) {
                console.error('❌ Error enviando notificación WebSocket:', wsError);
            }

            console.log('🚨 === FIN CREACIÓN ALERTA ===');

        } catch (error) {
            console.error('❌ Error en crear alerta:', error);
            console.error('📊 Stack trace:', error.stack);
            
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Error interno del servidor',
                    details: error.message
                });
            }
        }
    },

    // Obtener todas las alertas activas
    async listar(req, res) {
        try {
            const alertas = await baseDeDatos.obtenerTodos(`
                SELECT a.*, u.nombre as usuario_nombre, u.telefono as usuario_telefono
                FROM alertas_emergencia a
                JOIN usuarios u ON a.usuario_id = u.id
                WHERE a.estado = 'activa'
                ORDER BY 
                    CASE a.prioridad 
                        WHEN 'alta' THEN 1 
                        WHEN 'media' THEN 2 
                        WHEN 'baja' THEN 3 
                    END,
                    a.fecha_creacion DESC
            `);

            res.json({ alertas });

        } catch (error) {
            console.error('❌ Error listando alertas:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    },

    // Obtener una alerta por ID
    async obtener(req, res) {
        try {
            const { id } = req.params;

            const alerta = await baseDeDatos.obtenerUno(`
                SELECT a.*, u.nombre as usuario_nombre, u.telefono as usuario_telefono
                FROM alertas_emergencia a
                JOIN usuarios u ON a.usuario_id = u.id
                WHERE a.id = $1
            `, [id]);

            if (!alerta) {
                return res.status(404).json({
                    error: 'Alerta no encontrada'
                });
            }

            res.json({ alerta });

        } catch (error) {
            console.error('❌ Error obteniendo alerta:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    },

    // Actualizar estado de alerta (solo admins)
    async actualizarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            // Validar estado
            const estadosValidos = ['activa', 'en_proceso', 'resuelta', 'cancelada'];
            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({
                    error: 'Estado inválido'
                });
            }

            // Verificar que la alerta existe
            const alertaExistente = await baseDeDatos.obtenerUno(
                'SELECT id FROM alertas_emergencia WHERE id = $1',
                [id]
            );

            if (!alertaExistente) {
                return res.status(404).json({
                    error: 'Alerta no encontrada'
                });
            }

            // Actualizar estado
            await baseDeDatos.ejecutar(`
                UPDATE alertas_emergencia 
                SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP 
                WHERE id = $2
            `, [estado, id]);

            console.log(`🔄 Alerta ${id} actualizada a estado: ${estado}`);

            res.json({
                mensaje: 'Estado de alerta actualizado exitosamente'
            });

        } catch (error) {
            console.error('❌ Error actualizando alerta:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    },

    // Eliminar alerta (solo admins)
    async eliminar(req, res) {
        try {
            const { id } = req.params;

            // Verificar que la alerta existe
            const alertaExistente = await baseDeDatos.obtenerUno(
                'SELECT id FROM alertas_emergencia WHERE id = $1',
                [id]
            );

            if (!alertaExistente) {
                return res.status(404).json({
                    error: 'Alerta no encontrada'
                });
            }

            // Eliminar alerta
            await baseDeDatos.ejecutar(
                'DELETE FROM alertas_emergencia WHERE id = $1',
                [id]
            );

            console.log(`🗑️ Alerta eliminada: ${id}`);

            // Enviar notificación WebSocket a todos los usuarios excepto al que elimina
            try {
                const notificationData = {
                    id: id,
                    type: 'alertDeleted',
                    title: '🗑️ Alerta Eliminada',
                    message: 'Una alerta ha sido dada de baja',
                    alertId: id
                };
                
                websocketService.sendAlertDeletedNotification(notificationData, req.usuario.id);
                console.log('📢 Notificación de eliminación WebSocket enviada');
            } catch (error) {
                console.error('❌ Error enviando notificación de eliminación WebSocket:', error);
            }

            res.json({
                mensaje: 'Alerta eliminada exitosamente'
            });

        } catch (error) {
            console.error('❌ Error eliminando alerta:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }
};

export default alertasController;
