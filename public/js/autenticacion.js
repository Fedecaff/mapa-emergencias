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
        
        // Llamar a onUserLogout para limpiar paneles específicos
        this.onUserLogout();
        
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

        // Mostrar información del usuario
        document.getElementById('userName').textContent = user.nombre;
        document.getElementById('userInfo').style.display = 'flex';
        document.getElementById('authButtons').style.display = 'none';
        
        // Mostrar panel de administración si es administrador
        if (user.rol === 'administrador') {
            document.getElementById('adminPanel').style.display = 'block';
            document.getElementById('operatorsPanel').style.display = 'block';
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
        if (user.rol === 'administrador') {
            const waitForMapManager = () => {
                if (window.mapManager) {
                    window.mapManager.startOperatorUpdates();
                    this.cargarOperadoresEnPanel();
                    
                    // Iniciar polling automático del panel
                    this.startPanelPolling();
                } else {
                    setTimeout(waitForMapManager, 100);
                }
            };
            waitForMapManager();
        } else {
            }
        
        // Inicializar panel de perfil para operadores
        if (user.rol === 'operador') {
            this.inicializarPanelPerfil(user);
        }
    }

    // Inicializar panel de perfil para operadores
    inicializarPanelPerfil(user) {
        // Solo mostrar panel de perfil para operadores
        if (user.rol !== 'operador') {
            return;
        }
        
        // Mostrar panel de perfil
        const profilePanel = document.getElementById('profilePanel');
        if (profilePanel) {
            profilePanel.style.display = 'block';
        }
        
        // Cargar datos del usuario en el formulario
        this.cargarDatosPerfil(user);
        
        // Configurar event listeners
        this.configurarEventListenersPerfil();
        
        // Iniciar en modo "Ver Info"
        this.cambiarAModoVer();
    }

    // Cargar datos del usuario en el formulario de perfil
    cargarDatosPerfil(user = null) {
        // Usar el usuario actual si no se proporciona uno
        const userData = user || this.currentUser;
        
        if (!userData) {
            console.error('❌ No hay datos de usuario disponibles');
            return;
        }
        
        // Si no tenemos foto_perfil, mostrar iniciales
        if (!userData.foto_perfil) {
            }
        
        // Avatar
        const profileAvatar = document.getElementById('profileAvatar');
        const profileInitials = document.getElementById('profileInitials');
        
        if (userData.foto_perfil) {
            profileAvatar.src = userData.foto_perfil;
            profileAvatar.style.display = 'block';
            profileInitials.style.display = 'none';
            } else {
            profileAvatar.style.display = 'none';
            profileInitials.style.display = 'flex';
            const iniciales = userData.nombre ? userData.nombre.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
            profileInitials.textContent = iniciales;
            }
        
        // Campos del formulario
        const profileName = document.getElementById('profileName');
        const profileInstitution = document.getElementById('profileInstitution');
        const profileRole = document.getElementById('profileRole');
        const profilePhone = document.getElementById('profilePhone');
        const profileEmail = document.getElementById('profileEmail');
        const emailVerificationStatus = document.getElementById('emailVerificationStatus');
        
        if (profileName) profileName.value = userData.nombre || '';
        if (profileInstitution) profileInstitution.value = userData.institucion || '';
        if (profileRole) profileRole.value = userData.rol_institucion || '';
        if (profilePhone) profilePhone.value = userData.telefono || '';
        if (profileEmail) profileEmail.value = userData.email || '';
        
        // Actualizar estado de verificación de email
        if (emailVerificationStatus) {
            const isVerified = userData.email_verificado || false;
            emailVerificationStatus.className = `email-verification-status ${isVerified ? 'verified' : ''}`;
            emailVerificationStatus.innerHTML = `
                <i class="fas fa-circle"></i>
                <span>${isVerified ? 'Email verificado' : 'Email no verificado'}</span>
            `;
        }
        
        // Configurar disponibilidad
        this.configurarDisponibilidad(userData.disponible || false);
    }

    // Configurar event listeners del panel de perfil
    configurarEventListenersPerfil() {
        // Botones de modo
        const viewInfoBtn = document.getElementById('viewInfoBtn');
        const editInfoBtn = document.getElementById('editInfoBtn');
        
        if (viewInfoBtn && editInfoBtn) {
            // Remover event listeners existentes
            viewInfoBtn.removeEventListener('click', this.viewInfoHandler);
            editInfoBtn.removeEventListener('click', this.editInfoHandler);
            
            // Crear nuevos handlers
            this.viewInfoHandler = () => {
                this.cambiarAModoVer();
            };
            
            this.editInfoHandler = () => {
                this.cambiarAModoEditar();
            };
            
            viewInfoBtn.addEventListener('click', this.viewInfoHandler);
            editInfoBtn.addEventListener('click', this.editInfoHandler);
        }
        
        // Botón de cambiar foto
        const changePhotoBtn = document.getElementById('changePhotoBtn');
        if (changePhotoBtn) {
            // Remover event listener existente para evitar duplicados
            changePhotoBtn.removeEventListener('click', this.changePhotoHandler);
            
            // Crear nuevo handler
            this.changePhotoHandler = () => {
                this.cambiarFotoPerfil();
            };
            
            changePhotoBtn.addEventListener('click', this.changePhotoHandler);
        }
        
        // Botón de guardar perfil
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            // Remover event listener existente para evitar duplicados
            saveProfileBtn.removeEventListener('click', this.saveProfileHandler);
            
            // Crear nuevo handler
            this.saveProfileHandler = () => {
                this.guardarPerfil();
            };
            
            saveProfileBtn.addEventListener('click', this.saveProfileHandler);
        }
    }

    // Cambiar a modo ver información
    cambiarAModoVer() {
        // Actualizar botones
        const viewInfoBtn = document.getElementById('viewInfoBtn');
        const editInfoBtn = document.getElementById('editInfoBtn');
        
        if (viewInfoBtn && editInfoBtn) {
            viewInfoBtn.classList.add('btn-mode-active');
            editInfoBtn.classList.remove('btn-mode-active');
        }
        
        // Agregar clase readonly al panel
        const profileInfo = document.querySelector('.profile-info');
        if (profileInfo) {
            profileInfo.classList.add('profile-readonly');
        }
        
        // Cargar datos actuales del usuario
        this.cargarDatosPerfil();
    }
    
    // Cambiar a modo editar información
    cambiarAModoEditar() {
        // Actualizar botones
        const viewInfoBtn = document.getElementById('viewInfoBtn');
        const editInfoBtn = document.getElementById('editInfoBtn');
        
        if (viewInfoBtn && editInfoBtn) {
            viewInfoBtn.classList.remove('btn-mode-active');
            editInfoBtn.classList.add('btn-mode-active');
        }
        
        // Remover clase readonly del panel
        const profileInfo = document.querySelector('.profile-info');
        if (profileInfo) {
            profileInfo.classList.remove('profile-readonly');
        }
    }

    // Cambiar foto de perfil
    async cambiarFotoPerfil() {
        try {
            // Crear input file único si no existe
            if (!this.fileInput) {
                this.fileInput = document.createElement('input');
                this.fileInput.type = 'file';
                this.fileInput.accept = 'image/*';
                this.fileInput.style.display = 'none';
                
                // Crear función de manejo de archivo
                this.handleFileChange = async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        // Validar tamaño del archivo (10MB máximo)
                        const maxSize = 10 * 1024 * 1024; // 10MB
                        if (file.size > maxSize) {
                            Notifications.error(`El archivo es demasiado grande. Máximo 10MB. Tu archivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                            this.fileInput.value = '';
                            return;
                        }
                        
                        // Validar tipo de archivo
                        if (!file.type.startsWith('image/')) {
                            Notifications.error('Solo se permiten archivos de imagen');
                            this.fileInput.value = '';
                            return;
                        }
                        
                        await this.subirFotoPerfil(file);
                    }
                    // Limpiar el input para permitir seleccionar el mismo archivo
                    this.fileInput.value = '';
                };
                
                this.fileInput.addEventListener('change', this.handleFileChange);
                document.body.appendChild(this.fileInput);
            }
            
            this.fileInput.click();
        } catch (error) {
            console.error('❌ Error al cambiar foto de perfil:', error);
            Notifications.error('Error al cambiar la foto de perfil');
        }
    }

    // Subir foto de perfil
    async subirFotoPerfil(file) {
        try {
            const formData = new FormData();
            formData.append('foto', file);
            
            // Debug: verificar contenido del FormData
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
            }
            
            const response = await API.post(`/usuarios/${this.currentUser.id}/foto`, formData);
            
            if (response.foto_perfil) {
                // Actualizar avatar en el panel de perfil
                const profileAvatar = document.getElementById('profileAvatar');
                const profileInitials = document.getElementById('profileInitials');
                
                if (profileAvatar && profileInitials) {
                    profileAvatar.src = response.foto_perfil;
                    profileAvatar.style.display = 'block';
                    profileInitials.style.display = 'none';
                    } else {
                    console.warn('⚠️ Elementos de avatar no encontrados en el DOM');
                }
                
                // Actualizar usuario en memoria
                this.currentUser.foto_perfil = response.foto_perfil;
                Storage.set('user', this.currentUser);
                
                Notifications.success('Foto de perfil actualizada correctamente');
            } else {
                console.error('❌ No se recibió foto_perfil en la respuesta');
                Notifications.error('Error: No se recibió la URL de la foto');
            }
        } catch (error) {
            console.error('❌ Error al subir foto de perfil:', error);
            Notifications.error('Error al subir la foto de perfil');
        }
    }

    // Guardar perfil
    async guardarPerfil() {
        try {
            const saveBtn = document.getElementById('saveProfileBtn');
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            
            // Obtener valores de los campos
            const nombre = document.getElementById('profileName').value.trim();
            const institucion = document.getElementById('profileInstitution').value.trim();
            const rol_institucion = document.getElementById('profileRole').value.trim();
            const telefono = document.getElementById('profilePhone').value.trim();
            const email = document.getElementById('profileEmail').value.trim();
            
            // Validar que al menos el nombre esté presente
            if (!nombre) {
                Notifications.error('El nombre es obligatorio');
                return;
            }
            
            // Solo incluir campos que tengan valor
            const datosPerfil = {};
            
            if (nombre) datosPerfil.nombre = nombre;
            if (institucion) datosPerfil.institucion = institucion;
            if (rol_institucion) datosPerfil.rol_institucion = rol_institucion;
            if (telefono) datosPerfil.telefono = telefono;
            if (email) datosPerfil.email = email;
            
            const response = await API.put(`/usuarios/${this.currentUser.id}/perfil`, datosPerfil);
            
            if (response.mensaje) {
                // Actualizar usuario en memoria
                Object.assign(this.currentUser, datosPerfil);
                Storage.set('user', this.currentUser);
                
                // Actualizar nombre en el header
                document.getElementById('userName').textContent = datosPerfil.nombre;
                
                Notifications.success('Perfil actualizado correctamente');
            }
        } catch (error) {
            console.error('❌ Error al guardar perfil:', error);
            Notifications.error('Error al guardar el perfil');
        } finally {
            const saveBtn = document.getElementById('saveProfileBtn');
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar cambios';
        }
    }

    onUserLogout() {
        console.log('🔐 Iniciando logout...');
        
        // Limpiar event listeners de disponibilidad
        const checkbox = document.getElementById('availabilityCheckbox');
        if (checkbox && this.availabilityChangeHandler) {
            checkbox.removeEventListener('change', this.availabilityChangeHandler);
            this.availabilityChangeHandler = null;
            }
        
        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Limpiar marcadores del mapa
        if (window.mapaManager) {
            window.mapaManager.onUserLogout();
        }
        
        // Ocultar información del usuario
        document.getElementById('userInfo').style.display = 'none';
        document.getElementById('authButtons').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('operatorsPanel').style.display = 'none';
        document.getElementById('profilePanel').style.display = 'none';
        
        // Ocultar panel de disponibilidad
        const availabilityPanel = document.getElementById('availabilityPanel');
        if (availabilityPanel) {
            availabilityPanel.style.display = 'none';
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
        
        // Detener polling del panel
        this.stopPanelPolling();
        
        }

    configurarDisponibilidad(disponible) {
        const checkbox = document.getElementById('availabilityCheckbox');
        const status = document.getElementById('availabilityStatus');
        
        if (checkbox && status) {
            // Remover event listener existente para evitar duplicados
            if (this.availabilityChangeHandler) {
                checkbox.removeEventListener('change', this.availabilityChangeHandler);
            }
            
            // Configurar estado inicial
            checkbox.checked = disponible;
            this.actualizarEstadoDisponibilidad(disponible);
            
            // Crear y guardar el event listener
            this.availabilityChangeHandler = (e) => {
                this.cambiarDisponibilidad(e.target.checked);
            };
            
            // Agregar event listener
            checkbox.addEventListener('change', this.availabilityChangeHandler);
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
                }
        } catch (error) {
            console.error('❌ Error deteniendo geolocalización:', error);
        }
    }

    // Cargar operadores en el panel lateral
    async cargarOperadoresEnPanel() {
        try {
            const response = await API.get('/usuarios/operadores-ubicacion');
            
            if (response.operadores) {
                // Verificar si hay cambios antes de actualizar el panel
                if (this.hasPanelChanges(response.operadores)) {
                    this.mostrarOperadoresEnPanel(response.operadores);
                    } else {
                    }
            }
        } catch (error) {
            console.error('❌ Error cargando operadores en panel:', error);
            // Mostrar notificación sutil al usuario
            if (window.Notifications) {
                Notifications.warning('Error de conexión. Reintentando...');
            }
        }
    }

    // Verificar si hay cambios en el panel de operadores
    hasPanelChanges(newOperadores) {
        if (!this.lastPanelState) {
            return true; // Primera carga
        }

        const newState = this.getPanelState(newOperadores);
        
        // Comparar estados
        return newState.hash !== this.lastPanelState.hash;
    }

    // Obtener estado del panel para comparación
    getPanelState(operadores) {
        return {
            hash: JSON.stringify(operadores.map(op => ({
                id: op.id,
                nombre: op.nombre,
                disponible_real: op.disponible_real,
                institucion: op.institucion,
                rol_institucion: op.rol_institucion,
                foto_perfil: op.foto_perfil
            }))),
            totalCount: operadores.length,
            availableCount: operadores.filter(op => op.disponible_real).length
        };
    }

    // Iniciar polling automático del panel de operadores
    startPanelPolling() {
        // Configuración del polling del panel
        this.panelPollingConfig = {
            interval: 30000, // 30 segundos
            maxRetries: 3,
            retryDelay: 5000, // 5 segundos
            currentRetries: 0,
            isPolling: false
        };

        this.startRobustPanelPolling();
    }

    // Polling robusto para el panel
    async startRobustPanelPolling() {
        if (this.panelPollingConfig.isPolling) {
            return; // Evitar múltiples polling simultáneos
        }

        this.panelPollingConfig.isPolling = true;

        const poll = async () => {
            try {
                // Solo actualizar si el usuario es administrador y está logueado
                if (this.currentUser && this.currentUser.rol === 'administrador') {
                    await this.cargarOperadoresEnPanelWithRetry();
                }
                
                // Resetear contador de reintentos en caso de éxito
                this.panelPollingConfig.currentRetries = 0;
                
            } catch (error) {
                console.error('❌ Error en polling del panel:', error);
                this.handlePanelPollingError();
            }

            // Programar siguiente polling
            this.panelUpdateInterval = setTimeout(poll, this.panelPollingConfig.interval);
        };

        // Iniciar primer polling
        poll();
    }

    // Cargar operadores en panel con reintentos
    async cargarOperadoresEnPanelWithRetry() {
        try {
            await this.cargarOperadoresEnPanel();
        } catch (error) {
            this.panelPollingConfig.currentRetries++;
            
            if (this.panelPollingConfig.currentRetries <= this.panelPollingConfig.maxRetries) {
                // Esperar antes del reintento
                await new Promise(resolve => setTimeout(resolve, this.panelPollingConfig.retryDelay));
                
                // Reintentar
                return this.cargarOperadoresEnPanelWithRetry();
            } else {
                console.error('❌ Máximo de reintentos alcanzado para panel');
                throw error;
            }
        }
    }

    // Manejar errores de polling del panel
    handlePanelPollingError() {
        this.panelPollingConfig.currentRetries++;
        
        if (this.panelPollingConfig.currentRetries <= this.panelPollingConfig.maxRetries) {
            // Reintentar después de un delay
            setTimeout(() => {
                this.startRobustPanelPolling();
            }, this.panelPollingConfig.retryDelay);
        } else {
            console.error('❌ Máximo de reintentos alcanzado para panel');
            
            // Resetear contador y reintentar después de un tiempo más largo
            setTimeout(() => {
                this.panelPollingConfig.currentRetries = 0;
                this.startRobustPanelPolling();
            }, 60000); // 1 minuto
        }
    }

    // Detener polling del panel
    stopPanelPolling() {
        if (this.panelUpdateInterval) {
            clearTimeout(this.panelUpdateInterval);
            this.panelUpdateInterval = null;
        }
        
        if (this.panelPollingConfig) {
            this.panelPollingConfig.isPolling = false;
            this.panelPollingConfig.currentRetries = 0;
        }
        
        }

    // Mostrar operadores en el panel lateral
    mostrarOperadoresEnPanel(operadores) {
        const operatorsList = document.getElementById('operatorsList');
        const operatorsCount = document.getElementById('operatorsCount');
        
        if (!operatorsList || !operatorsCount) {
            console.error('❌ Elementos del panel de operadores no encontrados');
            return;
        }

        // Separar operadores disponibles y no disponibles
        const disponibles = operadores.filter(op => op.disponible_real);
        const noDisponibles = operadores.filter(op => !op.disponible_real);

        // Limpiar lista
        operatorsList.innerHTML = '';

        // Mostrar operadores disponibles primero
        disponibles.forEach(operador => {
            operatorsList.appendChild(this.crearElementoOperador(operador, true));
        });

        // Mostrar operadores no disponibles después
        noDisponibles.forEach(operador => {
            operatorsList.appendChild(this.crearElementoOperador(operador, false));
        });

        // Actualizar contador
        operatorsCount.textContent = `${disponibles.length} operadores disponibles`;
        
        // Guardar estado actual para comparaciones futuras
        this.lastPanelState = this.getPanelState(operadores);
    }

    // Crear elemento HTML para un operador
    crearElementoOperador(operador, disponible) {
        const div = document.createElement('div');
        div.className = `operator-item ${disponible ? 'online' : 'offline'}`;
        
        const iniciales = operador.nombre.split(' ').map(n => n[0]).join('').toUpperCase();
        
        // Mostrar foto de perfil si está disponible, sino mostrar iniciales
        let avatarHTML = '';
        if (operador.foto_perfil) {
            avatarHTML = `<img src="${operador.foto_perfil}" alt="${operador.nombre}" class="operator-avatar-img">`;
        } else {
            avatarHTML = `<div class="operator-avatar">${iniciales}</div>`;
        }

        div.innerHTML = `
            ${avatarHTML}
            <div class="operator-info">
                <div class="operator-name">${operador.nombre}</div>
                <div class="operator-details">
                    ${operador.institucion || 'Sin institución'} • ${operador.rol_institucion || 'Sin rol'}
                </div>
                <div class="operator-status ${disponible ? 'online' : 'offline'}">
                    <i class="fas fa-circle"></i>
                    <span>${disponible ? 'Disponible' : 'No disponible'}</span>
                </div>
            </div>
        `;

        return div;
    }
}

// Inicializar autenticación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
});

// Exportar para uso global
window.Auth = Auth;

