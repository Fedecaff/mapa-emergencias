import express from 'express';
import { perfilController, upload, handleMulterError } from '../controladores/perfilController.js';
import { verificarToken, verificarDisponibilidad } from '../middleware/autenticacion.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas de perfil (permiten a usuarios actualizar su propio perfil)
router.post('/:id/foto', verificarDisponibilidad, upload.single('foto'), handleMulterError, perfilController.subirFotoPerfil);
router.delete('/:id/foto', verificarDisponibilidad, perfilController.eliminarFotoPerfil);

export default router;
