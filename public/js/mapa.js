// Sistema de mapa interactivo

class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.categories = [];
        this.currentLocation = null;
        this.userMarker = null;
        this.isAddingPoint = false;
        this.tempMarker = null;
        
        this.init();
    }
    
    init() {
        this.initMap();
        this.bindEvents();
        this.loadCategories();
        // Cargar puntos automáticamente sin necesidad de login
        this.loadPoints();
    }
    
    initMap() {
        // Coordenadas de Catamarca
        const catamarcaCoords = [-28.4691, -65.7795];
        
        // Crear mapa directamente
        this.map = L.map('map', {
            center: catamarcaCoords,
            zoom: 13,
            zoomControl: true
        });
        
        // Agregar capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);
        
        // Evento de clic en el mapa para agregar puntos (solo para admins)
        this.map.on('click', (e) => {
            if (this.isAddingPoint && window.auth.isAdmin()) {
                this.handleMapClick(e);
            }
        });
        
        // Forzar un refresh del mapa
        setTimeout(() => {
            if (this.map) {
                this.map.invalidateSize();
            }
        }, 500);
    }
    
    bindEvents() {
        // Botón de centrar en ubicación
        const centerLocationBtn = document.getElementById('centerLocationBtn');
        if (centerLocationBtn) {
            centerLocationBtn.addEventListener('click', () => {
                this.centerOnUserLocation();
            });
        }
        
        // Botón de pantalla completa
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
        
        // Botón de resetear vista
        const resetViewBtn = document.getElementById('resetViewBtn');
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => {
                this.resetView();
            });
        }
        
        // Búsqueda
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchPoints();
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchPoints();
                }
            });
        }
        
        // Filtros de categorías
        this.bindCategoryFilters();
        

        
        // Eventos de autenticación
        window.addEventListener('userLogin', () => {
            this.onUserLogin();
        });
        
        window.addEventListener('userLogout', () => {
            this.onUserLogout();
        });
        
        // Eventos del modal de edición
        const closeEditPointModal = document.getElementById('closeEditPointModal');
        const cancelEditPoint = document.getElementById('cancelEditPoint');
        const editPointForm = document.getElementById('editPointForm');
        const editPointCategory = document.getElementById('editPointCategory');
        
        if (closeEditPointModal) {
            closeEditPointModal.addEventListener('click', () => {
                Modal.hide('editPointModal');
            });
        }
        
        if (cancelEditPoint) {
            cancelEditPoint.addEventListener('click', () => {
                Modal.hide('editPointModal');
            });
        }
        
        if (editPointForm) {
            editPointForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditPoint();
            });
        }
        
        if (editPointCategory) {
            editPointCategory.addEventListener('change', (e) => {
                this.updateEditCustomFields(e.target.value);
            });
        }
    }
    
    bindCategoryFilters() {
        const categoryFiltersContainer = document.getElementById('categoryFilters');
        if (!categoryFiltersContainer) return;
        
        // Los filtros se crearán dinámicamente cuando se carguen las categorías
    }
    
    async loadCategories() {
        try {
            const response = await API.get('/categorias');
            this.categories = response.categorias || [];
            
            // Crear filtros de categorías
            this.createCategoryFilters();
            
            // Llenar select de categorías en el modal de agregar punto
            this.populateCategorySelect();
            
        } catch (error) {
            console.error('Error cargando categorías:', error);
            Notifications.error('Error cargando categorías');
        }
    }
    
    createCategoryFilters() {
        const container = document.getElementById('categoryFilters');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.categories.forEach(category => {
            const filterDiv = document.createElement('div');
            filterDiv.className = 'category-filter';
            filterDiv.innerHTML = `
                <input type="checkbox" id="filter_${category.id}" value="${category.id}">
                <label for="filter_${category.id}">
                    <i class="fas ${category.icono}" style="color: ${category.color}"></i>
                    ${category.nombre}
                </label>
            `;
            
            const checkbox = filterDiv.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => {
                this.filterMarkers();
            });
            
            container.appendChild(filterDiv);
        });
    }
    
    populateCategorySelect() {
        // Llenar select del modal de agregar punto
        const select = document.getElementById('pointCategory');
        if (select) {
            select.innerHTML = '<option value="">Seleccionar categoría</option>';
            
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.nombre;
                select.appendChild(option);
            });
        }
        
        // Llenar select del modal de editar punto
        const editSelect = document.getElementById('editPointCategory');
        if (editSelect) {
            editSelect.innerHTML = '<option value="">Seleccionar categoría</option>';
            
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.nombre;
                editSelect.appendChild(option);
            });
        }
    }
    
    async loadPoints(filters = {}) {
        try {
            Loading.show();
            
            let endpoint = '/puntos';
            const params = new URLSearchParams();
            
            if (filters.categoria_id) {
                params.append('categoria_id', filters.categoria_id);
            }
            
            if (filters.latitud && filters.longitud && filters.radio) {
                params.append('latitud', filters.latitud);
                params.append('longitud', filters.longitud);
                params.append('radio', filters.radio);
            }
            
            if (params.toString()) {
                endpoint += '?' + params.toString();
            }
            
            console.log('🔍 Cargando puntos con filtros:', filters);
            console.log('📡 Endpoint:', endpoint);
            
            const response = await API.get(endpoint);
            const points = response.puntos || [];
            
            console.log('📊 Puntos recibidos:', points.length);
            console.log('📍 Marcadores antes de limpiar:', this.markers.length);
            
            // Solo limpiar marcadores de puntos, no los de usuario o búsqueda
            this.clearPointMarkers();
            
            console.log('🗑️ Marcadores después de limpiar:', this.markers.length);
            
            this.addMarkers(points);
            
            console.log('✅ Marcadores después de agregar:', this.markers.length);
            
        } catch (error) {
            console.error('Error cargando puntos:', error);
            Notifications.error('Error cargando puntos');
        } finally {
            Loading.hide();
        }
    }
    
    addMarkers(points) {
        console.log('📍 Agregando marcadores:', points.length);
        points.forEach(point => {
            console.log('📍 Agregando punto:', point.nombre);
            this.addMarker(point);
        });
        console.log('✅ Marcadores agregados:', this.markers.length);
    }
    
    addMarker(point) {
        const category = this.categories.find(c => c.id === point.categoria_id);
        if (!category) return;
        
        // Crear icono personalizado
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<i class="fas ${category.icono}" style="color: ${category.color}; font-size: 20px;"></i>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        // Crear marcador
        const marker = L.marker([point.latitud, point.longitud], { icon })
            .addTo(this.map)
            .bindPopup(this.createPopupContent(point, category));
        
        // Guardar referencia al marcador
        marker.pointData = point;
        this.markers.push(marker);
    }
    
    createPopupContent(point, category) {
        const content = document.createElement('div');
        content.className = 'popup-content';
        
        let html = `
            <h3><i class="fas ${category.icono}" style="color: ${category.color}"></i> ${point.nombre}</h3>
            <p><strong>Categoría:</strong> ${category.nombre}</p>
        `;
        
        if (point.descripcion) {
            html += `<p><strong>Descripción:</strong> ${point.descripcion}</p>`;
        }
        
        // Agregar campos personalizados
        if (point.datos_personalizados && Object.keys(point.datos_personalizados).length > 0) {
            html += '<p><strong>Detalles:</strong></p><ul>';
            Object.entries(point.datos_personalizados).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    html += `<li><strong>${Utils.capitalize(key.replace(/_/g, ' '))}:</strong> ${value}</li>`;
                }
            });
            html += '</ul>';
        }
        
        html += `
            <div class="popup-actions">
                <button class="popup-btn" onclick="mapManager.showPointDetails(${point.id})">
                    <i class="fas fa-info-circle"></i> Ver detalles
                </button>
                <button class="btn-ver-fotos" data-punto-id="${point.id}">
                    <i class="fas fa-camera"></i> Ver Fotos
                </button>
        `;
        
        // Botones de administración (solo para admins)
        if (window.auth.isAdmin()) {
            html += `
                <button class="popup-btn" onclick="mapManager.editPoint(${point.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="popup-btn danger" onclick="mapManager.deletePoint(${point.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            `;
        }
        
        html += '</div>';
        
        content.innerHTML = html;
        return content;
    }
    
    clearMarkers() {
        console.log('🗑️ clearMarkers() ejecutado');
        console.log('📊 Marcadores a limpiar:', this.markers.length);
        
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
        
        // También limpiar marcadores de búsqueda y usuario
        if (this.searchMarker) {
            console.log('🔍 Limpiando searchMarker en clearMarkers()');
            this.map.removeLayer(this.searchMarker);
            this.searchMarker = null;
        }
        if (this.userMarker) {
            console.log('👤 Limpiando userMarker en clearMarkers()');
            this.map.removeLayer(this.userMarker);
            this.userMarker = null;
        }
        
        console.log('✅ clearMarkers() completado');
    }
    
    clearPointMarkers() {
        console.log('🗑️ Limpiando marcadores de puntos...');
        console.log('📊 Marcadores a limpiar:', this.markers.length);
        
        // Solo limpiar marcadores de puntos, mantener usuario y búsqueda
        this.markers.forEach(marker => {
            console.log('🗑️ Removiendo marcador:', marker.pointData?.nombre || 'Sin nombre');
            this.map.removeLayer(marker);
        });
        this.markers = [];
        
        console.log('✅ Limpieza de marcadores de puntos completada');
    }

    clearAllMarkers() {
        console.log('🗑️ Iniciando limpieza de marcadores...');
        console.log('📊 Marcadores antes de limpiar:', this.markers.length);
        
        // Limpiar todos los marcadores (puntos, usuario y búsqueda)
        this.clearMarkers();
        
        // Limpiar marcador de búsqueda
        if (this.searchMarker) {
            console.log('🔍 Limpiando marcador de búsqueda');
            this.map.removeLayer(this.searchMarker);
            this.searchMarker = null;
        }
        
        // Limpiar marcador del usuario
        if (this.userMarker) {
            console.log('👤 Limpiando marcador del usuario');
            this.map.removeLayer(this.userMarker);
            this.userMarker = null;
        }
        
        // Limpiar marcador temporal
        if (this.tempMarker) {
            console.log('⏰ Limpiando marcador temporal');
            this.map.removeLayer(this.tempMarker);
            this.tempMarker = null;
        }
        
        // Limpiar marcadores de alertas de emergencia
        if (window.alertasManager && window.alertasManager.emergencyMarker) {
            console.log('🚨 Limpiando marcador de emergencia');
            this.map.removeLayer(window.alertasManager.emergencyMarker);
            window.alertasManager.emergencyMarker = null;
        }
        
        // NO limpiar alertas activas - solo limpiar marcadores temporales
        this.map.eachLayer((layer) => {
            if (layer._icon && layer._icon.className && 
                layer._icon.className.includes('emergency-marker') && 
                !layer._icon.className.includes('emergency-marker-active')) {
                console.log('🚨 Limpiando marcador temporal de emergencia');
                this.map.removeLayer(layer);
            }
        });
        
        console.log('✅ Limpieza de marcadores completada');
    }
    
    filterMarkers() {
        const selectedCategories = Array.from(
            document.querySelectorAll('#categoryFilters input[type="checkbox"]:checked')
        ).map(cb => parseInt(cb.value));
        
        console.log('🔍 Categorías seleccionadas:', selectedCategories);
        
        this.markers.forEach(marker => {
            if (selectedCategories.includes(marker.pointData.categoria_id)) {
                marker.addTo(this.map);
            } else {
                this.map.removeLayer(marker);
            }
        });
        
        console.log('✅ Filtrado completado. Marcadores visibles:', this.markers.filter(m => this.map.hasLayer(m)).length);
    }
    
    async searchPoints() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();
        
        if (!query) {
            this.loadPoints();
            return;
        }
        
        try {
            Loading.show();
            
            // Buscar dirección usando Nominatim
            const searchResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Catamarca, Argentina')}&limit=1&addressdetails=1`
            );
            
            const searchData = await searchResponse.json();
            
            if (searchData.length === 0) {
                Notifications.error('No se encontró la dirección especificada');
                return;
            }
            
            const location = searchData[0];
            const lat = parseFloat(location.lat);
            const lon = parseFloat(location.lon);
            
            // Centrar mapa en la ubicación encontrada
            this.map.setView([lat, lon], 16);
            
            // Agregar marcador de búsqueda
            if (this.searchMarker) {
                this.map.removeLayer(this.searchMarker);
            }
            
            const searchIcon = L.divIcon({
                className: 'search-result-marker',
                html: '<i class="fas fa-search" style="color: #e74c3c; font-size: 20px;"></i>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            this.searchMarker = L.marker([lat, lon], { icon: searchIcon })
                .addTo(this.map)
                .bindPopup(`<b>Búsqueda:</b> ${location.display_name}`);
            
            // Cargar puntos cercanos a la ubicación encontrada
            this.loadPoints({
                latitud: lat,
                longitud: lon,
                radio: 7 // Radio fijo de 7km
            });
            
            Notifications.success(`Ubicación encontrada: ${location.display_name}`);
            
        } catch (error) {
            console.error('Error en búsqueda:', error);
            Notifications.error('Error en la búsqueda de direcciones');
        } finally {
            Loading.hide();
        }
    }
    
    async centerOnUserLocation() {
        try {
            Loading.show();
            Notifications.info('Obteniendo tu ubicación...');
            
            const position = await Geolocation.getCurrentPosition();
            this.currentLocation = position;
            
            console.log('📍 Ubicación del usuario:', position);
            
            // Crear o actualizar marcador de usuario
            if (this.userMarker) {
                this.map.removeLayer(this.userMarker);
            }
            
            const userIcon = L.divIcon({
                className: 'user-marker',
                html: '<i class="fas fa-user" style="color: #3498db; font-size: 20px;"></i>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            this.userMarker = L.marker([position.lat, position.lng], { icon: userIcon })
                .addTo(this.map)
                .bindPopup(`<b>Tu ubicación actual</b><br>Precisión: ±${Math.round(position.accuracy)}m`);
            
            // Centrar mapa en la ubicación del usuario
            this.map.setView([position.lat, position.lng], 16);
            
            // Obtener dirección
            try {
                const address = await Geolocation.reverseGeocode(position.lat, position.lng);
                this.updateLocationInfo(position, address);
            } catch (geocodeError) {
                console.warn('No se pudo obtener la dirección:', geocodeError);
                this.updateLocationInfo(position, 'Dirección no disponible');
            }
            
            // Cargar puntos cercanos (sin limpiar marcadores de búsqueda)
            this.loadPoints({
                latitud: position.lat,
                longitud: position.lng,
                radio: 7 // Radio fijo de 7km
            });
            
            Notifications.success(`Ubicación centrada (precisión: ±${Math.round(position.accuracy)}m)`);
            
        } catch (error) {
            console.error('Error obteniendo ubicación:', error);
            Notifications.error(error.message);
            
            // Si falla la geolocalización, centrar en Catamarca por defecto
            const catamarcaCoords = [-28.4691, -65.7795];
            this.map.setView(catamarcaCoords, 13);
            Notifications.info('Centrado en Catamarca por defecto');
        } finally {
            Loading.hide();
        }
    }
    
    updateLocationInfo(position, address) {
        const locationInfo = document.getElementById('locationInfo');
        if (locationInfo) {
            locationInfo.innerHTML = `
                <p><strong>Latitud:</strong> ${position.lat.toFixed(6)}</p>
                <p><strong>Longitud:</strong> ${position.lng.toFixed(6)}</p>
                <p><strong>Precisión:</strong> ±${Math.round(position.accuracy)}m</p>
                <p><strong>Dirección:</strong> ${address}</p>
            `;
        }
    }
    
    toggleFullscreen() {
        const mapContainer = document.querySelector('.map-container');
        
        if (!document.fullscreenElement) {
            mapContainer.requestFullscreen().catch(err => {
                console.error('Error entrando en pantalla completa:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    resetView() {
        const catamarcaCoords = [-28.4691, -65.7795];
        this.map.setView(catamarcaCoords, 13);
    }
    
    // Métodos para administración de puntos
    startAddingPoint() {
        if (!window.auth.isAdmin()) {
            Notifications.error('Solo los administradores pueden agregar puntos');
            return;
        }
        
        this.isAddingPoint = true;
        Notifications.info('Haz clic en el mapa para agregar un punto');
        
        // Cambiar cursor del mapa
        this.map.getContainer().style.cursor = 'crosshair';
    }
    
    stopAddingPoint() {
        this.isAddingPoint = false;
        this.map.getContainer().style.cursor = '';
        
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
            this.tempMarker = null;
        }
    }
    
    handleMapClick(e) {
        if (!this.isAddingPoint) return;
        
        const { lat, lng } = e.latlng;
        
        // Crear marcador temporal
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
        }
        
        this.tempMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'temp-marker',
                html: '<i class="fas fa-map-marker-alt" style="color: #e74c3c; font-size: 20px;"></i>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(this.map);
        
        // Llenar coordenadas en el formulario
        document.getElementById('pointLat').value = lat.toFixed(6);
        document.getElementById('pointLng').value = lng.toFixed(6);
        
        // Mostrar modal de agregar punto
        Modal.show('addPointModal');
    }
    
    async showPointDetails(pointId) {
        try {
            Loading.show();
            
            const response = await API.get(`/puntos/${pointId}`);
            const point = response.punto;
            const category = this.categories.find(c => c.id === point.categoria_id);
            
            // Llenar modal de detalles
            document.getElementById('pointDetailsTitle').textContent = point.nombre;
            
            const content = document.getElementById('pointDetailsContent');
            content.innerHTML = this.createDetailsContent(point, category);
            
            // Configurar botones de acción
            const actions = document.getElementById('pointDetailsActions');
            actions.innerHTML = '';
            
            if (window.auth.isAdmin()) {
                actions.innerHTML = `
                    <button class="btn-secondary" onclick="Modal.hide('pointDetailsModal')">Cerrar</button>
                    <button class="btn-primary" onclick="mapManager.editPoint(${point.id})">Editar</button>
                    <button class="btn-primary danger" onclick="mapManager.deletePoint(${point.id})">Eliminar</button>
                `;
            } else {
                actions.innerHTML = `
                    <button class="btn-secondary" onclick="Modal.hide('pointDetailsModal')">Cerrar</button>
                `;
            }
            
            Modal.show('pointDetailsModal');
            
        } catch (error) {
            console.error('Error cargando detalles del punto:', error);
            Notifications.error('Error cargando detalles del punto');
        } finally {
            Loading.hide();
        }
    }
    
    createDetailsContent(point, category) {
        let html = `
            <div class="point-detail">
                <h4>Información General</h4>
                <p><strong>Nombre:</strong> ${point.nombre}</p>
                <p><strong>Categoría:</strong> ${category ? category.nombre : 'N/A'}</p>
                <p><strong>Descripción:</strong> ${point.descripcion || 'Sin descripción'}</p>
                <p><strong>Coordenadas:</strong> ${point.latitud}, ${point.longitud}</p>
                <p><strong>Estado:</strong> ${Utils.capitalize(point.estado)}</p>
                <p><strong>Fecha de creación:</strong> ${Utils.formatDate(point.fecha_creacion)}</p>
            </div>
        `;
        
        // Campos personalizados
        if (point.datos_personalizados && Object.keys(point.datos_personalizados).length > 0) {
            html += '<div class="point-detail"><h4>Detalles Específicos</h4>';
            Object.entries(point.datos_personalizados).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    html += `<p><strong>${Utils.capitalize(key.replace(/_/g, ' '))}:</strong> ${value}</p>`;
                }
            });
            html += '</div>';
        }
        
        return html;
    }
    
    async editPoint(pointId) {
        if (!window.auth.isAdmin()) {
            Notifications.error('Solo los administradores pueden editar puntos');
            return;
        }
        
        try {
            Loading.show();
            
            // Obtener datos del punto
            const response = await API.get(`/puntos/${pointId}`);
            const point = response.punto;
            
            if (!point) {
                Notifications.error('Punto no encontrado');
                return;
            }
            
            // Llenar el formulario de edición
            this.fillEditForm(point);
            
            // Mostrar modal de edición
            Modal.show('editPointModal');
            
        } catch (error) {
            console.error('Error cargando punto para editar:', error);
            Notifications.error('Error cargando punto para editar');
        } finally {
            Loading.hide();
        }
    }
    
    fillEditForm(point) {
        // Llenar campos básicos
        document.getElementById('editPointId').value = point.id;
        document.getElementById('editPointName').value = point.nombre;
        document.getElementById('editPointDescription').value = point.descripcion || '';
        document.getElementById('editPointLat').value = point.latitud;
        document.getElementById('editPointLng').value = point.longitud;
        document.getElementById('editPointStatus').value = point.estado || 'activo';
        
        // Llenar categoría
        const categorySelect = document.getElementById('editPointCategory');
        categorySelect.value = point.categoria_id;
        
        // Actualizar campos personalizados
        this.updateEditCustomFields(point.categoria_id, point.datos_personalizados);
    }
    
    updateEditCustomFields(categoryId, existingData = {}) {
        const customFieldsContainer = document.getElementById('editCustomFields');
        const category = this.categories.find(c => c.id === categoryId);
        
        if (!category || !category.campos_personalizados) {
            customFieldsContainer.innerHTML = '';
            return;
        }
        
        // Parsear datos existentes si es string
        let parsedExistingData = existingData;
        if (typeof existingData === 'string') {
            try {
                parsedExistingData = JSON.parse(existingData);
            } catch (error) {
                console.warn('Error parseando datos personalizados:', error);
                parsedExistingData = {};
            }
        }
        
        // Parsear campos personalizados de la categoría
        let campos;
        try {
            campos = typeof category.campos_personalizados === 'string' 
                ? JSON.parse(category.campos_personalizados)
                : category.campos_personalizados;
        } catch (error) {
            console.warn('Error parseando campos personalizados de categoría:', error);
            customFieldsContainer.innerHTML = '';
            return;
        }
        
        let html = '';
        Object.entries(campos).forEach(([key, config]) => {
            const value = parsedExistingData[key] || '';
            html += this.createCustomField(key, config, value, 'edit');
        });
        
        customFieldsContainer.innerHTML = html;
    }
    
    createCustomField(key, config, value = '', prefix = '') {
        const fieldName = prefix ? `${prefix}${key.charAt(0).toUpperCase() + key.slice(1)}` : key;
        const fieldId = prefix ? `${prefix}${key.charAt(0).toUpperCase() + key.slice(1)}` : key;
        
        let html = `<div class="form-group">`;
        html += `<label for="${fieldId}">${Utils.capitalize(key.replace(/_/g, ' '))}:</label>`;
        
        if (config.tipo === 'select' && config.opciones) {
            html += `<select id="${fieldId}" name="${key}" ${config.requerido ? 'required' : ''}>`;
            html += `<option value="">Seleccionar...</option>`;
            config.opciones.forEach(opcion => {
                const selected = value === opcion ? 'selected' : '';
                html += `<option value="${opcion}" ${selected}>${opcion}</option>`;
            });
            html += `</select>`;
        } else if (config.tipo === 'textarea') {
            html += `<textarea id="${fieldId}" name="${key}" rows="3" ${config.requerido ? 'required' : ''}>${value}</textarea>`;
        } else {
            const inputType = config.tipo === 'number' ? 'number' : 'text';
            const step = config.tipo === 'number' ? 'step="any"' : '';
            html += `<input type="${inputType}" id="${fieldId}" name="${key}" value="${value}" ${step} ${config.requerido ? 'required' : ''}>`;
        }
        
        html += `</div>`;
        return html;
    }
    
    async deletePoint(pointId) {
        if (!window.auth.isAdmin()) {
            Notifications.error('Solo los administradores pueden eliminar puntos');
            return;
        }
        
        if (!confirm('¿Estás seguro de que quieres eliminar este punto?')) {
            return;
        }
        
        try {
            Loading.show();
            
            await API.delete(`/puntos/${pointId}`);
            
            // Remover marcador del mapa
            const marker = this.markers.find(m => m.pointData.id === pointId);
            if (marker) {
                this.map.removeLayer(marker);
                this.markers = this.markers.filter(m => m !== marker);
            }
            
            Modal.hide('pointDetailsModal');
            Notifications.success('Punto eliminado exitosamente');
            
        } catch (error) {
            console.error('Error eliminando punto:', error);
            Notifications.error('Error eliminando punto');
        } finally {
            Loading.hide();
        }
    }
    
    onUserLogin() {
        // Recargar puntos cuando el usuario se loguea
        this.loadPoints();
    }
    
    onUserLogout() {
        // Limpiar marcadores temporales y resetear estado
        this.stopAddingPoint();
        // NO cargar puntos cuando el usuario hace logout
        console.log('🚫 Usuario hizo logout - no cargando puntos');
    }
    
    async handleEditPoint() {
        try {
            Loading.show();
            
            const form = document.getElementById('editPointForm');
            const formData = new FormData(form);
            
            // Obtener datos del formulario
            const pointId = formData.get('id');
            const nombre = formData.get('nombre');
            const descripcion = formData.get('descripcion');
            const latitud = parseFloat(formData.get('latitud'));
            const longitud = parseFloat(formData.get('longitud'));
            const categoria_id = parseInt(formData.get('categoria_id'));
            const estado = formData.get('estado');
            
            // Validaciones básicas
            if (!nombre || !latitud || !longitud || !categoria_id) {
                Notifications.error('Por favor completa todos los campos requeridos');
                return;
            }
            
            // Obtener campos personalizados
            const datos_personalizados = {};
            const category = this.categories.find(c => c.id === categoria_id);
            
            if (category && category.campos_personalizados) {
                // Parsear campos personalizados de la categoría
                let campos;
                try {
                    campos = typeof category.campos_personalizados === 'string' 
                        ? JSON.parse(category.campos_personalizados)
                        : category.campos_personalizados;
                } catch (error) {
                    console.warn('Error parseando campos personalizados de categoría:', error);
                    campos = {};
                }
                
                Object.keys(campos).forEach(key => {
                    const value = formData.get(key);
                    if (value !== null && value !== '') {
                        datos_personalizados[key] = value;
                    }
                });
            }
            
            // Preparar datos para actualizar
            const updateData = {
                nombre,
                descripcion,
                latitud,
                longitud,
                categoria_id,
                estado,
                datos_personalizados
            };
            
            // Enviar actualización al servidor
            await API.put(`/puntos/${pointId}`, updateData);
            
            // Cerrar modal
            Modal.hide('editPointModal');
            
            // Recargar puntos para actualizar el mapa
            await this.loadPoints();
            
            Notifications.success('Punto actualizado exitosamente');
            
        } catch (error) {
            console.error('Error actualizando punto:', error);
            Notifications.error('Error actualizando punto');
        } finally {
            Loading.hide();
        }
    }
}

// Inicializar mapa cuando el DOM esté listo y Leaflet esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que Leaflet esté disponible
    if (typeof L !== 'undefined') {
        window.mapManager = new MapManager();
    } else {
        // Esperar a que Leaflet se cargue
        const checkLeaflet = setInterval(() => {
            if (typeof L !== 'undefined') {
                clearInterval(checkLeaflet);
                window.mapManager = new MapManager();
            }
        }, 100);
        
        // Timeout de seguridad
        setTimeout(() => {
            clearInterval(checkLeaflet);
            if (typeof L === 'undefined') {
                console.error('❌ Leaflet no se pudo cargar');
                Notifications.error('Error cargando el mapa. Por favor recarga la página.');
            }
        }, 5000);
    }
});

// Exportar para uso global
window.MapManager = MapManager;
