// Script de prueba para el sistema de alertas
console.log('🧪 Iniciando pruebas del sistema de alertas...');

// Función para verificar elementos del DOM
function verificarElementosDOM() {
    console.log('🔍 Verificando elementos del DOM...');
    
    const elementos = [
        'emergencyBtn',
        'modalConfirmacionEmergencia',
        'modalFormularioEmergencia',
        'formEmergencia',
        'confirmarEmergenciaBtn'
    ];
    
    elementos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            console.log(`✅ ${id}: Encontrado`);
        } else {
            console.error(`❌ ${id}: NO encontrado`);
        }
    });
}

// Función para verificar componentes JavaScript
function verificarComponentes() {
    console.log('🔍 Verificando componentes JavaScript...');
    
    const componentes = [
        'alertasManager',
        'auth',
        'mapManager',
        'Notifications',
        'Modal',
        'API'
    ];
    
    componentes.forEach(comp => {
        if (window[comp]) {
            console.log(`✅ ${comp}: Disponible`);
        } else {
            console.error(`❌ ${comp}: NO disponible`);
        }
    });
}

// Función para verificar estilos CSS
function verificarEstilos() {
    console.log('🔍 Verificando estilos CSS...');
    
    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) {
        const styles = window.getComputedStyle(emergencyBtn);
        console.log('📊 Estilos del botón de emergencia:');
        console.log('- Background:', styles.background);
        console.log('- Color:', styles.color);
        console.log('- Display:', styles.display);
        console.log('- Visibility:', styles.visibility);
    }
}

// Función para simular clic en botón de emergencia
function simularClicEmergencia() {
    console.log('🎯 Simulando clic en botón de emergencia...');
    
    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) {
        emergencyBtn.click();
        console.log('✅ Clic simulado');
    } else {
        console.error('❌ No se pudo simular clic - botón no encontrado');
    }
}

// Ejecutar pruebas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM listo, ejecutando pruebas...');
    
    // Esperar un poco para que todos los componentes se inicialicen
    setTimeout(() => {
        verificarElementosDOM();
        verificarComponentes();
        verificarEstilos();
        
        // Simular clic después de 2 segundos
        setTimeout(() => {
            simularClicEmergencia();
        }, 2000);
        
    }, 1000);
});

// Función para ejecutar manualmente desde la consola
window.testAlertas = {
    verificarElementosDOM,
    verificarComponentes,
    verificarEstilos,
    simularClicEmergencia
};

console.log('🧪 Script de prueba cargado. Usa window.testAlertas para ejecutar pruebas manualmente.');
