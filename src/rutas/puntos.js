import express from 'express';
import puntosController from '../controladores/puntosController.js';
import { verificarToken, verificarAdmin, autenticacionOpcional } from '../middleware/autenticacion.js';

const router = express.Router();

// Rutas públicas (con autenticación opcional)
router.get('/', autenticacionOpcional, puntosController.obtenerTodos);
router.get('/buscar', autenticacionOpcional, puntosController.buscar);
router.get('/cercanos', autenticacionOpcional, puntosController.obtenerCercanos);
router.get('/:id', autenticacionOpcional, puntosController.obtenerPorId);

// Rutas de administrador
router.post('/', verificarToken, verificarAdmin, puntosController.crear);
router.put('/:id', verificarToken, verificarAdmin, puntosController.actualizar);
router.delete('/:id', verificarToken, verificarAdmin, puntosController.eliminar);

export default router;
