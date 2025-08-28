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
                const { userId, rol } = userData;
                
                // Guardar conexión del usuario
                this.connectedUsers.set(userId, socket.id);
                
                // Unir a sala según rol
                socket.join(rol);
                socket.join(`user_${userId}`);
                
                console.log(`✅ Usuario ${userId} (${rol}) autenticado en WebSocket`);
                
                // Confirmar autenticación
                socket.emit('authenticated', { success: true });
            });

            // Usuario se desconecta
            socket.on('disconnect', () => {
                console.log('🔌 Usuario desconectado:', socket.id);
                
                // Remover de usuarios conectados
                for (const [userId, socketId] of this.connectedUsers.entries()) {
                    if (socketId === socket.id) {
                        this.connectedUsers.delete(userId);
                        console.log(`✅ Usuario ${userId} removido de conexiones`);
                        break;
                    }
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
        const notification = {
            id: Date.now(),
            type: 'alert',
            title: '🚨 Nueva Alerta',
            message: alertData.descripcion,
            location: alertData.ubicacion,
            category: alertData.categoria,
            timestamp: new Date().toISOString(),
            alertId: alertData.id
        };

        // Enviar a todos los usuarios conectados excepto al creador
        this.io.emit('newAlert', notification);
        
        console.log(`📢 Notificación de alerta enviada a todos los usuarios (excepto creador ${creatorId})`);
        
        return notification;
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
}

export default new WebSocketService();
