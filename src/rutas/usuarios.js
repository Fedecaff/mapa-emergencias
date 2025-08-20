import express from 'express';
import usuariosController from '../controladores/usuariosController.js';
import { verificarToken, verificarAdmin, verificarDisponibilidad } from '../middleware/autenticacion.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas que requieren permisos de administrador
router.post('/', verificarAdmin, usuariosController.crear);
router.get('/', verificarAdmin, usuariosController.listar);
router.get('/:id', verificarAdmin, usuariosController.obtener);
router.put('/:id', verificarAdmin, usuariosController.actualizar);
router.delete('/:id', verificarAdmin, usuariosController.eliminar);

// Rutas de disponibilidad (permiten a usuarios cambiar su propia disponibilidad)
router.put('/:id/disponibilidad', verificarDisponibilidad, usuariosController.cambiarDisponibilidad);
router.get('/disponibles', usuariosController.obtenerDisponibles);

export default router;


