class GeolocalizacionManager {
    constructor() {
        this.watchId = null;
        this.intervalId = null;
        this.isActive = false;
        this.currentPosition = null;
        this.updateInterval = 30000; // 30 segundos
        this.userId = null;
        
        console.log('📍 GeolocalizacionManager inicializado');
    }

    // Inicializar geolocalización para un usuario
    init(userId) {
        this.userId = userId;
        console.log(`📍 Inicializando geolocalización para usuario ID: ${userId}`);
        
        // Verificar si el navegador soporta geolocalización
        if (!navigator.geolocation) {
            console.error('❌ Geolocalización no soportada por el navegador');
            return false;
        }

        // Solicitar ubicación inicial
        this.obtenerUbicacionInicial();
        
        // Iniciar seguimiento continuo
        this.iniciarSeguimiento();
        
        return true;
    }

    // Obtener ubicación inicial
    async obtenerUbicacionInicial() {
        try {
            console.log('📍 Obteniendo ubicación inicial...');
            
            const position = await this.getCurrentPosition();
            this.currentPosition = position;
            
            console.log('📍 Ubicación obtenida:', {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
            });
            
            // Enviar ubicación al servidor
            await this.enviarUbicacion(position.coords.latitude, position.coords.longitude);
            
            console.log('✅ Ubicación inicial obtenida y enviada');
            
        } catch (error) {
            console.error('❌ Error obteniendo ubicación inicial:', error);
            this.mostrarErrorGeolocalizacion(error);
        }
    }

    // Iniciar seguimiento continuo
    iniciarSeguimiento() {
        try {
            console.log('📍 Iniciando seguimiento continuo de ubicación...');
            
            // Usar watchPosition para seguimiento continuo
            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    this.currentPosition = position;
                    this.enviarUbicacion(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error('❌ Error en seguimiento de ubicación:', error);
                    this.mostrarErrorGeolocalizacion(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000 // 1 minuto
                }
            );

            // También usar interval como respaldo
            this.intervalId = setInterval(async () => {
                if (this.currentPosition) {
                    await this.enviarUbicacion(
                        this.currentPosition.coords.latitude, 
                        this.currentPosition.coords.longitude
                    );
                }
            }, this.updateInterval);

            this.isActive = true;
            console.log('✅ Seguimiento de ubicación iniciado');
            
        } catch (error) {
            console.error('❌ Error iniciando seguimiento:', error);
        }
    }

    // Obtener posición actual (Promise wrapper)
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            });
        });
    }

    // Enviar ubicación al servidor
    async enviarUbicacion(latitud, longitud) {
        try {
            if (!this.userId) {
                console.warn('⚠️ No hay usuario ID para enviar ubicación');
                return;
            }

            const response = await fetch(`/api/usuarios/${this.userId}/ubicacion`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    latitud: parseFloat(latitud),
                    longitud: parseFloat(longitud)
                })
            });

            if (response.ok) {
                console.log(`✅ Ubicación enviada: ${latitud}, ${longitud}`);
                this.actualizarIndicadorUbicacion(true);
                
                // Notificar al DireccionesManager sobre la nueva ubicación
                if (window.direccionesManager) {
                    const userLocation = {
                        latitud: parseFloat(latitud),
                        longitud: parseFloat(longitud)
                    };
                    window.direccionesManager.setUserLocation(userLocation);
                    console.log('📍 Ubicación notificada al DireccionesManager:', userLocation);
                }
            } else {
                const error = await response.json();
                console.error('❌ Error enviando ubicación:', error);
            }

        } catch (error) {
            console.error('❌ Error enviando ubicación:', error);
        }
    }

    // Mostrar error de geolocalización
    mostrarErrorGeolocalizacion(error) {
        let mensaje = 'Error de geolocalización';
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                mensaje = 'Permiso de ubicación denegado. Habilita la ubicación en tu navegador.';
                break;
            case error.POSITION_UNAVAILABLE:
                mensaje = 'Información de ubicación no disponible.';
                break;
            case error.TIMEOUT:
                mensaje = 'Tiempo de espera agotado al obtener ubicación.';
                break;
            default:
                mensaje = 'Error desconocido de geolocalización.';
        }

        console.error(`❌ ${mensaje}`);
        this.actualizarIndicadorUbicacion(false, mensaje);
    }

    // Actualizar indicador de ubicación en la UI
    actualizarIndicadorUbicacion(activo, mensaje = '') {
        // Crear o actualizar indicador en el panel de usuario
        let indicador = document.getElementById('ubicacion-indicador');
        
        if (!indicador) {
            indicador = document.createElement('div');
            indicador.id = 'ubicacion-indicador';
            indicador.className = 'ubicacion-indicador';
            
            // Buscar donde insertar el indicador
            const userPanel = document.querySelector('.user-panel') || 
                             document.querySelector('.profile-panel') ||
                             document.querySelector('.availability-panel');
            
            if (userPanel) {
                userPanel.appendChild(indicador);
            }
        }

        if (activo) {
            indicador.innerHTML = `
                <span class="ubicacion-status activo">
                    📍 Ubicación activa
                </span>
            `;
            indicador.className = 'ubicacion-indicador activo';
        } else {
            indicador.innerHTML = `
                <span class="ubicacion-status inactivo">
                    ❌ ${mensaje || 'Ubicación inactiva'}
                </span>
            `;
            indicador.className = 'ubicacion-indicador inactivo';
        }
    }

    // Detener geolocalización
    stop() {
        console.log('📍 Deteniendo geolocalización...');
        
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.isActive = false;
        this.currentPosition = null;
        this.userId = null;
        
        // Ocultar indicador
        const indicador = document.getElementById('ubicacion-indicador');
        if (indicador) {
            indicador.remove();
        }
        
        console.log('✅ Geolocalización detenida');
    }

    // Obtener estado actual
    getStatus() {
        return {
            isActive: this.isActive,
            hasPosition: !!this.currentPosition,
            userId: this.userId,
            lastUpdate: this.currentPosition ? new Date(this.currentPosition.timestamp) : null
        };
    }
}

// Exportar para uso global
window.GeolocalizacionManager = GeolocalizacionManager;
