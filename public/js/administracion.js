// Sistema de administración

class AdminManager {
    constructor() {
        this.categories = [];
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        // Botón de agregar punto
        const addPointBtn = document.getElementById('addPointBtn');
        if (addPointBtn) {
            addPointBtn.addEventListener('click', () => {
                this.startAddingPoint();
            });
        }
        
        // Botón de gestionar usuarios
        const manageUsersBtn = document.getElementById('manageUsersBtn');
        if (manageUsersBtn) {
            manageUsersBtn.addEventListener('click', () => {
                this.showManageUsers();
            });
        }
        
        // Botón de ver historial
        const viewHistoryBtn = document.getElementById('viewHistoryBtn');
        if (viewHistoryBtn) {
            viewHistoryBtn.addEventListener('click', () => {
                this.showHistory();
            });
        }
        
        // Formulario de agregar punto
        const addPointForm = document.getElementById('addPointForm');
        if (addPointForm) {
            addPointForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddPoint();
            });
        }
        
        // Cancelar agregar punto
        const cancelAddPoint = document.getElementById('cancelAddPoint');
        if (cancelAddPoint) {
            cancelAddPoint.addEventListener('click', () => {
                this.cancelAddingPoint();
            });
        }
        
        // Cerrar modal de agregar punto
        const closeAddPointModal = document.getElementById('closeAddPointModal');
        if (closeAddPointModal) {
            closeAddPointModal.addEventListener('click', () => {
                this.cancelAddingPoint();
            });
        }
        
        // Cerrar modal de gestión de usuarios
        const closeManageUsersModal = document.getElementById('closeManageUsersModal');
        if (closeManageUsersModal) {
            closeManageUsersModal.addEventListener('click', () => {
                Modal.hide('manageUsersModal');
            });
        }
        
        // Cerrar modal de historial
        const closeHistoryModal = document.getElementById('closeHistoryModal');
        if (closeHistoryModal) {
            closeHistoryModal.addEventListener('click', () => {
                Modal.hide('historyModal');
            });
        }
        
        // Select de categoría en formulario de agregar punto
        const pointCategory = document.getElementById('pointCategory');
        if (pointCategory) {
            pointCategory.addEventListener('change', () => {
                this.updateCustomFields();
            });
        }
        
        // Filtros de gestión de usuarios
        const usersRoleFilter = document.getElementById('usersRoleFilter');
        const usersStatusFilter = document.getElementById('usersStatusFilter');
        
        if (usersRoleFilter) {
            usersRoleFilter.addEventListener('change', () => {
                this.loadUsers();
            });
        }
        
        if (usersStatusFilter) {
            usersStatusFilter.addEventListener('change', () => {
                this.loadUsers();
            });
        }
        
        // Filtros de historial
        const historyTableFilter = document.getElementById('historyTableFilter');
        const historyActionFilter = document.getElementById('historyActionFilter');
        
        if (historyTableFilter) {
            historyTableFilter.addEventListener('change', () => {
                this.loadHistory();
            });
        }
        
        if (historyActionFilter) {
            historyActionFilter.addEventListener('change', () => {
                this.loadHistory();
            });
        }
    }
    
    startAddingPoint() {
        if (!window.auth.isAdmin()) {
            Notifications.error('Solo los administradores pueden agregar puntos');
            return;
        }
        
        // Limpiar formulario
        document.getElementById('addPointForm').reset();
        document.getElementById('customFields').innerHTML = '';
        
        // Iniciar modo de agregar punto en el mapa
        if (window.mapManager) {
            window.mapManager.startAddingPoint();
        }
    }
    
    cancelAddingPoint() {
        Modal.hide('addPointModal');
        
        // Detener modo de agregar punto en el mapa
        if (window.mapManager) {
            window.mapManager.stopAddingPoint();
        }
    }
    
    updateCustomFields() {
        const categoryId = document.getElementById('pointCategory').value;
        const customFieldsContainer = document.getElementById('customFields');
        
        if (!categoryId) {
            customFieldsContainer.innerHTML = '';
            return;
        }
        
        const category = window.mapManager.categories.find(c => c.id == categoryId);
        if (!category || !category.campos_personalizados) {
            customFieldsContainer.innerHTML = '';
            return;
        }
        
        // Verificar si ya es un objeto o necesita ser parseado
        let customFields;
        if (typeof category.campos_personalizados === 'string') {
            try {
                customFields = JSON.parse(category.campos_personalizados);
            } catch (error) {
                console.error('Error parseando campos personalizados:', error);
                customFields = {};
            }
        } else {
            customFields = category.campos_personalizados;
        }
        let html = '<h4>Campos Específicos</h4>';
        
        Object.entries(customFields).forEach(([fieldName, fieldType]) => {
            html += this.createCustomField(fieldName, fieldType);
        });
        
        customFieldsContainer.innerHTML = html;
    }
    
    createCustomField(fieldName, fieldType) {
        const fieldId = `custom_${fieldName}`;
        const fieldLabel = Utils.capitalize(fieldName.replace(/_/g, ' '));
        
        let inputHtml = '';
        
        // Todos los campos ahora son de texto libre
        inputHtml = `<input type="text" id="${fieldId}" name="${fieldName}" placeholder="Ingresa ${fieldLabel.toLowerCase()}">`;
        
        return `
            <div class="custom-field">
                <label for="${fieldId}">${fieldLabel}:</label>
                ${inputHtml}
            </div>
        `;
    }
    
    createSelectField(fieldId, fieldName) {
        let options = '';
        
        // Opciones específicas por campo
        switch (fieldName) {
            case 'tipo_union':
                options = `
                    <option value="">Seleccionar tipo</option>
                    <option value="Roscada">Roscada</option>
                    <option value="Brida">Brida</option>
                    <option value="Soldada">Soldada</option>
                `;
                break;
            case 'estado':
                options = `
                    <option value="">Seleccionar estado</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                `;
                break;
            case 'nivel_educativo':
                options = `
                    <option value="">Seleccionar nivel</option>
                    <option value="Inicial">Inicial</option>
                    <option value="Primario">Primario</option>
                    <option value="Secundario">Secundario</option>
                    <option value="Terciario">Terciario</option>
                    <option value="Universitario">Universitario</option>
                `;
                break;
            default:
                options = `
                    <option value="">Seleccionar</option>
                    <option value="Opción 1">Opción 1</option>
                    <option value="Opción 2">Opción 2</option>
                `;
        }
        
        return `<select id="${fieldId}" name="${fieldName}">${options}</select>`;
    }
    
    async handleAddPoint() {
        if (!window.auth || !window.auth.isAuthenticated()) {
            Notifications.error('Debes iniciar sesión para agregar puntos');
            return;
        }
        
        if (!window.auth.isAdmin()) {
            Notifications.error('Solo los administradores pueden agregar puntos');
            return;
        }
        
        const formData = new FormData(document.getElementById('addPointForm'));
        const pointData = {
            nombre: formData.get('nombre'),
            descripcion: formData.get('descripcion'),
            latitud: parseFloat(formData.get('latitud')),
            longitud: parseFloat(formData.get('longitud')),
            categoria_id: parseInt(formData.get('categoria_id')),
            datos_personalizados: {}
        };
        
        // Validar campos requeridos
        if (!pointData.nombre || !pointData.latitud || !pointData.longitud || !pointData.categoria_id) {
            Notifications.error('Por favor completa todos los campos requeridos');
            return;
        }
        
        // Validar coordenadas
        if (pointData.latitud < -90 || pointData.latitud > 90 || 
            pointData.longitud < -180 || pointData.longitud > 180) {
            Notifications.error('Coordenadas inválidas');
            return;
        }
        
        // Recolectar campos personalizados
        const customFields = document.querySelectorAll('#customFields input, #customFields select');
        customFields.forEach(field => {
            if (field.value.trim()) {
                pointData.datos_personalizados[field.name] = field.value;
            }
        });
        
        Loading.show();
        
        try {
            const response = await API.post('/puntos', pointData);
            
            if (response.punto) {
                // Agregar marcador al mapa
                if (window.mapManager) {
                    window.mapManager.addMarker(response.punto);
                }
                
                // Cerrar modal y limpiar formulario
                this.cancelAddingPoint();
                
                Notifications.success('Punto agregado exitosamente');
            }
        } catch (error) {
            console.error('Error agregando punto:', error);
            Notifications.error(error.message || 'Error agregando punto');
        } finally {
            Loading.hide();
        }
    }
    
    async showHistory() {
        if (!window.auth.isAdmin()) {
            Notifications.error('Solo los administradores pueden ver el historial');
            return;
        }
        
        Modal.show('historyModal');
        await this.loadHistory();
    }
    
    async loadHistory() {
        try {
            Loading.show();
            
            const tableFilter = document.getElementById('historyTableFilter').value;
            const actionFilter = document.getElementById('historyActionFilter').value;
            
            let endpoint = '/historial';
            const params = new URLSearchParams();
            
            if (tableFilter) {
                params.append('tabla', tableFilter);
            }
            
            if (actionFilter) {
                params.append('accion', actionFilter);
            }
            
            if (params.toString()) {
                endpoint += '?' + params.toString();
            }
            
            const response = await API.get(endpoint);
            const history = response.historial || [];
            
            this.displayHistory(history);
            
        } catch (error) {
            console.error('Error cargando historial:', error);
            Notifications.error('Error cargando historial');
        } finally {
            Loading.hide();
        }
    }
    
    displayHistory(history) {
        const historyList = document.getElementById('historyList');
        
        if (history.length === 0) {
            historyList.innerHTML = '<p class="no-data">No hay registros en el historial</p>';
            return;
        }
        
        let html = '';
        
        history.forEach(item => {
            html += `
                <div class="history-item">
                    <h4>${this.getActionText(item.accion)} - ${item.tabla}</h4>
                    <p><strong>Usuario:</strong> ${item.usuario_nombre || 'Sistema'}</p>
                    <p><strong>Fecha:</strong> ${Utils.formatDate(item.fecha_cambio)}</p>
                    <p><strong>Registro ID:</strong> ${item.registro_id}</p>
                    
                    ${this.formatHistoryData(item)}
                </div>
            `;
        });
        
        historyList.innerHTML = html;
    }
    
    getActionText(action) {
        const actions = {
            'crear': 'Creación',
            'actualizar': 'Actualización',
            'eliminar': 'Eliminación'
        };
        return actions[action] || action;
    }
    
    formatHistoryData(item) {
        let html = '';
        
        if (item.datos_anteriores) {
            html += '<p><strong>Datos anteriores:</strong></p>';
            html += '<pre>' + JSON.stringify(item.datos_anteriores, null, 2) + '</pre>';
        }
        
        if (item.datos_nuevos) {
            html += '<p><strong>Datos nuevos:</strong></p>';
            html += '<pre>' + JSON.stringify(item.datos_nuevos, null, 2) + '</pre>';
        }
        
        return html;
    }
    
    async showHistoryStats() {
        try {
            const response = await API.get('/historial/estadisticas');
            const stats = response.estadisticas;
            
            // Mostrar estadísticas en un modal o panel
            console.log('Estadísticas del historial:', stats);
            
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            Notifications.error('Error cargando estadísticas');
        }
    }
    
    // Métodos para gestión de usuarios
    async showManageUsers() {
        if (!window.auth.isAdmin()) {
            Notifications.error('Solo los administradores pueden gestionar usuarios');
            return;
        }
        
        Modal.show('manageUsersModal');
        await this.loadUsers();
    }
    
    async loadUsers() {
        try {
            Loading.show();
            
            const roleFilter = document.getElementById('usersRoleFilter').value;
            const statusFilter = document.getElementById('usersStatusFilter').value;
            
            let endpoint = '/usuarios';
            const params = new URLSearchParams();
            
            if (roleFilter) {
                params.append('rol', roleFilter);
            }
            
            if (statusFilter) {
                params.append('estado', statusFilter);
            }
            
            if (params.toString()) {
                endpoint += '?' + params.toString();
            }
            
            const response = await API.get(endpoint);
            const users = response.usuarios || [];
            
            this.displayUsers(users);
            
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            Notifications.error('Error cargando usuarios');
        } finally {
            Loading.hide();
        }
    }
    
    displayUsers(users) {
        const usersList = document.getElementById('usersList');
        
        if (users.length === 0) {
            usersList.innerHTML = '<p class="no-data">No hay usuarios para mostrar</p>';
            return;
        }
        
        let html = '';
        
        users.forEach(user => {
            const isCurrentUser = user.id === window.auth.currentUser?.id;
            const isLastAdmin = user.rol === 'administrador' && this.isLastAdmin(users, user.id);
            
            html += `
                <div class="user-item">
                    <div class="user-info">
                        <h4>${user.nombre}</h4>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Teléfono:</strong> ${user.telefono || 'No especificado'}</p>
                        <p><strong>Institución:</strong> ${user.institucion || 'No especificada'}</p>
                        <span class="user-role ${user.rol}">${user.rol}</span>
                    </div>
                    <div class="user-actions">
                        <button class="btn-delete-user" 
                                onclick="window.adminManager.deleteUser(${user.id})"
                                ${isCurrentUser || isLastAdmin ? 'disabled' : ''}
                                title="${isCurrentUser ? 'No puedes eliminar tu propia cuenta' : isLastAdmin ? 'No se puede eliminar el último administrador' : 'Eliminar usuario'}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
        });
        
        usersList.innerHTML = html;
    }
    
    isLastAdmin(users, userId) {
        const admins = users.filter(user => user.rol === 'administrador');
        return admins.length === 1 && admins[0].id === userId;
    }
    
    async deleteUser(userId) {
        try {
            const user = this.getUserById(userId);
            if (!user) return;
            
            const isCurrentUser = userId === window.auth.currentUser?.id;
            if (isCurrentUser) {
                Notifications.error('No puedes eliminar tu propia cuenta');
                return;
            }
            
            const isLastAdmin = user.rol === 'administrador' && this.isLastAdmin(this.currentUsers, userId);
            if (isLastAdmin) {
                Notifications.error('No se puede eliminar el último administrador');
                return;
            }
            
            const confirmed = confirm(`¿Estás seguro de que quieres eliminar al usuario "${user.nombre}"?\n\nEsta acción no se puede deshacer.`);
            
            if (!confirmed) return;
            
            Loading.show();
            
            await API.delete(`/usuarios/${userId}`);
            
            Notifications.success('Usuario eliminado exitosamente');
            
            // Recargar lista de usuarios
            await this.loadUsers();
            
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            Notifications.error('Error eliminando usuario');
        } finally {
            Loading.hide();
        }
    }
    
    getUserById(userId) {
        return this.currentUsers?.find(user => user.id === userId);
    }
}

// Inicializar administración cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});

// Exportar para uso global
window.AdminManager = AdminManager;

