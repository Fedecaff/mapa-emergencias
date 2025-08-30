import { Server } from 'socket.io';

class WebSocketService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map(); // userId -> socketId
    }

    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.setupEventHandlers();
        console.log('✅ WebSocket service inicializado');
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log('🔌 Usuario conectado:', socket.id);

            // Usuario se autentica
            socket.on('authenticate', (userData) => {
                try {
                    const { userId, rol } = userData;
                    
                    // Guardar conexión del usuario
                    this.connectedUsers.set(userId, socket.id);
                    
                    // Unir a sala según rol
                    socket.join(rol);
                    socket.join(`user_${userId}`);
                    
                    console.log(`✅ Usuario ${userId} (${rol}) autenticado en WebSocket`);
                    
                    // Confirmar autenticación
                    socket.emit('authenticated', { success: true });
                } catch (error) {
                    console.error('❌ Error en autenticación WebSocket:', error);
                }
            });

            // Usuario se desconecta
            socket.on('disconnect', () => {
                try {
                    console.log('🔌 Usuario desconectado:', socket.id);
                    
                    // Remover de usuarios conectados
                    for (const [userId, socketId] of this.connectedUsers.entries()) {
                        if (socketId === socket.id) {
                            this.connectedUsers.delete(userId);
                            console.log(`✅ Usuario ${userId} removido de conexiones`);
                            break;
                        }
                    }
                } catch (error) {
                    console.error('❌ Error en desconexión WebSocket:', error);
                }
            });

            // Marcar notificación como leída
            socket.on('markNotificationRead', (notificationId) => {
                // Aquí implementaremos la lógica para marcar como leída
                console.log(`📖 Notificación ${notificationId} marcada como leída`);
            });
        });
    }

    // Enviar notificación de alerta a todos los usuarios excepto al creador
    sendAlertNotification(alertData, creatorId) {
        try {
            const notification = {
                id: Date.now(),
                type: 'alert',
                title: alertData.title || '🚨 Nueva Alerta',
                message: alertData.message || alertData.descripcion || 'Sin descripción',
                location: alertData.location || alertData.ubicacion || 'Sin dirección',
                category: alertData.category || alertData.categoria || 'Media',
                timestamp: new Date().toISOString(),
                alertId: alertData.alertId || alertData.id,
                latitud: alertData.latitud,
                longitud: alertData.longitud
            };

            // Enviar a todos los usuarios conectados excepto al creador
            let sentCount = 0;
            this.io.sockets.sockets.forEach((socket, socketId) => {
                try {
                    const socketUserId = this.getUserIdBySocketId(socketId);
                    if (socketUserId && socketUserId !== creatorId) {
                        socket.emit('newAlert', notification);
                        sentCount++;
                        console.log(`📢 Notificación enviada a usuario ${socketUserId}`);
                    }
                } catch (socketError) {
                    console.warn(`⚠️ Error enviando notificación a socket ${socketId}:`, socketError);
                }
            });
            
            console.log(`📢 Notificación de alerta enviada a ${sentCount} usuarios (excepto creador ${creatorId})`);
            
            return notification;
        } catch (error) {
            console.error('❌ Error en sendAlertNotification:', error);
            throw error;
        }
    }

    // Obtener userId por socketId
    getUserIdBySocketId(socketId) {
        for (const [userId, id] of this.connectedUsers.entries()) {
            if (id === socketId) {
                return userId;
            }
        }
        return null;
    }

    // Enviar notificación específica a un usuario
    sendNotificationToUser(userId, notification) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.io.to(socketId).emit('notification', notification);
            console.log(`📢 Notificación enviada a usuario ${userId}`);
            return true;
        } else {
            console.log(`⚠️ Usuario ${userId} no está conectado`);
            return false;
        }
    }

    // Enviar notificación a todos los usuarios de un rol específico
    sendNotificationToRole(role, notification, excludeUserId = null) {
        if (excludeUserId) {
            // Enviar a todos excepto al usuario excluido
            this.io.to(role).emit('notification', notification);
            console.log(`📢 Notificación enviada a rol ${role} (excepto usuario ${excludeUserId})`);
        } else {
            this.io.to(role).emit('notification', notification);
            console.log(`📢 Notificación enviada a rol ${role}`);
        }
    }

    // Obtener usuarios conectados
    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys());
    }

    // Verificar si un usuario está conectado
    isUserConnected(userId) {
        return this.connectedUsers.has(userId);
    }

    // Enviar notificación de alerta eliminada a todos los usuarios excepto al que elimina
    sendAlertDeletedNotification(notificationData, excludeUserId = null) {
        const notification = {
            id: Date.now(),
            type: 'alertDeleted',
            title: notificationData.title,
            message: notificationData.message,
            alertId: notificationData.alertId,
            timestamp: new Date().toISOString()
        };

        if (excludeUserId) {
            // Enviar a todos los usuarios conectados excepto al que elimina
            let sentCount = 0;
            this.io.sockets.sockets.forEach((socket, socketId) => {
                try {
                    const socketUserId = this.getUserIdBySocketId(socketId);
                    if (socketUserId && socketUserId !== excludeUserId) {
                        socket.emit('alertDeleted', notification);
                        sentCount++;
                    }
                } catch (socketError) {
                    console.warn(`⚠️ Error enviando notificación de eliminación a socket ${socketId}:`, socketError);
                }
            });
            
            console.log(`📢 Notificación de alerta eliminada enviada a ${sentCount} usuarios (excepto usuario ${excludeUserId})`);
        } else {
            // Enviar a todos los usuarios conectados
            this.io.emit('alertDeleted', notification);
            console.log(`📢 Notificación de alerta eliminada enviada a todos los usuarios`);
        }
        
        return notification;
    }
}

export default new WebSocketService();
