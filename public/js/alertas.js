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
        this.bindLogoutEvent();
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

        // Delegación de eventos para botones de cerrar
        document.addEventListener('click', (e) => {
            if (e.target.closest('#modalConfirmacionEmergencia .btn-cerrar')) {
                Modal.hide('modalConfirmacionEmergencia');
            }
            if (e.target.closest('#modalFormularioEmergencia .btn-cerrar')) {
                this.cancelarFormulario();
            }
        });

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

    bindLogoutEvent() {
        // Escuchar evento de logout para limpiar alertas
        window.addEventListener('userLogout', () => {
            this.limpiarAlertas();
        });
        
        // Escuchar evento de login para cargar alertas
        window.addEventListener('userLogin', () => {
            this.cargarYMostrarAlertas();
        });
    }

    iniciarProcesoEmergencia() {
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
        // Cerrar modal de confirmación
        Modal.hide('modalConfirmacionEmergencia');
        
        // Limpiar formulario
        this.limpiarFormulario();
        
        // Activar modo de selección de ubicación primero
        this.activarSeleccionUbicacion();
        
        // Mostrar instrucciones
        Notifications.info('Primero selecciona la ubicación en el mapa, luego llena la información');
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
        
        Notifications.success('Ubicación marcada correctamente. Ahora puedes llenar la información.');
        
        // Mostrar el formulario después de seleccionar ubicación
        Modal.show('modalFormularioEmergencia');
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

    // Método para crear marcador de alerta activa con información completa
    crearMarcadorAlertaActiva(alerta) {
        const emergencyIcon = L.divIcon({
            className: 'emergency-marker-active',
            html: `<i class="fas fa-fire" style="color: #e74c3c; font-size: 24px;"></i>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        // Crear contenido del popup con toda la información
        const popupContent = this.crearPopupAlerta(alerta);
        
        const marker = L.marker([alerta.latitud, alerta.longitud], { icon: emergencyIcon })
            .addTo(window.mapManager.map)
            .bindPopup(popupContent, { maxWidth: 400 });
        
        // Guardar el ID de la alerta en el marcador para poder eliminarlo después
        marker._alertaId = alerta.id;
        
        // Agregar event listener para cuando se abra el popup
        marker.on('popupopen', () => {
            this.bindPopupEvents(alerta);
        });
        
        return marker;
    }

    bindPopupEvents(alerta) {
        // Event listener para botón "Ver Fotos"
        const btnVerFotos = document.querySelector('.btn-ver-fotos-emergencia');
        if (btnVerFotos) {
            btnVerFotos.addEventListener('click', () => {
                this.verFotosEmergencia(alerta.id);
            });
        }
        
        // Event listener para botón "Cambiar Estado" (solo admin)
        const btnCambiarEstado = document.querySelector('.btn-cambiar-estado');
        if (btnCambiarEstado) {
            btnCambiarEstado.addEventListener('click', () => {
                this.cambiarEstadoEmergencia(alerta.id);
            });
        }
        
        // Event listener para botón "Dar de Baja" (solo admin)
        const btnDarBaja = document.querySelector('.btn-dar-baja');
        if (btnDarBaja) {
            btnDarBaja.addEventListener('click', () => {
                this.confirmarDarDeBaja(alerta.id, alerta.titulo);
            });
        }
    }

    // Método para confirmar dar de baja
    async confirmarDarDeBaja(alertaId, titulo) {
        const confirmacion = confirm(`¿Estás seguro de que quieres dar de baja la alerta "${titulo}"?\n\nEsta acción no se puede deshacer.`);
        
        if (confirmacion) {
            const resultado = await this.darDeBajaAlerta(alertaId);
            if (resultado) {
                // Cerrar el popup
                if (window.mapManager && window.mapManager.map) {
                    window.mapManager.map.closePopup();
                }
            }
        }
    }

    async verFotosEmergencia(alertaId) {
        try {
            // Por ahora solo mostrar mensaje, implementar después
            Notifications.info('Funcionalidad de fotos para emergencias próximamente');
        } catch (error) {
            console.error('Error verificando fotos:', error);
            Notifications.error('Error al cargar fotos');
        }
    }

    async cambiarEstadoEmergencia(alertaId) {
        try {
            // Por ahora solo mostrar mensaje, implementar después
            Notifications.info('Funcionalidad de cambio de estado próximamente');
        } catch (error) {
            console.error('Error cambiando estado:', error);
            Notifications.error('Error al cambiar estado');
        }
    }

    crearPopupAlerta(alerta) {
        const prioridadColor = {
            'alta': '#e74c3c',
            'media': '#f39c12',
            'baja': '#27ae60'
        };

        const tipoIconos = {
            'incendio_estructural': 'fa-building',
            'incendio_forestal': 'fa-tree',
            'accidente_vehicular': 'fa-car',
            'rescate': 'fa-life-ring',
            'fuga_gas': 'fa-fire',
            'otro': 'fa-exclamation-triangle'
        };

        const icono = tipoIconos[alerta.tipo] || 'fa-exclamation-triangle';
        const color = prioridadColor[alerta.prioridad] || '#e74c3c';

        let html = `
            <div class="emergency-popup">
                <div class="emergency-header" style="background: ${color}; color: white; padding: 10px; margin: -10px -10px 10px -10px; border-radius: 5px 5px 0 0;">
                    <h3 style="margin: 0; font-size: 16px;">
                        <i class="fas ${icono}"></i> ${alerta.titulo}
                    </h3>
                    <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">
                        Prioridad: ${alerta.prioridad.toUpperCase()} | ${new Date(alerta.fecha_creacion).toLocaleString()}
                    </p>
                </div>
                
                <div class="emergency-details">
                    <p><strong>Tipo:</strong> ${this.traducirTipo(alerta.tipo)}</p>
                    ${alerta.descripcion ? `<p><strong>Descripción:</strong> ${alerta.descripcion}</p>` : ''}
                    ${alerta.direccion ? `<p><strong>Dirección:</strong> ${alerta.direccion}</p>` : ''}
                    ${alerta.personas_afectadas > 0 ? `<p><strong>Personas afectadas:</strong> ${alerta.personas_afectadas}</p>` : ''}
                    ${alerta.riesgos_especificos ? `<p><strong>Riesgos:</strong> ${alerta.riesgos_especificos}</p>` : ''}
                    <p><strong>Concurrencia solicitada:</strong> ${alerta.concurrencia_solicitada === 'todos' ? 'Todos los disponibles' : `${alerta.concurrencia_solicitada} bomberos`}</p>
                    <p><strong>Reportado por:</strong> ${alerta.usuario_nombre}</p>
                </div>
                
                                 <div class="emergency-actions" style="margin-top: 15px; text-align: center;">
                     <button class="btn-ver-fotos-emergencia" data-alerta-id="${alerta.id}" style="background: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                         <i class="fas fa-camera"></i> Ver Fotos
                     </button>
                     ${window.auth.isAdmin() ? `
                         <button class="btn-cambiar-estado" data-alerta-id="${alerta.id}" style="background: #f39c12; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                             <i class="fas fa-edit"></i> Cambiar Estado
                         </button>
                         <button class="btn-dar-baja" data-alerta-id="${alerta.id}" style="background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">
                             <i class="fas fa-trash"></i> Dar de Baja
                         </button>
                     ` : ''}
                 </div>
            </div>
        `;

        return html;
    }

    traducirTipo(tipo) {
        const traducciones = {
            'incendio_estructural': 'Incendio Estructural',
            'incendio_forestal': 'Incendio Forestal',
            'accidente_vehicular': 'Accidente Vehicular',
            'rescate': 'Rescate',
            'fuga_gas': 'Fuga de Gas',
            'otro': 'Otro'
        };
        return traducciones[tipo] || tipo;
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
                concurrencia_solicitada: formData.get('concurrencia_solicitada') === 'todos' ? 'todos' : parseInt(formData.get('concurrencia_solicitada')) || 1
            };
            
            // Enviar alerta al servidor
            const response = await API.post('/alertas/crear', alertaData);
            
            // Remover marcador temporal
            if (this.emergencyMarker) {
                window.mapManager.map.removeLayer(this.emergencyMarker);
                this.emergencyMarker = null;
            }
            
            // Crear marcador de alerta activa con información completa
            const alertaActiva = response.alerta;
            this.crearMarcadorAlertaActiva(alertaActiva);
            
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

    // Método para cancelar formulario
    cancelarFormulario() {
        // Desactivar modo de selección de ubicación
        this.isSelectingLocation = false;
        
        // Remover marcador temporal si existe
        if (this.emergencyMarker) {
            window.mapManager.map.removeLayer(this.emergencyMarker);
            this.emergencyMarker = null;
        }
        
        // Limpiar formulario
        this.limpiarFormulario();
        
        // Cerrar modal
        Modal.hide('modalFormularioEmergencia');
        
        // Restaurar cursor del mapa
        if (window.mapManager && window.mapManager.map) {
            window.mapManager.map.getContainer().style.cursor = '';
        }
        
        }

    // Método para limpiar alertas cuando el usuario hace logout
    limpiarAlertas() {
        // Remover marcador temporal si existe
        if (this.emergencyMarker) {
            if (window.mapManager && window.mapManager.map) {
                window.mapManager.map.removeLayer(this.emergencyMarker);
            }
            this.emergencyMarker = null;
        }
        
        // Ocultar todos los marcadores de emergencia del mapa (no eliminarlos)
        if (window.mapManager && window.mapManager.map) {
            window.mapManager.map.eachLayer((layer) => {
                if (layer._icon && layer._icon.className && 
                    layer._icon.className.includes('emergency-marker')) {
                    window.mapManager.map.removeLayer(layer);
                }
            });
        }
        
        // Limpiar estado
        this.isSelectingLocation = false;
        this.selectedLocation = null;
        this.confirmacionStep = 0;
        
        }

    // Método para cargar y mostrar alertas activas al hacer login
    async cargarYMostrarAlertas() {
        try {
            const alertas = await this.cargarAlertasActivas();
            // Mostrar solo alertas activas
            alertas.forEach(alerta => {
                if (alerta.estado === 'activa') {
                    this.crearMarcadorAlertaActiva(alerta);
                }
            });
            
            } catch (error) {
            console.error('❌ Error cargando alertas:', error);
        }
    }

    // Método para dar de baja una alerta (solo admin)
    async darDeBajaAlerta(alertaId) {
        try {
            const response = await API.delete(`/alertas/${alertaId}`);
            
            if (response.mensaje) {
                Notifications.success('Alerta dada de baja exitosamente');
                
                // Remover marcador del mapa
                if (window.mapManager && window.mapManager.map) {
                    window.mapManager.map.eachLayer((layer) => {
                        if (layer._alertaId === alertaId) {
                            window.mapManager.map.removeLayer(layer);
                        }
                    });
                }
                
                return true;
            }
        } catch (error) {
            console.error('❌ Error dando de baja alerta:', error);
            Notifications.error('Error dando de baja la alerta');
            return false;
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
