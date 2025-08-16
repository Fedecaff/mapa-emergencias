import express from 'express';
import historialController from '../controladores/historialController.js';
import { verificarToken, verificarAdmin } from '../middleware/autenticacion.js';

const router = express.Router();

// Todas las rutas de historial requieren autenticación de administrador
router.use(verificarToken, verificarAdmin);

// Obtener historial general
router.get('/', historialController.obtenerHistorial);

// Obtener estadísticas del historial
router.get('/estadisticas', historialController.obtenerEstadisticas);

// Obtener historial de un registro específico
router.get('/:tabla/:registro_id', historialController.obtenerHistorialRegistro);

export default router;




