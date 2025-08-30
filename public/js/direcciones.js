/**
 * Gestor de Direcciones y Rutas
 * Maneja la funcionalidad de indicaciones en el mapa
 */
class DireccionesManager {
    constructor() {
        this.routingControl = null;
        this.selectedPoint = null;
        this.userLocation = null;
        this.isRoutingActive = false;
        
        this.initializeElements();
        this.bindEvents();
    }

    /**
     * Inicializa los elementos del DOM
     */
    initializeElements() {
        this.directionsBtn = document.getElementById('directionsBtn');
        this.clearDirectionsBtn = document.getElementById('clearDirectionsBtn');
        this.directionsInfo = document.getElementById('directionsInfo');
    }

    /**
     * Vincula los eventos
     */
    bindEvents() {
        if (this.directionsBtn) {
            this.directionsBtn.addEventListener('click', () => this.showDirections());
        }
        
        if (this.clearDirectionsBtn) {
            this.clearDirectionsBtn.addEventListener('click', () => this.clearDirections());
        }
    }

    /**
     * Establece la ubicación del usuario
     * @param {Object} location - Objeto con latitud y longitud
     */
    setUserLocation(location) {
        this.userLocation = location;
        console.log('📍 Ubicación del usuario establecida:', location);
        console.log('🔍 Estado actual - selectedPoint:', this.selectedPoint, 'directionsBtn:', !!this.directionsBtn);
        
        // Actualizar el estado del botón si hay un punto seleccionado
        if (this.selectedPoint && this.directionsBtn) {
            this.directionsBtn.disabled = false;
            console.log('✅ Botón "Mostrar Ruta" habilitado');
        } else {
            console.log('⚠️ No se pudo habilitar el botón - selectedPoint:', !!this.selectedPoint, 'directionsBtn:', !!this.directionsBtn);
        }
        
        // Actualizar información si hay un punto seleccionado
        if (this.selectedPoint && this.directionsInfo) {
            this.updateDirectionsInfo();
        }
    }

    /**
     * Selecciona un punto para mostrar indicaciones
     * @param {Object} point - Punto seleccionado con latitud, longitud y nombre
     */
    selectPoint(point) {
        this.selectedPoint = point;
        console.log('🎯 Punto seleccionado para indicaciones:', point);
        console.log('🔍 Estado actual - userLocation:', this.userLocation, 'directionsBtn:', !!this.directionsBtn);
        
        if (this.directionsBtn) {
            this.directionsBtn.disabled = !this.userLocation;
            console.log(`🔘 Botón "Mostrar Ruta" ${this.userLocation ? 'habilitado' : 'deshabilitado'}`);
        } else {
            console.log('⚠️ No se encontró el botón directionsBtn');
        }
        
        this.updateDirectionsInfo();
    }

    /**
     * Actualiza la información mostrada en el panel de direcciones
     */
    updateDirectionsInfo() {
        if (!this.directionsInfo) return;
        
        if (!this.selectedPoint) {
            this.directionsInfo.innerHTML = `
                <p class="text-muted">Selecciona un punto en el mapa para mostrar indicaciones</p>
            `;
            return;
        }
        
        // Convertir coordenadas a números y formatear
        const lat = parseFloat(this.selectedPoint.latitud);
        const lng = parseFloat(this.selectedPoint.longitud);
        
        this.directionsInfo.innerHTML = `
            <p><strong>Destino:</strong> ${this.selectedPoint.nombre || 'Punto seleccionado'}</p>
            <p><strong>Coordenadas:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
            ${this.userLocation ? 
                '<p class="text-success">✅ Haz clic en "Mostrar Ruta" para ver las indicaciones</p>' : 
                '<p class="text-warning">⚠️ Esperando tu ubicación...</p>'
            }
        `;
    }

    /**
     * Muestra las indicaciones/ruta
     */
    showDirections() {
        if (!this.userLocation || !this.selectedPoint) {
            console.warn('❌ No hay ubicación del usuario o punto seleccionado');
            return;
        }

        try {
            // Limpiar ruta anterior si existe
            this.clearDirections();

            // Crear waypoints para la ruta
            const waypoints = [
                L.latLng(this.userLocation.latitud, this.userLocation.longitud),
                L.latLng(this.selectedPoint.latitud, this.selectedPoint.longitud)
            ];

            // Crear control de routing
            this.routingControl = L.Routing.control({
                waypoints: waypoints,
                routeWhileDragging: false,
                showAlternatives: false,
                fitSelectedRoutes: true,
                lineOptions: {
                    styles: [{ color: '#3498db', weight: 6, opacity: 0.8 }]
                },
                createMarker: function() { return null; } // No crear marcadores automáticos
            });

            // Agregar al mapa
            if (window.mapManager && window.mapManager.map) {
                this.routingControl.addTo(window.mapManager.map);
                this.isRoutingActive = true;
                
                // Mostrar botón de limpiar
                if (this.clearDirectionsBtn) {
                    this.clearDirectionsBtn.style.display = 'block';
                }
                
                // Actualizar información
                if (this.directionsInfo) {
                    this.directionsInfo.innerHTML = `
                        <p><strong>Ruta activa:</strong></p>
                        <p><strong>Desde:</strong> Tu ubicación</p>
                        <p><strong>Hasta:</strong> ${this.selectedPoint.nombre || 'Destino'}</p>
                        <p class="text-success">🗺️ Ruta mostrada en el mapa</p>
                    `;
                }
                
                console.log('✅ Ruta creada exitosamente');
            } else {
                console.error('❌ No se encontró el mapa');
            }
        } catch (error) {
            console.error('❌ Error al crear la ruta:', error);
            this.showError('Error al calcular la ruta. Intenta nuevamente.');
        }
    }

    /**
     * Limpia las indicaciones/ruta
     */
    clearDirections() {
        if (this.routingControl && window.mapManager && window.mapManager.map) {
            window.mapManager.map.removeControl(this.routingControl);
            this.routingControl = null;
            this.isRoutingActive = false;
        }
        
        // Ocultar botón de limpiar
        if (this.clearDirectionsBtn) {
            this.clearDirectionsBtn.style.display = 'none';
        }
        
        // Actualizar información
        this.updateDirectionsInfo();
        
        console.log('🗑️ Ruta eliminada');
    }

    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje de error
     */
    showError(message) {
        if (this.directionsInfo) {
            this.directionsInfo.innerHTML = `
                <p class="text-danger">❌ ${message}</p>
            `;
        }
    }

    /**
     * Limpia la selección actual
     */
    clearSelection() {
        this.selectedPoint = null;
        this.clearDirections();
        
        if (this.directionsBtn) {
            this.directionsBtn.disabled = true;
        }
        
        this.updateDirectionsInfo();
        
        if (this.clearDirectionsBtn) {
            this.clearDirectionsBtn.style.display = 'none';
        }
    }

    /**
     * Obtiene información de la ruta actual
     * @returns {Object|null} Información de la ruta o null si no hay ruta activa
     */
    getRouteInfo() {
        if (!this.isRoutingActive || !this.routingControl) {
            return null;
        }
        
        return {
            from: this.userLocation,
            to: this.selectedPoint,
            isActive: this.isRoutingActive
        };
    }
}

// Exportar para uso global
window.DireccionesManager = DireccionesManager;

// Inicializar el gestor de direcciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.direccionesManager = new DireccionesManager();
    console.log('🗺️ DireccionesManager inicializado');
});
