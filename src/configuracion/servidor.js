import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar base de datos
import baseDeDatos from '../modelos/baseDeDatosPostgres.js';
import actualizarTablaFotos from '../modelos/actualizarTablaFotos.js';
import actualizarUsuarios from '../modelos/actualizarUsuarios.js';
import actualizarTablaAlertas from '../modelos/actualizarTablaAlertas.js';
import verificarFotos from '../modelos/verificarFotos.js';
import diagnosticarBaseDeDatos from '../modelos/diagnosticoDB.js';
import actualizarRoles from '../modelos/actualizarRoles.js';
import verificarRoles from '../modelos/verificarRoles.js';
import actualizarPerfilOperadores from '../modelos/actualizarPerfilOperadores.js';
import actualizarGeolocalizacion from '../modelos/actualizarGeolocalizacion.js';

// Importar rutas
import rutasAutenticacion from '../rutas/autenticacion.js';
import rutasPuntos from '../rutas/puntos.js';
import rutasCategorias from '../rutas/categorias.js';
import rutasHistorial from '../rutas/historial.js';
import rutasUsuarios from '../rutas/usuarios.js';
import rutasFotos from '../rutas/fotos.js';
import rutasAlertas from '../rutas/alertas.js';
import rutasPerfil from '../rutas/perfil.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PUERTO = process.env.PUERTO || 8080;

// Configuración de seguridad
app.use(helmet({
            contentSecurityPolicy: false
}));

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '../../public')));

// Middleware para JSON - solo para rutas que no sean de archivos
app.use((req, res, next) => {
    // Si es una ruta de subida de archivos, saltar el parsing de JSON
    if (req.path.includes('/foto') && req.method === 'POST') {
        return next();
    }
    
    // Para otras rutas, usar el parsing de JSON
    express.json({ limit: '10mb' })(req, res, next);
});

// Middleware para URL encoded - solo para rutas que no sean de archivos
app.use((req, res, next) => {
    // Si es una ruta de subida de archivos, saltar el parsing de URL encoded
    if (req.path.includes('/foto') && req.method === 'POST') {
        return next();
    }
    
    // Para otras rutas, usar el parsing de URL encoded
    express.urlencoded({ limit: '10mb', extended: true })(req, res, next);
});

// Rutas API
app.use('/api/autenticacion', rutasAutenticacion);
app.use('/api/puntos', rutasPuntos);
app.use('/api/categorias', rutasCategorias);
app.use('/api/historial', rutasHistorial);
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/fotos', rutasFotos);
app.use('/api/alertas', rutasAlertas);
app.use('/api/perfil', rutasPerfil);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    
    // Manejo específico para archivos demasiado grandes
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ 
            error: 'Archivo demasiado grande',
            mensaje: 'El archivo excede el tamaño máximo permitido (10MB)'
        });
    }
    
    res.status(500).json({ 
        error: 'Error interno del servidor',
        mensaje: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
});

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Inicializar base de datos y servidor
async function iniciarServidor() {
    try {
        // Inicializar base de datos
        console.log('🗄️ Inicializando base de datos...');
        await baseDeDatos.inicializarTablas();
        await baseDeDatos.insertarDatosIniciales();
        await actualizarTablaFotos();
        await actualizarUsuarios();
        await actualizarTablaAlertas();
        // await verificarFotos(); // Comentado temporalmente para evitar colgadas
        
        // Ejecutar diagnóstico de base de datos (comentado temporalmente)
        // console.log('\n🔍 Ejecutando diagnóstico de base de datos...');
        // await diagnosticarBaseDeDatos();
        // await actualizarRoles();
        // await verificarRoles();
        await actualizarPerfilOperadores();
        await actualizarGeolocalizacion();
        
        console.log('✅ Base de datos inicializada correctamente');
        
        // Iniciar servidor
        app.listen(PUERTO, '0.0.0.0', () => {
            console.log(`🚀 Servidor iniciado en puerto ${PUERTO}`);
            console.log(`📱 Aplicación disponible en: http://localhost:${PUERTO}`);
        });
    } catch (error) {
        console.error('❌ Error inicializando servidor:', error);
        process.exit(1);
    }
}

iniciarServidor();

export default app;
