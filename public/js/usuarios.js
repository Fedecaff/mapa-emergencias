// Gestión de usuarios (solo para administradores)

class UsuariosManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Botón para crear usuario
        const createUserBtn = document.getElementById('createUserBtn');
        if (createUserBtn) {
            createUserBtn.addEventListener('click', () => {
                this.showCreateUserModal();
            });
        }

        // Formulario de crear usuario
        const createUserForm = document.getElementById('createUserForm');
        if (createUserForm) {
            createUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateUser();
            });
        }

        // Botón cancelar crear usuario
        const cancelCreateUser = document.getElementById('cancelCreateUser');
        if (cancelCreateUser) {
            cancelCreateUser.addEventListener('click', () => {
                this.hideCreateUserModal();
            });
        }

        // Cerrar modal de crear usuario
        const closeCreateUserModal = document.getElementById('closeCreateUserModal');
        if (closeCreateUserModal) {
            closeCreateUserModal.addEventListener('click', () => {
                this.hideCreateUserModal();
            });
        }
    }

    showCreateUserModal() {
        Modal.show('createUserModal');
        // Limpiar formulario
        document.getElementById('createUserForm').reset();
    }

    hideCreateUserModal() {
        Modal.hide('createUserModal');
    }

    async handleCreateUser() {
        const formData = new FormData(document.getElementById('createUserForm'));
        
        const userData = {
            nombre: formData.get('nombre').trim(),
            email: formData.get('email').trim(),
            telefono: formData.get('telefono').trim(),
            password: formData.get('password'),
            rol: formData.get('rol')
        };

        // Validaciones
        if (!userData.nombre || !userData.email || !userData.telefono || !userData.password || !userData.rol) {
            Notifications.error('Por favor completa todos los campos');
            return;
        }

        if (userData.password.length < 6) {
            Notifications.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (!Utils.isValidEmail(userData.email)) {
            Notifications.error('Por favor ingresa un email válido');
            return;
        }

        Loading.show();

        try {
            const response = await API.post('/usuarios', userData);

            if (response.mensaje) {
                Notifications.success('Usuario creado exitosamente');
                this.hideCreateUserModal();
                
                // Limpiar formulario
                document.getElementById('createUserForm').reset();
                
                console.log('✅ Usuario creado:', response.usuario);
            }
        } catch (error) {
            Notifications.error(error.message || 'Error creando usuario');
            console.error('❌ Error creando usuario:', error);
        } finally {
            Loading.hide();
        }
    }

    async listarUsuarios() {
        try {
            const response = await API.get('/usuarios');
            return response.usuarios || [];
        } catch (error) {
            console.error('❌ Error listando usuarios:', error);
            Notifications.error('Error cargando usuarios');
            return [];
        }
    }

    async obtenerUsuario(id) {
        try {
            const response = await API.get(`/usuarios/${id}`);
            return response.usuario;
        } catch (error) {
            console.error('❌ Error obteniendo usuario:', error);
            Notifications.error('Error cargando usuario');
            return null;
        }
    }

    async actualizarUsuario(id, datos) {
        try {
            const response = await API.put(`/usuarios/${id}`, datos);
            
            if (response.mensaje) {
                Notifications.success('Usuario actualizado exitosamente');
                return response.usuario;
            }
        } catch (error) {
            Notifications.error(error.message || 'Error actualizando usuario');
            console.error('❌ Error actualizando usuario:', error);
            return null;
        }
    }

    async eliminarUsuario(id) {
        try {
            const response = await API.delete(`/usuarios/${id}`);
            
            if (response.mensaje) {
                Notifications.success('Usuario eliminado exitosamente');
                return true;
            }
        } catch (error) {
            Notifications.error(error.message || 'Error eliminando usuario');
            console.error('❌ Error eliminando usuario:', error);
            return false;
        }
    }

    async cambiarDisponibilidad(disponible) {
        try {
            const userId = window.auth.getUser()?.id;
            if (!userId) {
                Notifications.error('Usuario no autenticado');
                return false;
            }

            const response = await API.put(`/usuarios/${userId}/disponibilidad`, { disponible });
            
            if (response.mensaje) {
                Notifications.success(response.mensaje);
                
                // Actualizar el estado en el localStorage
                const user = window.auth.getUser();
                if (user) {
                    user.disponible = disponible;
                    window.auth.setUser(user);
                }
                
                // Actualizar la UI
                this.actualizarUIEstadoDisponibilidad(disponible);
                
                return true;
            }
        } catch (error) {
            Notifications.error(error.message || 'Error cambiando disponibilidad');
            console.error('❌ Error cambiando disponibilidad:', error);
            return false;
        }
    }

    actualizarUIEstadoDisponibilidad(disponible) {
        const btnDisponible = document.getElementById('btnDisponible');
        const btnNoDisponible = document.getElementById('btnNoDisponible');
        
        if (btnDisponible && btnNoDisponible) {
            if (disponible) {
                btnDisponible.classList.add('active');
                btnNoDisponible.classList.remove('active');
            } else {
                btnDisponible.classList.remove('active');
                btnNoDisponible.classList.add('active');
            }
        }
    }

    async obtenerUsuariosDisponibles() {
        try {
            const response = await API.get('/usuarios/disponibles');
            return response.usuarios || [];
        } catch (error) {
            console.error('❌ Error obteniendo usuarios disponibles:', error);
            return [];
        }
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.usuariosManager = new UsuariosManager();
    });
} else {
    window.usuariosManager = new UsuariosManager();
}


