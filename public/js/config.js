// Configuración de la aplicación
const CONFIG = {
    // URL de la API - usar servidor local por ahora
    API_URL: 'http://localhost:8080/api',
    
    // Configuración del mapa
    MAP_CONFIG: {
        center: [-28.4691, -65.7795], // Catamarca
        zoom: 13,
        maxZoom: 19
    },
    
    // Configuración de la aplicación
    APP_CONFIG: {
        name: 'Mapa de Emergencias',
        version: '1.0.0',
        author: 'Federico Caffettaro'
    }
};

// Exportar configuración
window.CONFIG = CONFIG;
