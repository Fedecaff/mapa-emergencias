class AlertasManager {
    constructor() {
        this.confirmacionStep = 0;
        this.emergencyMarker = null;
        this.isSelectingLocation = false;
        this.selectedLocation = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        console.log('🚨 AlertasManager inicializado');
    }

    bindEvents() {
        // Botón de emergencia
        const emergencyBtn = document.getElementById('emergencyBtn');
        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', () => {
                this.iniciarProcesoEmergencia();
            });
        }

        // Botón de confirmación
        const confirmarBtn = document.getElementById('confirmarEmergenciaBtn');
        if (confirmarBtn) {
            confirmarBtn.addEventListener('click', () => {
                this.mostrarFormularioEmergencia();
            });
        }

        // Formulario de emergencia
        const formEmergencia = document.getElementById('formEmergencia');
        if (formEmergencia) {
            formEmergencia.addEventListener('submit', (e) => {
                e.preventDefault();
                this.enviarAlerta();
            });
        }

        // Evento de clic en el mapa para seleccionar ubicación
        if (window.mapManager && window.mapManager.map) {
            window.mapManager.map.on('click', (e) => {
                if (this.isSelectingLocation) {
                    this.seleccionarUbicacion(e.latlng);
                }
            });
        } else {
            // Si el mapa no está disponible, intentar más tarde
            setTimeout(() => {
                this.bindMapEvents();
            }, 1000);
        }
    }

    bindMapEvents() {
        if (window.mapManager && window.mapManager.map) {
            window.mapManager.map.on('click', (e) => {
                if (this.isSelectingLocation) {
                    this.seleccionarUbicacion(e.latlng);
                }
            });
        }
    }

    iniciarProcesoEmergencia() {
        console.log('🚨 Iniciando proceso de emergencia...');
        
        // Verificar si el usuario está autenticado
        if (!window.auth.isAuthenticated()) {
            Notifications.error('Debes iniciar sesión para crear alertas de emergencia');
            return;
        }

        // Mostrar primera confirmación
        this.confirmacionStep = 1;
        Modal.show('modalConfirmacionEmergencia');
    }

    mostrarFormularioEmergencia() {
        console.log('📝 Mostrando formulario de emergencia...');
        
        // Cerrar modal de confirmación
        Modal.hide('modalConfirmacionEmergencia');
        
        // Mostrar formulario
        Modal.show('modalFormularioEmergencia');
        
        // Activar modo de selección de ubicación
        this.activarSeleccionUbicacion();
        
        // Limpiar formulario
        this.limpiarFormulario();
    }

    activarSeleccionUbicacion() {
        this.isSelectingLocation = true;
        this.selectedLocation = null;
        
        // Cambiar cursor del mapa
        if (window.mapManager) {
            window.mapManager.map.getContainer().style.cursor = 'crosshair';
        }
        
        // Mostrar instrucciones
        Notifications.info('Haz clic en el mapa para marcar la ubicación de la emergencia');
    }

    seleccionarUbicacion(latlng) {
        console.log('📍 Ubicación seleccionada:', latlng);
        
        this.selectedLocation = latlng;
        
        // Actualizar coordenadas en el formulario
        document.getElementById('emergencyLat').textContent = latlng.lat.toFixed(6);
        document.getElementById('emergencyLng').textContent = latlng.lng.toFixed(6);
        
        // Agregar marcador en el mapa
        this.agregarMarcadorEmergencia(latlng);
        
        // Desactivar modo de selección
        this.isSelectingLocation = false;
        
        if (window.mapManager) {
            window.mapManager.map.getContainer().style.cursor = '';
        }
        
        Notifications.success('Ubicación marcada correctamente');
    }

    agregarMarcadorEmergencia(latlng) {
        // Remover marcador anterior si existe
        if (this.emergencyMarker) {
            window.mapManager.map.removeLayer(this.emergencyMarker);
        }
        
        // Crear icono de emergencia
        const emergencyIcon = L.divIcon({
            className: 'emergency-marker',
            html: '<i class="fas fa-fire" style="color: #e74c3c; font-size: 24px;"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        // Agregar marcador
        this.emergencyMarker = L.marker(latlng, { icon: emergencyIcon })
            .addTo(window.mapManager.map)
            .bindPopup('<b>Ubicación de Emergencia</b><br>Marcada para alerta');
    }

    limpiarFormulario() {
        const form = document.getElementById('formEmergencia');
        form.reset();
        
        // Limpiar coordenadas
        document.getElementById('emergencyLat').textContent = '-';
        document.getElementById('emergencyLng').textContent = '-';
        
        // Remover marcador
        if (this.emergencyMarker) {
            window.mapManager.map.removeLayer(this.emergencyMarker);
            this.emergencyMarker = null;
        }
        
        this.selectedLocation = null;
    }

    async enviarAlerta() {
        try {
            Loading.show();
            
            // Validar ubicación
            if (!this.selectedLocation) {
                Notifications.error('Debes seleccionar una ubicación en el mapa');
                return;
            }
            
            // Obtener datos del formulario
            const formData = new FormData(document.getElementById('formEmergencia'));
            const alertaData = {
                tipo: formData.get('tipo'),
                prioridad: formData.get('prioridad'),
                titulo: formData.get('titulo'),
                descripcion: formData.get('descripcion'),
                latitud: this.selectedLocation.lat,
                longitud: this.selectedLocation.lng,
                direccion: formData.get('direccion'),
                personas_afectadas: parseInt(formData.get('personas_afectadas')) || 0,
                riesgos_especificos: formData.get('riesgos_especificos'),
                concurrencia_solicitada: parseInt(formData.get('concurrencia_solicitada')) || 1
            };
            
            console.log('📤 Enviando alerta:', alertaData);
            
            // Enviar alerta al servidor
            const response = await API.post('/alertas/crear', alertaData);
            
            console.log('✅ Alerta enviada:', response);
            
            // Mostrar confirmación
            Notifications.success('¡Alerta de emergencia enviada exitosamente!');
            
            // Cerrar modal
            Modal.hide('modalFormularioEmergencia');
            
            // Limpiar formulario
            this.limpiarFormulario();
            
            // Reproducir sonido de sirena (si está disponible)
            this.reproducirSonidoSirena();
            
        } catch (error) {
            console.error('❌ Error enviando alerta:', error);
            Notifications.error('Error enviando alerta: ' + (error.message || 'Error desconocido'));
        } finally {
            Loading.hide();
        }
    }

    reproducirSonidoSirena() {
        // Intentar reproducir sonido de sirena
        try {
            // Crear audio context para generar sirena
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Configurar sirena
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.5);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 1);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 1.5);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 2);
            
        } catch (error) {
            console.warn('No se pudo reproducir sonido de sirena:', error);
        }
    }

    // Método para cargar alertas activas (para futuras funcionalidades)
    async cargarAlertasActivas() {
        try {
            const response = await API.get('/alertas/listar');
            return response.alertas || [];
        } catch (error) {
            console.error('Error cargando alertas:', error);
            return [];
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco más para asegurar que todos los componentes estén listos
    setTimeout(() => {
        window.alertasManager = new AlertasManager();
    }, 100);
});
