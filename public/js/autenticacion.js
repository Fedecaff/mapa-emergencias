// Sistema de autenticación

class Auth {
    constructor() {
        this.currentUser = null;
        this.token = null;
        // Inicializar de forma asíncrona
        this.init().catch(error => {
            console.error('❌ Error inicializando autenticación:', error);
        });
    }
    
    async init() {
        // Verificar si hay un token guardado
        this.token = Storage.get('token');
        this.currentUser = Storage.get('user');
        
        if (this.token && this.currentUser) {
            console.log('🔍 Token encontrado en localStorage, restaurando sesión...');
            // Restaurar sesión automáticamente sin verificar token
            this.updateUI();
            // NO cargar puntos automáticamente - esperar selección de categorías
        }
        
        this.bindEvents();
    }
    
    loadPointsIfAuthenticated() {
        // Esperar a que el mapa esté disponible
        if (window.mapManager) {
            window.mapManager.loadPoints();
        } else {
            // Si el mapa no está disponible, esperar un poco y reintentar
            setTimeout(() => {
                this.loadPointsIfAuthenticated();
            }, 500);
        }
    }
    
    bindEvents() {
        // Botón de login
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', this.showLoginModal.bind(this));
        }
        
        // Botón de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
        
        // Formulario de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Cerrar modal de login
        const closeLoginModal = document.getElementById('closeLoginModal');
        if (closeLoginModal) {
            closeLoginModal.addEventListener('click', () => {
                Modal.hide('loginModal');
            });
        }
    }
    
    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            Notifications.error('Por favor completa todos los campos');
            return;
        }
        
        if (!Utils.isValidEmail(email)) {
            Notifications.error('Por favor ingresa un email válido');
            return;
        }
        
        Loading.show();
        
        try {
            const response = await API.post('/autenticacion/login', {
                email: email.trim(),
                password: password
            });
            
            if (response.token) {
                this.login(response.token, response.usuario);
                Modal.hide('loginModal');
                Notifications.success('Inicio de sesión exitoso');
                
                // Limpiar formulario
                document.getElementById('loginForm').reset();
            } else {
                Notifications.error('Error en el inicio de sesión');
            }
        } catch (error) {
            Notifications.error(error.message || 'Error en el inicio de sesión');
        } finally {
            Loading.hide();
        }
    }
    
    login(token, user) {
        this.token = token;
        this.currentUser = user;
        
        // Guardar en localStorage
        Storage.set('token', token);
        Storage.set('user', user);
        
        // Verificar que se guardó correctamente
        console.log('Token guardado:', token);
        console.log('Usuario guardado:', user);
        
        // Actualizar UI
        this.updateUI();
        
        // Cargar puntos del mapa cuando el usuario inicie sesión
        if (window.mapManager) {
            window.mapManager.loadPoints();
        }
        
        // Disparar evento de login
        window.dispatchEvent(new CustomEvent('userLogin', { detail: user }));
    }
    
    logout() {
        console.log('🔐 Iniciando logout...');
        
        this.token = null;
        this.currentUser = null;
        
        // Limpiar localStorage
        Storage.remove('token');
        Storage.remove('user');
        
        console.log('🗑️ localStorage limpiado');
        
        // Limpiar puntos del mapa cuando el usuario cierre sesión
        if (window.mapManager) {
            console.log('🗺️ Limpiando marcadores del mapa...');
            window.mapManager.clearAllMarkers();
        } else {
            console.log('❌ mapManager no disponible');
        }
        
        // Actualizar UI
        this.updateUI();
        
        // Llamar a onUserLogout para limpiar paneles específicos
        this.onUserLogout();
        
        // Disparar evento de logout
        window.dispatchEvent(new CustomEvent('userLogout'));
        
        Notifications.info('Sesión cerrada');
        console.log('✅ Logout completado');
    }
    
    updateUI() {
        const userInfo = document.getElementById('userInfo');
        const authButtons = document.getElementById('authButtons');
        const adminPanel = document.getElementById('adminPanel');
        const userName = document.getElementById('userName');
        
        if (this.currentUser) {
            // Usuario logueado
            if (userInfo) userInfo.style.display = 'flex';
            if (authButtons) authButtons.style.display = 'none';
            if (userName) userName.textContent = this.currentUser.nombre;
            
            // Mostrar panel de admin si es administrador
            if (adminPanel) {
                if (this.currentUser.rol === 'administrador') {
                    adminPanel.style.display = 'block';
                } else {
                    adminPanel.style.display = 'none';
                }
            }
            
            // Llamar a onUserLogin para configurar disponibilidad
            this.onUserLogin(this.currentUser);
        } else {
            // Usuario no logueado
            if (userInfo) userInfo.style.display = 'none';
            if (authButtons) authButtons.style.display = 'block';
            if (adminPanel) adminPanel.style.display = 'none';
            
            // Asegurar que el botón de login tenga el event listener
            this.ensureLoginButtonListener();
        }
    }
    
    isAuthenticated() {
        return !!this.token && !!this.currentUser;
    }
    
    isAdmin() {
        return this.isAuthenticated() && this.currentUser.rol === 'administrador';
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    getToken() {
        return this.token;
    }
    
    // Asegurar que el botón de login tenga el event listener
    ensureLoginButtonListener() {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            // Remover event listeners existentes para evitar duplicados
            loginBtn.removeEventListener('click', this.showLoginModal.bind(this));
            
            // Agregar el event listener
            loginBtn.addEventListener('click', this.showLoginModal.bind(this));
        }
    }
    
    // Método para mostrar el modal de login
    showLoginModal() {
        Modal.show('loginModal');
    }
    
    // Verificar si el token sigue siendo válido (solo para uso interno)
    async verifyToken() {
        if (!this.token) {
            return false;
        }
        
        try {
            const response = await API.get('/autenticacion/perfil');
            return true;
        } catch (error) {
            // No hacer logout automáticamente, solo retornar false
            console.warn('⚠️ Token puede estar expirado, pero manteniendo sesión local');
            return false;
        }
    }

    onUserLogin(user) {
        console.log('✅ Usuario logueado:', user);
        
        // Mostrar información del usuario
        document.getElementById('userName').textContent = user.nombre;
        document.getElementById('userInfo').style.display = 'flex';
        document.getElementById('authButtons').style.display = 'none';
        
        // Mostrar panel de administración si es administrador
        if (user.rol === 'administrador') {
            document.getElementById('adminPanel').style.display = 'block';
            // Mostrar botón de emergencia solo para administradores
            const emergencyBtn = document.getElementById('emergencyBtn');
            if (emergencyBtn) {
                emergencyBtn.style.display = 'inline-flex';
            }
        }
        
        // Mostrar panel de disponibilidad solo para operadores (no administrador)
        if (user.rol === 'operador') {
            const availabilityPanel = document.getElementById('availabilityPanel');
            if (availabilityPanel) {
                availabilityPanel.style.display = 'block';
                // Configurar estado inicial de disponibilidad
                this.configurarDisponibilidad(user.disponible);
            }
            // Ocultar botón de emergencia para operadores
            const emergencyBtn = document.getElementById('emergencyBtn');
            if (emergencyBtn) {
                emergencyBtn.style.display = 'none';
            }
        }
        
        // NO cargar puntos automáticamente - esperar selección de categorías
        
        // Inicializar geolocalización para operadores
        if (user.rol === 'operador') {
            this.inicializarGeolocalizacion(user.id);
        }
        
        // Iniciar actualización de operadores para administradores
        if (user.rol === 'administrador' && window.mapManager) {
            window.mapManager.startOperatorUpdates();
        }
    }

    onUserLogout() {
        console.log('🔐 Iniciando logout...');
        
        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('🗑️ localStorage limpiado');
        
        // Limpiar marcadores del mapa
        if (window.mapaManager) {
            window.mapaManager.onUserLogout();
        }
        
        // Ocultar información del usuario
        document.getElementById('userInfo').style.display = 'none';
        document.getElementById('authButtons').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
        
        // Ocultar panel de disponibilidad
        const availabilityPanel = document.getElementById('availabilityPanel');
        if (availabilityPanel) {
            availabilityPanel.style.display = 'none';
            console.log('✅ Panel de disponibilidad ocultado');
        } else {
            console.log('⚠️ Panel de disponibilidad no encontrado');
        }
        
        // Ocultar botón de emergencia
        const emergencyBtn = document.getElementById('emergencyBtn');
        if (emergencyBtn) {
            emergencyBtn.style.display = 'none';
        }
        
        // Limpiar nombre de usuario
        document.getElementById('userName').textContent = '';
        
        // Detener geolocalización
        this.detenerGeolocalizacion();
        
        // Detener actualización de operadores
        if (window.mapManager) {
            window.mapManager.stopOperatorUpdates();
        }
        
        console.log('✅ Logout completado');
    }

    configurarDisponibilidad(disponible) {
        const checkbox = document.getElementById('availabilityCheckbox');
        const status = document.getElementById('availabilityStatus');
        
        if (checkbox && status) {
            // Configurar estado inicial
            checkbox.checked = disponible;
            this.actualizarEstadoDisponibilidad(disponible);
            
            // Agregar event listener
            checkbox.addEventListener('change', (e) => {
                this.cambiarDisponibilidad(e.target.checked);
            });
        }
    }

    actualizarEstadoDisponibilidad(disponible) {
        const status = document.getElementById('availabilityStatus');
        if (status) {
            if (disponible) {
                status.className = 'availability-status available';
                status.innerHTML = '<i class="fas fa-circle"></i><span>Estado: Disponible</span>';
            } else {
                status.className = 'availability-status unavailable';
                status.innerHTML = '<i class="fas fa-circle"></i><span>Estado: No disponible</span>';
            }
        }
    }

    async cambiarDisponibilidad(disponible) {
        try {
            if (!this.currentUser?.id) {
                console.error('❌ Usuario no autenticado');
                return;
            }

            const response = await API.put(`/usuarios/${this.currentUser.id}/disponibilidad`, { disponible });
            
            if (response.mensaje) {
                // Actualizar el estado en el localStorage y en memoria
                this.currentUser.disponible = disponible;
                Storage.set('user', this.currentUser);
                
                // Actualizar la UI
                this.actualizarEstadoDisponibilidad(disponible);
                
                // Mostrar notificación
                if (window.Notifications) {
                    window.Notifications.success(response.mensaje);
                }
                
                console.log('✅ Disponibilidad actualizada:', disponible);
            }
        } catch (error) {
            console.error('❌ Error cambiando disponibilidad:', error);
            if (window.Notifications) {
                window.Notifications.error('Error cambiando disponibilidad');
            }
        }
    }

    // Métodos de geolocalización
    inicializarGeolocalizacion(userId) {
        try {
            if (window.GeolocalizacionManager) {
                if (!this.geolocalizacionManager) {
                    this.geolocalizacionManager = new GeolocalizacionManager();
                }
                this.geolocalizacionManager.init(userId);
                console.log('📍 Geolocalización inicializada para usuario:', userId);
            } else {
                console.warn('⚠️ GeolocalizacionManager no disponible');
            }
        } catch (error) {
            console.error('❌ Error inicializando geolocalización:', error);
        }
    }

    detenerGeolocalizacion() {
        try {
            if (this.geolocalizacionManager) {
                this.geolocalizacionManager.stop();
                this.geolocalizacionManager = null;
                console.log('📍 Geolocalización detenida');
            }
        } catch (error) {
            console.error('❌ Error deteniendo geolocalización:', error);
        }
    }
}

// Inicializar autenticación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
});

// Exportar para uso global
window.Auth = Auth;

