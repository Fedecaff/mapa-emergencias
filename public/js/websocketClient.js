// Cliente WebSocket para notificaciones en tiempo real
class WebSocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.notifications = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.alertasActivas = [];
        this.init();
    }

    getCurrentUser() {
        // Preferir instancia de auth si existe
        if (window.auth && window.auth.currentUser) return window.auth.currentUser;
        // Respaldo: leer de Storage/localStorage
        try {
            return Storage ? Storage.get('user') : JSON.parse(localStorage.getItem('user'));
        } catch (_) {
            return null;
        }
    }

    init() {
        const user = this.getCurrentUser();
        if (!user) {
            // Si aún no está listo auth/usuario, reintentar pronto
            setTimeout(() => this.init(), 500);
            return;
        }
        
        // Solo conectar si no está ya conectado
        if (!this.isConnected) {
            this.connect();
            this.setupEventListeners();
        }
    }

    connect() {
        try {
            // Evitar múltiples conexiones simultáneas
            if (this.socket && this.socket.connected) {
                console.log('🔌 WebSocket ya conectado');
                return;
            }
            
            this.socket = io({
                timeout: 20000,
                forceNew: true
            });
            
            this.socket.on('connect', () => {
                console.log('🔌 Conectado al WebSocket');
                this.isConnected = true;
                this.reconnectAttempts = 0; // Resetear contador de intentos
                this.authenticate();
            });

            this.socket.on('disconnect', (reason) => {
                console.log('🔌 Desconectado del WebSocket. Razón:', reason);
                this.isConnected = false;
                
                // Solo intentar reconectar si el usuario está autenticado y no hemos excedido los intentos
                const user = this.getCurrentUser();
                if (user && this.reconnectAttempts < this.maxReconnectAttempts && reason !== 'io client disconnect') {
                    this.reconnectAttempts++;
                    setTimeout(() => {
                        if (!this.isConnected) {
                            console.log(`🔄 Intentando reconectar WebSocket (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
                            this.connect();
                        }
                    }, 3000);
                } else if (!user) {
                    console.log('👤 Usuario no autenticado, no reconectando WebSocket');
                } else if (reason === 'io client disconnect') {
                    console.log('🔌 Desconexión manual del WebSocket');
                } else {
                    console.log('❌ Máximo de intentos de reconexión alcanzado');
                }
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
        if (!this.socket) return;
        const user = this.getCurrentUser();
        if (!user) return;

        this.socket.emit('authenticate', {
            userId: user.id,
            rol: user.rol
        });

        this.socket.on('authenticated', (data) => {
            if (data.success) {
                console.log('✅ Autenticado en WebSocket');
                // Cargar alertas activas después de autenticarse
                this.cargarAlertasActivas();
            }
        });
    }

    setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('newAlert', (notification) => {
            console.log('🚨 === NUEVA ALERTA RECIBIDA ===');
            console.log('🚨 Notificación completa:', notification);
            console.log('🚨 Usuario actual:', this.getCurrentUser());
            console.log('🚨 WebSocket conectado:', this.isConnected);
            this.handleNewAlert(notification);
        });

        this.socket.on('notification', (notification) => {
            console.log('📢 Notificación recibida:', notification);
            this.handleNotification(notification);
        });

        this.socket.on('alertDeleted', (notification) => {
            console.log('🗑️ Alerta eliminada recibida:', notification);
            this.handleAlertDeleted(notification);
        });
    }

    handleNewAlert(notification) {
        console.log('🚨 === PROCESANDO NUEVA ALERTA ===');
        console.log('🚨 Notificación recibida:', notification);
        
        // Asegurar que la notificación tenga el tipo correcto
        const newAlertNotification = {
            ...notification,
            type: 'alert', // Asegurar que tenga el tipo correcto
            read: false,
            receivedAt: new Date()
        };
        
        console.log('🚨 Notificación procesada:', newAlertNotification);
        
        this.notifications.unshift(newAlertNotification);
        console.log('🚨 Notificación agregada al array local');
        
        this.showBrowserNotification(notification);
        console.log('🚨 Notificación del navegador mostrada');
        
        this.updateNotificationsPanel();
        console.log('🚨 Panel de notificaciones actualizado');
        
        this.playAlertSound();
        console.log('🚨 Sonido de alerta reproducido');
        
        this.showInAppNotification(notification);
        console.log('🚨 Notificación in-app mostrada');
        
        // Mostrar la alerta en el mapa en tiempo real
        this.mostrarAlertaEnMapa(notification);
        console.log('🚨 Alerta mostrada en mapa');
        
        console.log('🚨 === FIN PROCESAMIENTO ALERTA ===');
    }

    handleNotification(notification) {
        this.notifications.unshift({
            ...notification,
            read: false,
            receivedAt: new Date()
        });
        this.updateNotificationsPanel();
    }

    handleAlertDeleted(notification) {
        console.log('🗑️ Procesando alerta eliminada:', notification);
        
        // Remover la alerta del mapa
        this.removerAlertaDelMapa(notification.alertId);
        
        // Mostrar notificación
        Notifications.info('Una alerta ha sido dada de baja');
        
        // Agregar a la lista de notificaciones con tipo específico
        const deletedNotification = {
            ...notification,
            type: 'alertDeleted', // Asegurar que tenga el tipo correcto
            read: false,
            receivedAt: new Date()
        };
        
        this.notifications.unshift(deletedNotification);
        this.updateNotificationsPanel();
        
        console.log('🗑️ Notificación de eliminación agregada:', deletedNotification);
    }

    showBrowserNotification(notification) {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            const browserNotification = new Notification(notification.title, {
                body: `${notification.message}\nUbicación: ${notification.location}`,
                icon: '/img/alert-icon.png',
                badge: '/img/badge-icon.png',
                tag: `alert-${notification.alertId}`,
                requireInteraction: true
            });
            browserNotification.onclick = (event) => {
                event.preventDefault();
                this.openAlertInMap(notification);
                browserNotification.close();
            };
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') this.showBrowserNotification(notification);
            });
        }
    }

    showInAppNotification(notification) {
        // Validar que la notificación tenga ID
        if (!notification || !notification.id) {
            console.error('❌ Notificación inválida para mostrar in-app:', notification);
            return;
        }

        const notificationElement = document.createElement('div');
        notificationElement.className = 'in-app-notification';
        notificationElement.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <span class="notification-title">${notification.title || 'Notificación'}</span>
                    <button class="notification-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="notification-body">
                    <p>${notification.message || 'Sin mensaje'}</p>
                    <p class="notification-location">📍 ${notification.location || 'Sin ubicación'}</p>
                </div>
                <div class="notification-actions">
                    <button class="btn btn-primary btn-sm" onclick="websocketClient.openAlertInMapById(${notification.id})">Ver en mapa</button>
                    <button class="btn btn-secondary btn-sm" onclick="websocketClient.markAsRead(${notification.id})">Marcar como leída</button>
                </div>
            </div>
        `;
        const container = document.getElementById('notificationsContainer') || document.body;
        container.appendChild(notificationElement);
        
        // Determinar duración basada en el tipo de notificación
        let duration = 10000; // Por defecto 10 segundos
        if (notification.type === 'alertDeleted' || notification.title?.includes('🗑️ Alerta Eliminada')) {
            duration = 3000; // 3 segundos para notificaciones de eliminación
        } else if (notification.type === 'alert') {
            duration = 10000; // 10 segundos para alertas de emergencia
        } else {
            duration = 5000; // 5 segundos para otras notificaciones
        }
        
        setTimeout(() => { 
            if (notificationElement.parentElement) notificationElement.remove(); 
        }, duration);
    }

    playAlertSound() {
        try {
            const audio = new Audio('/sounds/alert.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {});
        } catch (_) {}
    }

    // Mostrar alerta en el mapa cuando llega una notificación
    mostrarAlertaEnMapa(notification) {
        // Validar que las coordenadas existan
        if (!notification.latitud || !notification.longitud) {
            console.error('❌ Coordenadas faltantes para mostrar en mapa:', notification);
            return;
        }
        
        // Convertir a números
        const lat = parseFloat(notification.latitud);
        const lng = parseFloat(notification.longitud);
        
        if (isNaN(lat) || isNaN(lng)) {
            console.error('❌ Coordenadas inválidas para mostrar en mapa:', notification.latitud, notification.longitud);
            return;
        }
        
        // Esperar a que alertasManager esté disponible y usar su función
        const waitForAlertasManager = () => {
            if (window.alertasManager) {
                // Crear objeto de alerta compatible con alertasManager
                const alertaData = {
                    id: notification.alertId,
                    titulo: notification.title || 'Nueva Alerta',
                    descripcion: notification.message || 'Sin descripción',
                    direccion: notification.location || 'Sin ubicación',
                    prioridad: notification.category || 'media',
                    tipo: 'otro',
                    latitud: lat,
                    longitud: lng,
                    fecha_creacion: new Date().toISOString(),
                    usuario_nombre: 'Usuario',
                    concurrencia_solicitada: '1',
                    estado: 'activa'
                };
                
                // Usar la función de alertasManager para crear el marcador con popup completo
                window.alertasManager.crearMarcadorAlertaActiva(alertaData);
                
                console.log('✅ Alerta mostrada en mapa en tiempo real usando alertasManager:', lat, lng);
            } else {
                setTimeout(waitForAlertasManager, 100);
            }
        };
        waitForAlertasManager();
    }

    // Remover alerta del mapa cuando se da de baja
    removerAlertaDelMapa(alertId) {
        if (!window.mapManager || !window.mapManager.map) {
            return;
        }
        
        // Convertir alertId a número para comparación consistente
        const alertIdNum = parseInt(alertId);
        
        window.mapManager.map.eachLayer((layer) => {
            // Verificar si es un marcador de emergencia
            if (layer._icon && layer._icon.className && layer._icon.className.includes('emergency-marker')) {
                // Buscar marcadores por alertId (comparando como números)
                if (layer._alertaId === alertIdNum) {
                    window.mapManager.map.removeLayer(layer);
                    console.log('✅ Alerta removida del mapa:', alertId);
                }
            }
        });
    }

    openAlertInMap(notification) {
        console.log('🗺️ Abriendo alerta en mapa:', notification);
        
        // Validar que las coordenadas existan
        if (!notification.latitud || !notification.longitud) {
            console.error('❌ Coordenadas faltantes en notificación:', notification);
            Notifications.error('No se pueden mostrar las coordenadas de la alerta');
            return;
        }
        
        // Convertir a números si son strings
        const lat = parseFloat(notification.latitud);
        const lng = parseFloat(notification.longitud);
        
        if (isNaN(lat) || isNaN(lng)) {
            console.error('❌ Coordenadas inválidas:', notification.latitud, notification.longitud);
            Notifications.error('Coordenadas de la alerta inválidas');
            return;
        }
        
        // Centrar el mapa en la ubicación de la alerta
        if (window.mapManager && window.mapManager.map) {
            window.mapManager.map.setView([lat, lng], 15);
            console.log('✅ Mapa centrado en:', lat, lng);
        }
        
        // Mostrar la alerta en el mapa (si existe la funcionalidad)
        if (window.mapManager && window.mapManager.showAlert) {
            window.mapManager.showAlert(notification);
        }
        
        // Marcar como leída
        this.markAsRead(notification.id);
    }

    openAlertInMapById(notificationId) {
        console.log('🗺️ Buscando notificación por ID:', notificationId);
        
        // Buscar la notificación en el array local
        const notification = this.notifications.find(n => n.id === notificationId);
        
        if (!notification) {
            console.error('❌ Notificación no encontrada:', notificationId);
            Notifications.error('Notificación no encontrada');
            return;
        }
        
        console.log('✅ Notificación encontrada:', notification);
        
        // Verificar si es una notificación de alerta eliminada
        if (notification.type === 'alertDeleted') {
            console.log('⚠️ No se puede mostrar en mapa una alerta eliminada');
            Notifications.info('Esta alerta ha sido eliminada y no se puede mostrar en el mapa');
            return;
        }

        // Verificar si la notificación tiene coordenadas válidas
        if (!notification.latitud || !notification.longitud) {
            console.error('❌ Notificación sin coordenadas válidas:', notification);
            Notifications.error('No se pueden mostrar las coordenadas de la alerta');
            return;
        }
        
        // Verificar que no sea una notificación de eliminación por el título
        if (notification.title && notification.title.includes('🗑️ Alerta Eliminada')) {
            console.log('⚠️ Detectada notificación de alerta eliminada por título');
            Notifications.info('Esta alerta ha sido eliminada y no se puede mostrar en el mapa');
            return;
        }
        
        // Simplemente centrar el mapa en la alerta (sin abrir modal)
        this.centerMapOnAlert(notification.latitud, notification.longitud);
        
        // Marcar como leída
        this.markAsRead(notification.id);
    }

    showAlertDetailsPopup(notification) {
        console.log('📋 Mostrando detalles de alerta:', notification);
        console.log('📋 Tipo de notificación:', notification.type);
        console.log('📋 Título:', notification.title);
        console.log('📋 Coordenadas:', notification.latitud, notification.longitud);
        
        // Crear el modal/popup detallado
        const modalHtml = `
            <div id="alertDetailsModal" class="modal fade" tabindex="-1" role="dialog">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-fire"></i> Detalles de la Alerta
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <h4 class="text-danger">${notification.title || 'Alerta de Emergencia'}</h4>
                                    <hr>
                                    <div class="alert-details">
                                        <div class="detail-item">
                                            <strong><i class="fas fa-info-circle"></i> Descripción:</strong>
                                            <p class="mt-2">${notification.message || 'Sin descripción disponible'}</p>
                                        </div>
                                        
                                        <div class="detail-item">
                                            <strong><i class="fas fa-map-marker-alt"></i> Ubicación:</strong>
                                            <p class="mt-2">${notification.location || 'Ubicación no especificada'}</p>
                                        </div>
                                        
                                        <div class="detail-item">
                                            <strong><i class="fas fa-exclamation-triangle"></i> Prioridad:</strong>
                                            <span class="badge bg-${this.getPriorityColor(notification.category)}">${notification.category || 'Media'}</span>
                                        </div>
                                        
                                        <div class="detail-item">
                                            <strong><i class="fas fa-clock"></i> Fecha de Creación:</strong>
                                            <p class="mt-2">${this.formatDateTime(notification.receivedAt || new Date())}</p>
                                        </div>
                                        
                                        ${notification.alertId ? `
                                        <div class="detail-item">
                                            <strong><i class="fas fa-hashtag"></i> ID de Alerta:</strong>
                                            <p class="mt-2">#${notification.alertId}</p>
                                        </div>
                                        ` : ''}
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="alert-actions">
                                        <h5><i class="fas fa-tools"></i> Acciones</h5>
                                        <div class="d-grid gap-2">
                                            <button class="btn btn-primary" onclick="websocketClient.centerMapOnAlert(${notification.latitud}, ${notification.longitud})">
                                                <i class="fas fa-map"></i> Ver en Mapa
                                            </button>
                                            <button class="btn btn-success" onclick="websocketClient.getDirectionsToAlert(${notification.latitud}, ${notification.longitud})">
                                                <i class="fas fa-route"></i> Obtener Ruta
                                            </button>
                                            <button class="btn btn-info" onclick="websocketClient.markAsRead(${notification.id})">
                                                <i class="fas fa-check"></i> Marcar como Leída
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal anterior si existe
        const existingModal = document.getElementById('alertDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Agregar el modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Mostrar el modal
        try {
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const modal = new bootstrap.Modal(document.getElementById('alertDetailsModal'));
                modal.show();
            } else {
                // Fallback: mostrar como popup simple
                const modalElement = document.getElementById('alertDetailsModal');
                modalElement.style.display = 'block';
                modalElement.classList.add('show');
                
                // Agregar backdrop
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                document.body.appendChild(backdrop);
                
                // Cerrar con clic en backdrop o botón
                backdrop.addEventListener('click', () => {
                    modalElement.style.display = 'none';
                    modalElement.classList.remove('show');
                    backdrop.remove();
                });
                
                const closeBtn = modalElement.querySelector('.btn-close, .btn-secondary');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        modalElement.style.display = 'none';
                        modalElement.classList.remove('show');
                        backdrop.remove();
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error mostrando modal:', error);
            // Fallback: mostrar información en consola
            console.log('📋 Detalles de la alerta:', notification);
            Notifications.info('Detalles de la alerta mostrados en consola');
        }
        
        // Limpiar el modal cuando se cierre
        document.getElementById('alertDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    getPriorityColor(priority) {
        switch(priority?.toLowerCase()) {
            case 'alta': return 'danger';
            case 'media': return 'warning';
            case 'baja': return 'success';
            default: return 'secondary';
        }
    }

    formatDateTime(date) {
        return new Date(date).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    centerMapOnAlert(lat, lng) {
        if (window.mapManager && window.mapManager.map) {
            window.mapManager.map.setView([lat, lng], 15);
            console.log('✅ Mapa centrado en alerta:', lat, lng);
        }
    }

    getDirectionsToAlert(lat, lng) {
        if (window.direccionesManager) {
            window.direccionesManager.selectPoint({
                latitud: lat,
                longitud: lng,
                nombre: 'Alerta de Emergencia'
            });
            console.log('✅ Ruta solicitada hacia alerta:', lat, lng);
        } else {
            Notifications.warning('El sistema de direcciones no está disponible');
        }
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) notification.read = true;
        if (this.socket) this.socket.emit('markNotificationRead', notificationId);
        this.updateNotificationsPanel();
    }

    updateNotificationsPanel() {
        const panel = document.getElementById('notificationsPanel');
        if (panel) this.renderNotificationsPanel(panel);
        this.updateNotificationCounter();
    }

    renderNotificationsPanel(container) {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        container.innerHTML = `
            <div class="notifications-header">
                <h3>🔔 Notificaciones (${unreadCount} no leídas)</h3>
                <div class="notification-actions-header">
                    ${unreadCount > 0 ? '<button class="btn btn-sm btn-primary" onclick="websocketClient.markAllAsRead()">Marcar todas como leídas</button>' : ''}
                    <button class="btn btn-sm btn-warning" onclick="websocketClient.limpiarNotificacionesIncorrectas()">🔧 Limpiar</button>
                    <button class="btn btn-sm btn-info" onclick="websocketClient.debugNotificaciones()">🐛 Debug</button>
                </div>
            </div>
            <div class="notifications-list">
                ${this.notifications.length === 0 ? '<p class="text-muted">No hay notificaciones</p>' : ''}
                ${this.notifications.map(notification => `
                    <div class="notification-item ${notification.read ? 'read' : 'unread'}">
                        <div class="notification-content">
                            <div class="notification-title">
                                ${notification.title}
                                <small class="text-muted">[${notification.type || 'unknown'}]</small>
                            </div>
                            <div class="notification-message">${notification.message}</div>
                            <div class="notification-meta">
                                <span class="notification-location">📍 ${notification.location}</span>
                                <span class="notification-time">${this.formatTime(notification.receivedAt)}</span>
                            </div>
                        </div>
                        <div class="notification-actions">
                            ${!notification.read ? `<button class="btn btn-sm btn-outline-primary" onclick="websocketClient.markAsRead(${notification.id})">Marcar como leída</button>` : ''}
                            <button class="btn btn-sm btn-primary" onclick="websocketClient.openAlertInMapById(${notification.id})">Ver en mapa</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateNotificationCounter() {
        const counter = document.getElementById('notificationCounter');
        if (!counter) return;
        const unreadCount = this.notifications.filter(n => !n.read).length;
        counter.textContent = unreadCount;
        counter.style.display = unreadCount > 0 ? 'block' : 'none';
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
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
            try {
                // Remover todos los event listeners para evitar reconexiones automáticas
                this.socket.removeAllListeners();
                
                // Desconectar con razón específica para evitar reconexiones automáticas
                this.socket.disconnect(true);
                
                this.socket = null;
                this.isConnected = false;
                this.reconnectAttempts = 0; // Resetear contador de intentos
                console.log('🔌 WebSocket desconectado manualmente');
            } catch (error) {
                console.error('❌ Error desconectando WebSocket:', error);
                // Forzar limpieza
                this.socket = null;
                this.isConnected = false;
                this.reconnectAttempts = 0;
            }
        }
    }

    // Verificar estado de la conexión
    checkConnection() {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ WebSocket no conectado, intentando reconectar...');
            this.connect();
            return false;
        }
        return true;
    }

    // Reconectar manualmente
    reconnect() {
        console.log('🔄 Reconectando WebSocket manualmente...');
        this.disconnect();
        setTimeout(() => {
            this.connect();
        }, 1000);
    }

    // Cargar alertas activas cuando se autentica
    async cargarAlertasActivas() {
        try {
            const response = await API.get('/alertas/listar');
            const alertas = response.alertas || [];
            
            // Guardar las alertas activas para verificación
            this.alertasActivas = alertas.filter(a => a.estado === 'activa');
            
            // Mostrar solo alertas activas
            this.alertasActivas.forEach(alerta => {
                this.mostrarAlertaEnMapa({
                    alertId: alerta.id,
                    title: `🚨 ${alerta.titulo}`,
                    message: alerta.descripcion || 'Sin descripción',
                    location: alerta.direccion || 'Sin dirección',
                    latitud: alerta.latitud,
                    longitud: alerta.longitud,
                    category: alerta.prioridad
                });
            });
            
            console.log(`✅ Cargadas ${this.alertasActivas.length} alertas activas`);
            
            // Limpiar notificaciones incorrectas después de cargar alertas
            setTimeout(() => {
                this.limpiarNotificacionesIncorrectas();
            }, 1000);
        } catch (error) {
            console.error('❌ Error cargando alertas activas:', error);
        }
    }

    // Método para verificar si una alerta está realmente activa
    isAlertaActiva(alertId) {
        if (!this.alertasActivas) return false;
        return this.alertasActivas.some(alerta => alerta.id === parseInt(alertId));
    }

    // Método de debug para verificar el estado de las notificaciones
    debugNotificaciones() {
        console.log('🐛 === DEBUG NOTIFICACIONES ===');
        console.log('📊 Total de notificaciones:', this.notifications.length);
        console.log('📊 Alertas activas en servidor:', this.alertasActivas?.length || 0);
        
        this.notifications.forEach((notification, index) => {
            console.log(`📋 Notificación ${index + 1}:`, {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                alertId: notification.alertId,
                estaActivaEnServidor: this.isAlertaActiva(notification.alertId),
                estaEnMapa: this.isAlertaEnMapa(notification.alertId)
            });
        });
        
        console.log('🐛 === FIN DEBUG ===');
    }

    // Método para verificar si una alerta está en el mapa
    isAlertaEnMapa(alertId) {
        if (!window.mapManager || !window.mapManager.map) return false;
        
        let estaEnMapa = false;
        window.mapManager.map.eachLayer((layer) => {
            if (layer._alertaId === parseInt(alertId)) {
                estaEnMapa = true;
            }
        });
        return estaEnMapa;
    }

    // Método para limpiar notificaciones incorrectas
    limpiarNotificacionesIncorrectas() {
        console.log('🧹 Limpiando notificaciones incorrectas...');
        let notificacionesCorregidas = 0;
        
        // Corregir notificaciones marcadas incorrectamente como eliminadas
        this.notifications.forEach(notification => {
            if (notification.alertId) {
                const alertId = parseInt(notification.alertId);
                
                // Verificar si la alerta está realmente activa según el servidor
                const estaActivaEnServidor = this.isAlertaActiva(alertId);
                
                // Verificar si la alerta está en el mapa
                let estaEnMapa = false;
                if (window.mapManager && window.mapManager.map) {
                    window.mapManager.map.eachLayer((layer) => {
                        if (layer._alertaId === alertId) {
                            estaEnMapa = true;
                        }
                    });
                }
                
                // Si la alerta está activa en el servidor o en el mapa, no debería estar marcada como eliminada
                if ((estaActivaEnServidor || estaEnMapa) && notification.type === 'alertDeleted') {
                    console.log('🔧 Corrigiendo notificación incorrecta:', notification);
                    notification.type = 'alert';
                    notificacionesCorregidas++;
                }
                
                // Si la notificación tiene título de eliminación pero la alerta está activa
                if (notification.title && notification.title.includes('🗑️ Alerta Eliminada')) {
                    if (estaActivaEnServidor || estaEnMapa) {
                        console.log('🔧 Corrigiendo título de notificación incorrecta:', notification);
                        notification.title = notification.title.replace('🗑️ Alerta Eliminada', '🚨 Alerta Activa');
                        notification.type = 'alert';
                        notificacionesCorregidas++;
                    }
                }
            }
        });
        
        if (notificacionesCorregidas > 0) {
            console.log(`🧹 ${notificacionesCorregidas} notificaciones corregidas, actualizando panel...`);
            this.updateNotificationsPanel();
        } else {
            console.log('🧹 No se encontraron notificaciones incorrectas');
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.websocketClient = new WebSocketClient();
    });
} else {
    window.websocketClient = new WebSocketClient();
}
