// Configuración de la aplicación
const CONFIG = {
    // URL de la API - detectar automáticamente el entorno
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:8080/api' 
        : `${window.location.protocol}//${window.location.host}/api`,
    
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
