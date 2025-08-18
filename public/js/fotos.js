class FotosManager {
    constructor() {
        this.currentPuntoId = null;
        this.fotos = [];
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Eventos para el modal de fotos
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-ver-fotos')) {
                const puntoId = e.target.dataset.puntoId;
                this.mostrarModalFotos(puntoId);
            }
            
            if (e.target.classList.contains('btn-subir-foto')) {
                this.mostrarModalSubirFoto();
            }
            
            if (e.target.classList.contains('btn-eliminar-foto')) {
                const fotoId = e.target.dataset.fotoId;
                this.eliminarFoto(fotoId);
            }
            
            if (e.target.classList.contains('btn-ver-foto')) {
                const fotoUrl = e.target.dataset.fotoUrl;
                this.mostrarFotoCompleta(fotoUrl);
            }
        });

        // Evento para cerrar modales
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('btn-cerrar')) {
                this.cerrarModales();
            }
        });

        // Evento para subir foto
        const formSubirFoto = document.getElementById('formSubirFoto');
        if (formSubirFoto) {
            formSubirFoto.addEventListener('submit', (e) => {
                e.preventDefault();
                this.subirFoto();
            });
        }

        // Evento para seleccionar archivo
        const inputFoto = document.getElementById('inputFoto');
        if (inputFoto) {
            inputFoto.addEventListener('change', (e) => {
                this.previewFoto(e.target.files[0]);
            });
        }
    }

    async mostrarModalFotos(puntoId) {
        this.currentPuntoId = puntoId;
        
        try {
            const response = await API.get(`/fotos/punto/${puntoId}`);
            this.fotos = response.fotos;
            this.renderizarFotos();
            this.mostrarModal('modalFotos');
        } catch (error) {
            console.error('Error cargando fotos:', error);
            mostrarNotificacion('Error cargando fotos', 'error');
        }
    }

    renderizarFotos() {
        const contenedorFotos = document.getElementById('contenedorFotos');
        if (!contenedorFotos) return;

        if (this.fotos.length === 0) {
            contenedorFotos.innerHTML = `
                <div class="no-fotos">
                    <i class="fas fa-camera"></i>
                    <p>No hay fotos para este punto</p>
                </div>
            `;
            return;
        }

        const fotosHTML = this.fotos.map(foto => `
            <div class="foto-item" data-foto-id="${foto.id}">
                <div class="foto-preview">
                    <img src="${foto.ruta_archivo}" alt="Foto del punto" 
                         onclick="window.fotosManager.mostrarFotoCompleta('${foto.ruta_archivo}')">
                    <div class="foto-overlay">
                        <button class="btn-ver-foto" data-foto-url="${foto.ruta_archivo}">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${window.Auth.currentUser?.rol === 'admin' ? `
                            <button class="btn-eliminar-foto" data-foto-id="${foto.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="foto-info">
                    <p class="foto-descripcion">${foto.descripcion || 'Sin descripción'}</p>
                    <small class="foto-fecha">${new Date(foto.fecha_subida).toLocaleDateString()}</small>
                    ${foto.usuario_nombre ? `<small class="foto-usuario">Por: ${foto.usuario_nombre}</small>` : ''}
                </div>
            </div>
        `).join('');

        contenedorFotos.innerHTML = fotosHTML;
    }

    mostrarModalSubirFoto() {
        if (!this.currentPuntoId) {
            mostrarNotificacion('Selecciona un punto primero', 'error');
            return;
        }

        if (window.Auth.currentUser?.rol !== 'admin') {
            mostrarNotificacion('Solo los administradores pueden subir fotos', 'error');
            return;
        }

        this.mostrarModal('modalSubirFoto');
        this.limpiarFormulario();
    }

    async subirFoto() {
        const formData = new FormData();
        const inputFoto = document.getElementById('inputFoto');
        const inputDescripcion = document.getElementById('inputDescripcion');

        if (!inputFoto.files[0]) {
            mostrarNotificacion('Selecciona una foto', 'error');
            return;
        }

        formData.append('foto', inputFoto.files[0]);
        formData.append('punto_id', this.currentPuntoId);
        formData.append('descripcion', inputDescripcion.value || '');

        try {
            mostrarLoading('Subiendo foto...');
            
            const response = await fetch(`${API.API_URL}/fotos/subir`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.Auth.token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error subiendo foto');
            }

            ocultarLoading();
            mostrarNotificacion('Foto subida exitosamente', 'success');
            
            // Recargar fotos
            await this.mostrarModalFotos(this.currentPuntoId);
            
            // Cerrar modal
            this.cerrarModales();
            
        } catch (error) {
            ocultarLoading();
            console.error('Error subiendo foto:', error);
            mostrarNotificacion(error.message, 'error');
        }
    }

    async eliminarFoto(fotoId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
            return;
        }

        try {
            mostrarLoading('Eliminando foto...');
            
            await API.delete(`/fotos/${fotoId}`);
            
            ocultarLoading();
            mostrarNotificacion('Foto eliminada exitosamente', 'success');
            
            // Recargar fotos
            await this.mostrarModalFotos(this.currentPuntoId);
            
        } catch (error) {
            ocultarLoading();
            console.error('Error eliminando foto:', error);
            mostrarNotificacion('Error eliminando foto', 'error');
        }
    }

    previewFoto(file) {
        const preview = document.getElementById('previewFoto');
        const label = document.getElementById('labelFoto');
        
        if (!file) {
            preview.style.display = 'none';
            label.textContent = 'Seleccionar foto';
            return;
        }

        // Validar tipo de archivo
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
        if (!tiposPermitidos.includes(file.type)) {
            mostrarNotificacion('Tipo de archivo no permitido. Solo JPG, PNG y HEIC', 'error');
            return;
        }

        // Validar tamaño (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            mostrarNotificacion('El archivo es demasiado grande. Máximo 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            label.textContent = file.name;
        };
        reader.readAsDataURL(file);
    }

    mostrarFotoCompleta(url) {
        const modal = document.getElementById('modalFotoCompleta');
        const img = document.getElementById('imgFotoCompleta');
        
        if (modal && img) {
            img.src = url;
            modal.style.display = 'flex';
        }
    }

    mostrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    cerrarModales() {
        const modales = document.querySelectorAll('.modal');
        modales.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    limpiarFormulario() {
        const form = document.getElementById('formSubirFoto');
        if (form) {
            form.reset();
        }
        
        const preview = document.getElementById('previewFoto');
        const label = document.getElementById('labelFoto');
        
        if (preview) preview.style.display = 'none';
        if (label) label.textContent = 'Seleccionar foto';
    }

    // Método para agregar botón de fotos a un punto en el mapa
    agregarBotonFotos(puntoId) {
        return `
            <button class="btn-ver-fotos" data-punto-id="${puntoId}">
                <i class="fas fa-camera"></i> Ver Fotos
            </button>
        `;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.fotosManager = new FotosManager();
});
