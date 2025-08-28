import baseDeDatos from '../modelos/baseDeDatosPostgres.js';
import websocketService from '../servicios/websocketService.js';

const alertasController = {

    // Crear nueva alerta de emergencia
    async crear(req, res) {
        try {
            console.log('📤 Datos recibidos para crear alerta:', req.body);
            console.log('👤 Usuario autenticado:', req.usuario);
            
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

            // Validaciones
            if (!tipo || !titulo || !latitud || !longitud) {
                return res.status(400).json({
                    error: 'Tipo, título, latitud y longitud son requeridos'
                });
            }

            // Validar coordenadas
            if (latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
                return res.status(400).json({
                    error: 'Coordenadas inválidas'
                });
            }

            // Validar prioridad
            const prioridadesValidas = ['baja', 'media', 'alta'];
            if (!prioridadesValidas.includes(prioridad)) {
                return res.status(400).json({
                    error: 'Prioridad inválida'
                });
            }

            // Validar concurrencia solicitada
            console.log('🔍 Validando concurrencia:', concurrencia_solicitada);
            console.log('🔍 Tipo de concurrencia:', typeof concurrencia_solicitada);
            
            if (concurrencia_solicitada !== 'todos' && (isNaN(concurrencia_solicitada) || concurrencia_solicitada < 1)) {
                console.log('❌ Concurrencia inválida:', concurrencia_solicitada);
                return res.status(400).json({
                    error: 'La concurrencia solicitada debe ser un número mayor a 0 o "todos"'
                });
            }
            
            console.log('✅ Concurrencia válida:', concurrencia_solicitada);

            // Insertar alerta
            console.log('🗄️ Intentando insertar alerta en la base de datos...');
            console.log('📊 Datos a insertar:', {
                tipo, prioridad, titulo, descripcion, latitud, longitud,
                direccion, personas_afectadas, riesgos_especificos,
                concurrencia_solicitada, usuario_id: req.usuario.id
            });
            
            const resultado = await baseDeDatos.ejecutar(`
                INSERT INTO alertas_emergencia (
                    tipo, prioridad, titulo, descripcion, latitud, longitud, 
                    direccion, personas_afectadas, riesgos_especificos, 
                    concurrencia_solicitada, usuario_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
                RETURNING id
            `, [
                tipo, prioridad, titulo, descripcion, latitud, longitud,
                direccion, personas_afectadas, riesgos_especificos,
                concurrencia_solicitada, req.usuario.id
            ]);
            
            console.log('✅ Alerta insertada correctamente, ID:', resultado.rows[0].id);

            // Obtener la alerta creada
            const alerta = await baseDeDatos.obtenerUno(`
                SELECT a.*, u.nombre as usuario_nombre, u.telefono as usuario_telefono
                FROM alertas_emergencia a
                JOIN usuarios u ON a.usuario_id = u.id
                WHERE a.id = $1
            `, [resultado.rows[0].id]);

            console.log(`🚨 Alerta creada: ${titulo} (ID: ${resultado.rows[0].id})`);
            
            // Enviar notificaciones WhatsApp a operadores disponibles
            try {
                console.log('📱 Iniciando envío de notificaciones WhatsApp...');
                
                // Obtener operadores disponibles con teléfono
                const operadores = await baseDeDatos.obtenerTodos(`
                    SELECT id, nombre, telefono, disponible, institucion
                    FROM usuarios 
                    WHERE rol = 'operador' 
                    AND disponible = true 
                    AND telefono IS NOT NULL 
                    AND telefono != ''
                `);
                
                if (operadores.length > 0) {
                    console.log(`📱 ${operadores.length} operadores disponibles para notificaciones`);
                    // TODO: Implementar notificaciones por email y push
                } else {
                    console.log('ℹ️ No hay operadores disponibles para notificar');
                }
                
            } catch (error) {
                console.error('❌ Error obteniendo operadores para notificación:', error);
            }
            
            console.log('📤 Enviando respuesta al cliente...');

            res.status(201).json({
                mensaje: 'Alerta de emergencia creada exitosamente',
                alerta
            });
            
            // Enviar notificación WebSocket a todos los usuarios excepto al creador
            try {
                const notificationData = {
                    id: alerta.id,
                    tipo: alerta.tipo,
                    titulo: alerta.titulo,
                    descripcion: alerta.descripcion,
                    ubicacion: alerta.direccion || `${alerta.latitud}, ${alerta.longitud}`,
                    categoria: alerta.tipo,
                    prioridad: alerta.prioridad,
                    latitud: alerta.latitud,
                    longitud: alerta.longitud
                };
                
                websocketService.sendAlertNotification(notificationData, req.usuario.id);
                console.log('📢 Notificación WebSocket enviada');
            } catch (error) {
                console.error('❌ Error enviando notificación WebSocket:', error);
            }
            
            console.log('✅ Respuesta enviada exitosamente');

        } catch (error) {
            console.error('❌ Error creando alerta:', error);
            console.error('📊 Datos que causaron el error:', {
                tipo, prioridad, titulo, descripcion, latitud, longitud,
                direccion, personas_afectadas, riesgos_especificos,
                concurrencia_solicitada, usuario_id: req.usuario.id
            });
            res.status(500).json({
                error: 'Error interno del servidor',
                details: error.message
            });
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

            // Enviar notificación WebSocket a todos los usuarios
            try {
                const notificationData = {
                    id: id,
                    type: 'alertDeleted',
                    title: '🗑️ Alerta Eliminada',
                    message: 'Una alerta ha sido dada de baja',
                    alertId: id
                };
                
                websocketService.sendAlertDeletedNotification(notificationData);
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
