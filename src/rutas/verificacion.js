import express from 'express';
import verificacionController from '../controladores/verificacionController.js';

const router = express.Router();

// Enviar código de verificación
router.post('/enviar-codigo', verificacionController.enviarCodigo);

// Verificar código
router.post('/verificar-codigo', verificacionController.verificarCodigo);

// Verificar estado de email
router.get('/verificar-estado', verificacionController.verificarEstado);

export default router;
