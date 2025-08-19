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

        // Evento para cerrar modales de fotos
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-cerrar')) {
                const modal = e.target.closest('.modal');
                if (modal && ['modalFotos', 'modalSubirFoto', 'modalFotoCompleta'].includes(modal.id)) {
                    this.cerrarModales();
                }
            }
            
            // Cerrar al hacer clic fuera del contenido del modal
            if (e.target.classList.contains('modal')) {
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
        console.log('📸 Cargando fotos para punto:', puntoId);
        
        try {
            const response = await API.get(`/fotos/punto/${puntoId}`);
            console.log('📸 Respuesta del servidor:', response);
            this.fotos = response.fotos;
            console.log('📸 Fotos cargadas:', this.fotos);
            this.renderizarFotos();
            this.mostrarModal('modalFotos');
        } catch (error) {
            console.error('Error cargando fotos:', error);
            Notifications.error('Error cargando fotos');
        }
    }

    renderizarFotos() {
        const contenedorFotos = document.getElementById('contenedorFotos');
        if (!contenedorFotos) {
            console.error('❌ Contenedor de fotos no encontrado');
            return;
        }

        console.log('📸 Renderizando fotos:', this.fotos.length);

        if (this.fotos.length === 0) {
            contenedorFotos.innerHTML = `
                <div class="no-fotos">
                    <i class="fas fa-camera"></i>
                    <p>No hay fotos para este punto</p>
                </div>
            `;
            return;
        }

        const fotosHTML = this.fotos.map(foto => {
            // Escapar la data URL para el HTML
            const escapedUrl = foto.ruta_archivo.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            
            return `
                <div class="foto-item" data-foto-id="${foto.id}">
                    <div class="foto-preview">
                        <img src="${foto.ruta_archivo}" alt="Foto del punto" 
                             onclick="window.fotosManager.mostrarFotoCompleta('${escapedUrl}')">
                        <div class="foto-overlay">
                            <button class="btn-ver-foto" data-foto-url="${escapedUrl}">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${window.auth.currentUser?.rol === 'admin' ? `
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
            `;
        }).join('');

        contenedorFotos.innerHTML = fotosHTML;
    }

    mostrarModalSubirFoto() {
        if (!this.currentPuntoId) {
            Notifications.error('Selecciona un punto primero');
            return;
        }

        if (window.auth.currentUser?.rol !== 'admin') {
            Notifications.error('Solo los administradores pueden subir fotos');
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
            Notifications.error('Selecciona una foto');
            return;
        }

        formData.append('foto', inputFoto.files[0]);
        formData.append('punto_id', this.currentPuntoId);
        formData.append('descripcion', inputDescripcion.value || '');

        try {
            Loading.show();
            
            const response = await fetch(`${API_BASE_URL}/fotos/subir`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.auth.token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error subiendo foto');
            }

            Loading.hide();
            Notifications.success('Foto subida exitosamente');
            
            // Recargar fotos
            await this.mostrarModalFotos(this.currentPuntoId);
            
            // Cerrar modal
            this.cerrarModales();
            
        } catch (error) {
            Loading.hide();
            console.error('Error subiendo foto:', error);
            Notifications.error(error.message);
        }
    }

    async eliminarFoto(fotoId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
            return;
        }

        try {
            Loading.show();
            
            await API.delete(`/fotos/${fotoId}`);
            
            Loading.hide();
            Notifications.success('Foto eliminada exitosamente');
            
            // Recargar fotos
            await this.mostrarModalFotos(this.currentPuntoId);
            
        } catch (error) {
            Loading.hide();
            console.error('Error eliminando foto:', error);
            Notifications.error('Error eliminando foto');
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
            Notifications.error('Tipo de archivo no permitido. Solo JPG, PNG y HEIC');
            return;
        }

        // Validar tamaño (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            Notifications.error('El archivo es demasiado grande. Máximo 5MB');
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
        // Solo cerrar los modales específicos de fotos
        const modalesFotos = ['modalFotos', 'modalSubirFoto', 'modalFotoCompleta'];
        modalesFotos.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
            }
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
