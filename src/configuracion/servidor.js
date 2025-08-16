import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rutas
import rutasAutenticacion from '../rutas/autenticacion.js';
import rutasPuntos from '../rutas/puntos.js';
import rutasCategorias from '../rutas/categorias.js';
import rutasHistorial from '../rutas/historial.js';
import rutasUsuarios from '../rutas/usuarios.js';

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
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// Rutas API
app.use('/api/autenticacion', rutasAutenticacion);
app.use('/api/puntos', rutasPuntos);
app.use('/api/categorias', rutasCategorias);
app.use('/api/historial', rutasHistorial);
app.use('/api/usuarios', rutasUsuarios);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        mensaje: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
});

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PUERTO, () => {
    console.log(`🚀 Servidor iniciado en puerto ${PUERTO}`);
    console.log(`📱 Aplicación disponible en: http://localhost:${PUERTO}`);
});

export default app;
