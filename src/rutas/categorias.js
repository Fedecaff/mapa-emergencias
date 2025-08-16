import express from 'express';
import categoriasController from '../controladores/categoriasController.js';
import { verificarToken, verificarAdmin, autenticacionOpcional } from '../middleware/autenticacion.js';

const router = express.Router();

// Rutas públicas (con autenticación opcional)
router.get('/', autenticacionOpcional, categoriasController.obtenerTodas);
router.get('/:id', autenticacionOpcional, categoriasController.obtenerPorId);

// Rutas de administrador
router.post('/', verificarToken, verificarAdmin, categoriasController.crear);
router.put('/:id', verificarToken, verificarAdmin, categoriasController.actualizar);
router.delete('/:id', verificarToken, verificarAdmin, categoriasController.eliminar);

export default router;
