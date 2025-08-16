// Sistema de autenticación

class Auth {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.init();
    }
    
    init() {
        // Verificar si hay un token guardado
        this.token = Storage.get('token');
        this.currentUser = Storage.get('user');
        
        if (this.token && this.currentUser) {
            this.updateUI();
        }
        
        this.bindEvents();
    }
    
    bindEvents() {
        // Botón de login
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                Modal.show('loginModal');
            });
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
        this.token = null;
        this.currentUser = null;
        
        // Limpiar localStorage
        Storage.remove('token');
        Storage.remove('user');
        
        // Limpiar puntos del mapa cuando el usuario cierre sesión
        if (window.mapManager) {
            window.mapManager.clearAllMarkers();
        }
        
        // Actualizar UI
        this.updateUI();
        
        // Disparar evento de logout
        window.dispatchEvent(new CustomEvent('userLogout'));
        
        Notifications.info('Sesión cerrada');
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
                if (this.currentUser.rol === 'admin') {
                    adminPanel.style.display = 'block';
                } else {
                    adminPanel.style.display = 'none';
                }
            }
        } else {
            // Usuario no logueado
            if (userInfo) userInfo.style.display = 'none';
            if (authButtons) authButtons.style.display = 'block';
            if (adminPanel) adminPanel.style.display = 'none';
        }
    }
    
    isAuthenticated() {
        return !!this.token && !!this.currentUser;
    }
    
    isAdmin() {
        return this.isAuthenticated() && this.currentUser.rol === 'admin';
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    getToken() {
        return this.token;
    }
    
    // Verificar si el token sigue siendo válido
    async verifyToken() {
        if (!this.token) {
            return false;
        }
        
        try {
            const response = await API.post('/autenticacion/verificar-token', {
                token: this.token
            });
            
            if (response.valid) {
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            // Solo hacer logout si el error no es 401 (token inválido)
            if (error.message && error.message.includes('Token inválido')) {
                this.logout();
            }
            return false;
        }
    }
}

// Inicializar autenticación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
    
    // Verificar token al cargar la página solo si existe
    if (window.auth.token) {
        window.auth.verifyToken();
    }
});

// Exportar para uso global
window.Auth = Auth;

