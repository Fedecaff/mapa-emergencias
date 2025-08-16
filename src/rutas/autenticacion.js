import express from 'express';
import autenticacionController from '../controladores/autenticacionController.js';
import { verificarToken, verificarAdmin } from '../middleware/autenticacion.js';

const router = express.Router();

// Rutas públicas
router.post('/login', autenticacionController.login);
router.post('/verificar-token', autenticacionController.verificarToken);

// Rutas protegidas
router.get('/perfil', verificarToken, autenticacionController.obtenerPerfil);

// Rutas de administrador
router.post('/registro', verificarToken, verificarAdmin, autenticacionController.registro);

export default router;
