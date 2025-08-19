// Aplicación principal

class App {
    constructor() {
        this.isInitialized = false;
        this.init();
    }
    
    init() {
        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.startApp();
            });
        } else {
            this.startApp();
        }
    }
    
    startApp() {
        if (this.isInitialized) return;
        
        console.log('🚀 Iniciando Mapa de Emergencias...');
        
        // Verificar que todos los componentes estén disponibles
        this.checkDependencies();
        
        // Inicializar componentes
        this.initializeComponents();
        
        // Configurar eventos globales
        this.setupGlobalEvents();
        
        // Mostrar mensaje de bienvenida
        this.showWelcomeMessage();
        
        this.isInitialized = true;
        console.log('✅ Aplicación iniciada correctamente');
    }
    
    checkDependencies() {
        const required = [
            'Notifications', 'Loading', 'Modal', 'API', 
            'Geolocation', 'Storage', 'Utils', 'Auth', 
            'MapManager', 'AdminManager', 'alertasManager'
        ];
        
        const missing = required.filter(dep => !window[dep]);
        
        if (missing.length > 0) {
            console.error('❌ Dependencias faltantes:', missing);
            throw new Error(`Dependencias faltantes: ${missing.join(', ')}`);
        }
    }
    
    initializeComponents() {
        // Los componentes ya se inicializan automáticamente en sus respectivos archivos
        // Aquí solo verificamos que estén disponibles
        
        if (!window.auth) {
            console.error('❌ Sistema de autenticación no disponible');
        }
        
        if (!window.mapManager) {
            console.error('❌ Gestor de mapa no disponible');
        }
        
        if (!window.adminManager) {
            console.error('❌ Gestor de administración no disponible');
        }
        
        if (!window.alertasManager) {
            console.error('❌ Gestor de alertas no disponible');
        }
    }
    
    setupGlobalEvents() {
        // Evento de error global
        window.addEventListener('error', (e) => {
            console.error('Error global:', e.error);
            Notifications.error('Ha ocurrido un error inesperado');
        });
        
        // Evento de error en promesas no manejadas
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promesa rechazada no manejada:', e.reason);
            Notifications.error('Error en operación asíncrona');
        });
        
        // Evento de conexión perdida
        window.addEventListener('offline', () => {
            Notifications.warning('Conexión a internet perdida');
        });
        
        window.addEventListener('online', () => {
            Notifications.success('Conexión a internet restaurada');
        });
        
        // Evento de cambio de tamaño de ventana
        window.addEventListener('resize', Utils.debounce(() => {
            if (window.mapManager && window.mapManager.map) {
                window.mapManager.map.invalidateSize();
            }
        }, 250));
        
        // Configurar toggle de sidebar en móvil
        this.setupMobileSidebar();
    }
    
    setupMobileSidebar() {
        const toggleBtn = document.getElementById('toggleSidebarBtn');
        const sidebar = document.getElementById('sidebar');
        
        if (!toggleBtn || !sidebar) return;
        
        // Mostrar botón solo en móvil
        const showToggleButton = () => {
            if (window.innerWidth <= 768) {
                toggleBtn.style.display = 'flex';
            } else {
                toggleBtn.style.display = 'none';
                sidebar.classList.remove('collapsed');
            }
        };
        
        // Mostrar/ocultar sidebar
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const icon = toggleBtn.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                icon.className = 'fas fa-bars';
                toggleBtn.title = 'Mostrar controles';
            } else {
                icon.className = 'fas fa-times';
                toggleBtn.title = 'Ocultar controles';
            }
        });
        
        // Configurar inicialmente
        showToggleButton();
        
        // Actualizar en resize
        window.addEventListener('resize', showToggleButton);
        
        // Evento de visibilidad de página
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Página vuelve a estar visible
                this.onPageVisible();
            }
        });
    }
    
    onPageVisible() {
        // Verificar token cuando la página vuelve a estar visible
        if (window.auth && window.auth.token) {
            window.auth.verifyToken();
        }
    }
    
    showWelcomeMessage() {
        // Mostrar mensaje de bienvenida solo si es la primera visita
        const hasVisited = Storage.get('hasVisited', false);
        
        if (!hasVisited) {
            setTimeout(() => {
                Notifications.info('¡Bienvenido al Mapa de Emergencias de Catamarca!', 8000);
                Storage.set('hasVisited', true);
            }, 2000);
        }
    }
    
    // Métodos de utilidad para la aplicación
    static getVersion() {
        return '1.0.0';
    }
    
    static getInfo() {
        return {
            name: 'Mapa de Emergencias - Catamarca',
            version: this.getVersion(),
            author: 'Federico Caffettaro',
            description: 'Sistema de mapeo interactivo para servicios de emergencia'
        };
    }
    
    static async checkHealth() {
        try {
            const response = await API.get('/categorias');
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                categories: response.categorias ? response.categorias.length : 0
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message
            };
        }
    }
    
    static async exportData() {
        try {
            const [categoriesResponse, pointsResponse] = await Promise.all([
                API.get('/categorias'),
                API.get('/puntos')
            ]);
            
            const data = {
                exportDate: new Date().toISOString(),
                categories: categoriesResponse.categorias || [],
                points: pointsResponse.puntos || []
            };
            
            // Crear archivo de descarga
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mapa-emergencias-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            Notifications.success('Datos exportados correctamente');
            
        } catch (error) {
            console.error('Error exportando datos:', error);
            Notifications.error('Error exportando datos');
        }
    }
    
    static async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Validar estructura del archivo
            if (!data.categories || !data.points) {
                throw new Error('Formato de archivo inválido');
            }
            
            // Aquí se implementaría la lógica de importación
            console.log('Datos a importar:', data);
            
            Notifications.info('Función de importación en desarrollo');
            
        } catch (error) {
            console.error('Error importando datos:', error);
            Notifications.error('Error importando datos: ' + error.message);
        }
    }
}

// Inicializar aplicación
const app = new App();

// Exportar para uso global
window.App = App;
window.app = app;

// Información de la aplicación
console.log('🗺️ Mapa de Emergencias - Catamarca');
console.log('Versión:', App.getVersion());
console.log('Autor:', App.getInfo().author);

// Función de ayuda para desarrollo
window.debugApp = () => {
    console.group('🔍 Debug de la Aplicación');
    console.log('Info:', App.getInfo());
    console.log('Auth:', window.auth ? 'Disponible' : 'No disponible');
    console.log('Map Manager:', window.mapManager ? 'Disponible' : 'No disponible');
    console.log('Admin Manager:', window.adminManager ? 'Disponible' : 'No disponible');
    console.log('Usuario autenticado:', window.auth ? window.auth.isAuthenticated() : false);
    console.log('Es admin:', window.auth ? window.auth.isAdmin() : false);
    console.log('Puntos en mapa:', window.mapManager ? window.mapManager.markers.length : 0);
    console.log('Categorías:', window.mapManager ? window.mapManager.categories.length : 0);
    console.groupEnd();
};

// Función para limpiar datos locales
window.clearAppData = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todos los datos locales?')) {
        Storage.clear();
        location.reload();
    }
};

// Función para verificar salud del sistema
window.checkAppHealth = async () => {
    const health = await App.checkHealth();
    console.log('Estado del sistema:', health);
    
    if (health.status === 'healthy') {
        Notifications.success('Sistema funcionando correctamente');
    } else {
        Notifications.error('Problemas detectados en el sistema');
    }
    
    return health;
};
