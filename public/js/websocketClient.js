// Cliente WebSocket para notificaciones en tiempo real
class WebSocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.notifications = [];
        this.init();
    }

    init() {
        // Solo inicializar si el usuario está autenticado
        if (!window.auth || !window.auth.getUser()) {
            return;
        }

        this.connect();
        this.setupEventListeners();
    }

    connect() {
        try {
            // Conectar al WebSocket del servidor
            this.socket = io();
            
            this.socket.on('connect', () => {
                console.log('🔌 Conectado al WebSocket');
                this.isConnected = true;
                this.authenticate();
            });

            this.socket.on('disconnect', () => {
                console.log('🔌 Desconectado del WebSocket');
                this.isConnected = false;
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ Error conectando al WebSocket:', error);
                this.isConnected = false;
            });

        } catch (error) {
            console.error('❌ Error inicializando WebSocket:', error);
        }
    }

    authenticate() {
        if (!this.socket || !window.auth || !window.auth.getUser()) {
            return;
        }

        const user = window.auth.getUser();
        this.socket.emit('authenticate', {
            userId: user.id,
            rol: user.rol
        });

        this.socket.on('authenticated', (data) => {
            if (data.success) {
                console.log('✅ Autenticado en WebSocket');
            }
        });
    }

    setupEventListeners() {
        if (!this.socket) return;

        // Escuchar nuevas alertas
        this.socket.on('newAlert', (notification) => {
            console.log('🚨 Nueva alerta recibida:', notification);
            this.handleNewAlert(notification);
        });

        // Escuchar notificaciones generales
        this.socket.on('notification', (notification) => {
            console.log('📢 Notificación recibida:', notification);
            this.handleNotification(notification);
        });
    }

    handleNewAlert(notification) {
        // Agregar a la lista de notificaciones
        this.notifications.unshift({
            ...notification,
            read: false,
            receivedAt: new Date()
        });

        // Mostrar notificación del navegador
        this.showBrowserNotification(notification);

        // Actualizar el panel de notificaciones si existe
        this.updateNotificationsPanel();

        // Reproducir sonido de alerta
        this.playAlertSound();

        // Mostrar notificación en la UI
        this.showInAppNotification(notification);
    }

    handleNotification(notification) {
        // Agregar a la lista de notificaciones
        this.notifications.unshift({
            ...notification,
            read: false,
            receivedAt: new Date()
        });

        // Actualizar el panel de notificaciones
        this.updateNotificationsPanel();
    }

    showBrowserNotification(notification) {
        // Verificar si el navegador soporta notificaciones
        if (!('Notification' in window)) {
            console.log('⚠️ Este navegador no soporta notificaciones');
            return;
        }

        // Verificar si tenemos permisos
        if (Notification.permission === 'granted') {
            const browserNotification = new Notification(notification.title, {
                body: `${notification.message}\nUbicación: ${notification.location}`,
                icon: '/img/alert-icon.png', // Icono de alerta
                badge: '/img/badge-icon.png',
                tag: `alert-${notification.alertId}`,
                requireInteraction: true,
                actions: [
                    {
                        action: 'view',
                        title: 'Ver en mapa'
                    },
                    {
                        action: 'dismiss',
                        title: 'Cerrar'
                    }
                ]
            });

            // Manejar clicks en la notificación
            browserNotification.onclick = (event) => {
                event.preventDefault();
                if (event.action === 'view') {
                    this.openAlertInMap(notification);
                }
                browserNotification.close();
            };

        } else if (Notification.permission !== 'denied') {
            // Solicitar permisos
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showBrowserNotification(notification);
                }
            });
        }
    }

    showInAppNotification(notification) {
        // Crear notificación en la UI de la aplicación
        const notificationElement = document.createElement('div');
        notificationElement.className = 'in-app-notification';
        notificationElement.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <span class="notification-title">${notification.title}</span>
                    <button class="notification-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="notification-body">
                    <p>${notification.message}</p>
                    <p class="notification-location">📍 ${notification.location}</p>
                </div>
                <div class="notification-actions">
                    <button class="btn btn-primary btn-sm" onclick="websocketClient.openAlertInMap(${JSON.stringify(notification)})">
                        Ver en mapa
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="websocketClient.markAsRead(${notification.id})">
                        Marcar como leída
                    </button>
                </div>
            </div>
        `;

        // Agregar al contenedor de notificaciones
        const container = document.getElementById('notificationsContainer') || document.body;
        container.appendChild(notificationElement);

        // Auto-remover después de 10 segundos
        setTimeout(() => {
            if (notificationElement.parentElement) {
                notificationElement.remove();
            }
        }, 10000);
    }

    playAlertSound() {
        try {
            // Crear audio element para sonido de alerta
            const audio = new Audio('/sounds/alert.mp3'); // Archivo de sonido de alerta
            audio.volume = 0.5;
            audio.play().catch(error => {
                console.log('⚠️ No se pudo reproducir sonido de alerta:', error);
            });
        } catch (error) {
            console.log('⚠️ Error reproduciendo sonido:', error);
        }
    }

    openAlertInMap(notification) {
        // Centrar el mapa en la ubicación de la alerta
        if (window.mapa && window.mapa.centerOnLocation) {
            window.mapa.centerOnLocation(notification.latitud, notification.longitud);
        }

        // Mostrar la alerta en el mapa (si existe la funcionalidad)
        if (window.mapa && window.mapa.showAlert) {
            window.mapa.showAlert(notification);
        }

        // Marcar como leída
        this.markAsRead(notification.id);
    }

    markAsRead(notificationId) {
        // Marcar como leída localmente
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
        }

        // Enviar al servidor
        if (this.socket) {
            this.socket.emit('markNotificationRead', notificationId);
        }

        // Actualizar UI
        this.updateNotificationsPanel();
    }

    updateNotificationsPanel() {
        // Actualizar el panel de notificaciones si existe
        const panel = document.getElementById('notificationsPanel');
        if (panel) {
            this.renderNotificationsPanel(panel);
        }

        // Actualizar contador de notificaciones
        this.updateNotificationCounter();
    }

    renderNotificationsPanel(container) {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        container.innerHTML = `
            <div class="notifications-header">
                <h3>🔔 Notificaciones (${unreadCount} no leídas)</h3>
                ${unreadCount > 0 ? '<button class="btn btn-sm btn-primary" onclick="websocketClient.markAllAsRead()">Marcar todas como leídas</button>' : ''}
            </div>
            <div class="notifications-list">
                ${this.notifications.length === 0 ? '<p class="text-muted">No hay notificaciones</p>' : ''}
                ${this.notifications.map(notification => `
                    <div class="notification-item ${notification.read ? 'read' : 'unread'}">
                        <div class="notification-content">
                            <div class="notification-title">${notification.title}</div>
                            <div class="notification-message">${notification.message}</div>
                            <div class="notification-meta">
                                <span class="notification-location">📍 ${notification.location}</span>
                                <span class="notification-time">${this.formatTime(notification.receivedAt)}</span>
                            </div>
                        </div>
                        <div class="notification-actions">
                            ${!notification.read ? `<button class="btn btn-sm btn-outline-primary" onclick="websocketClient.markAsRead(${notification.id})">Marcar como leída</button>` : ''}
                            <button class="btn btn-sm btn-primary" onclick="websocketClient.openAlertInMap(${JSON.stringify(notification)})">Ver en mapa</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateNotificationCounter() {
        const counter = document.getElementById('notificationCounter');
        if (counter) {
            const unreadCount = this.notifications.filter(n => !n.read).length;
            counter.textContent = unreadCount;
            counter.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateNotificationsPanel();
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora mismo';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours} h`;
        return `Hace ${days} días`;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }
}

// Inicializar WebSocket client cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.websocketClient = new WebSocketClient();
    });
} else {
    window.websocketClient = new WebSocketClient();
}
