import express from 'express';
import usuariosController from '../controladores/usuariosController.js';
import { verificarToken, verificarAdmin } from '../middleware/autenticacion.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(verificarToken);
router.use(verificarAdmin);

// Crear usuario
router.post('/', usuariosController.crear);

// Listar usuarios
router.get('/', usuariosController.listar);

// Obtener usuario específico
router.get('/:id', usuariosController.obtener);
router.put('/:id/disponibilidad', usuariosController.cambiarDisponibilidad);
router.get('/disponibles', usuariosController.obtenerDisponibles);

// Actualizar usuario
router.put('/:id', usuariosController.actualizar);

// Eliminar usuario
router.delete('/:id', usuariosController.eliminar);

export default router;


