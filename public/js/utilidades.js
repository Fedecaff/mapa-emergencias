// Utilidades globales para la aplicación

// Configuración de la API
const API_BASE_URL = window.CONFIG ? window.CONFIG.API_URL : '/api';

// Clase para manejar notificaciones
class Notifications {
    static show(message, type = 'success', duration = 5000) {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notifications.appendChild(notification);
        
        // Auto-remover después del tiempo especificado
        setTimeout(() => {
            notification.remove();
        }, duration);
        
        return notification;
    }
    
    static getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    static success(message, duration) {
        return this.show(message, 'success', duration);
    }
    
    static error(message, duration) {
        return this.show(message, 'error', duration);
    }
    
    static warning(message, duration) {
        return this.show(message, 'warning', duration);
    }
    
    static info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Clase para manejar el loading
class Loading {
    static show() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.add('show');
    }
    
    static hide() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.remove('show');
    }
}

// Clase para manejar modales
class Modal {
    static show(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Agregar evento para cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hide(modalId);
            }
        });
    }
    
    static hide(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
    
    static hideAll() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = 'auto';
    }
}

// Clase para manejar peticiones HTTP
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        // Configuración por defecto
        const defaultOptions = {
            headers: {},
        };
        
        // Agregar token si existe
        let token = null;
        if (window.auth && window.auth.token) {
            token = window.auth.token;
        } else {
            token = localStorage.getItem('token');
        }
        
        if (token) {
            defaultOptions.headers['Authorization'] = `Bearer ${token}`;
            console.log('Token enviado en petición:', token.substring(0, 20) + '...');
        } else {
            console.log('No hay token disponible para la petición');
        }
        
        // Combinar opciones
        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };
        
        try {
            const response = await fetch(url, finalOptions);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`;
                
                // Manejar errores específicos
                if (response.status === 401) {
                    console.warn('⚠️ Token expirado, intentando renovar sesión...');
                    // Limpiar token expirado y forzar nuevo login
                    if (window.auth) {
                        window.auth.logout();
                        Notifications.warning('Sesión expirada. Por favor, inicia sesión nuevamente.');
                    }
                    throw new Error('Sesión expirada');
                }
                
                throw new Error(errorMessage);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    static get(endpoint) {
        return this.request(endpoint);
    }
    
    static post(endpoint, data) {
        const options = {
            method: 'POST',
        };
        
        // Si es FormData, no usar JSON.stringify y no establecer Content-Type
        if (data instanceof FormData) {
            options.body = data;
            // El navegador establecerá automáticamente el Content-Type con el boundary
        } else {
            options.body = JSON.stringify(data);
            options.headers = {
                'Content-Type': 'application/json'
            };
        }
        
        return this.request(endpoint, options);
    }
    
    static put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    
    static delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }
}

// Clase para manejar la geolocalización
class Geolocation {
    static async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalización no soportada'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('📍 Ubicación obtenida:', {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                    
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    console.error('❌ Error de geolocalización:', error);
                    let message = 'Error al obtener ubicación';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            message = 'Permiso denegado para geolocalización. Por favor, permite el acceso a tu ubicación.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = 'Información de ubicación no disponible. Verifica tu conexión GPS.';
                            break;
                        case error.TIMEOUT:
                            message = 'Tiempo de espera agotado. Intenta nuevamente.';
                            break;
                        default:
                            message = `Error de geolocalización: ${error.message}`;
                    }
                    reject(new Error(message));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 60000
                }
            );
        });
    }

    static async reverseGeocode(lat, lng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            return data.display_name || 'Ubicación desconocida';
        } catch (error) {
            console.error('Error en reverse geocoding:', error);
            return 'Ubicación desconocida';
        }
    }
}

// Clase para manejar el almacenamiento local
class Storage {
    static set(key, value) {
        try {
            // Para tokens, guardar como string simple sin JSON.stringify
            if (key === 'token') {
                localStorage.setItem(key, value);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
        }
    }
    
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;
            
            // Para tokens, devolver como string simple sin JSON.parse
            if (key === 'token') {
                return item;
            } else {
                return JSON.parse(item);
            }
        } catch (error) {
            console.error('Error leyendo de localStorage:', error);
            return defaultValue;
        }
    }
    
    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removiendo de localStorage:', error);
        }
    }
    
    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error limpiando localStorage:', error);
        }
    }
}

// Funciones de utilidad
const Utils = {
    // Formatear fecha
    formatDate(date) {
        return new Date(date).toLocaleString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Formatear distancia
    formatDistance(meters) {
        if (meters < 1000) {
            return `${Math.round(meters)}m`;
        } else {
            return `${(meters / 1000).toFixed(1)}km`;
        }
    },
    
    // Validar email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Generar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Capitalizar primera letra
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    // Limpiar string
    sanitizeString(str) {
        return str.replace(/[<>]/g, '');
    }
};

// Event listeners globales
document.addEventListener('DOMContentLoaded', () => {
    // Cerrar modales al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            Modal.hideAll();
        }
    });
    
    // Cerrar modales con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Modal.hideAll();
        }
    });
    
    // Prevenir envío de formularios vacíos
    document.addEventListener('submit', (e) => {
        if (e.target.tagName === 'FORM') {
            const requiredFields = e.target.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                Notifications.error('Por favor completa todos los campos requeridos');
            }
        }
    });
});

// Exportar para uso global
window.Notifications = Notifications;
window.Loading = Loading;
window.Modal = Modal;
window.API = API;
window.Geolocation = Geolocation;
window.Storage = Storage;
window.Utils = Utils;

