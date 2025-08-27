import express from 'express';
import alertasController from '../controladores/alertasController.js';
import { verificarToken, verificarAdmin } from '../middleware/autenticacion.js';
import whatsappService from '../servicios/whatsappService.js';

const router = express.Router();

// Rutas públicas (requieren autenticación)
router.post('/crear', verificarToken, alertasController.crear);
router.get('/listar', verificarToken, alertasController.listar);
router.get('/:id', verificarToken, alertasController.obtener);

// Rutas de administración (solo admins)
router.put('/:id/estado', verificarToken, verificarAdmin, alertasController.actualizarEstado);
router.delete('/:id', verificarToken, verificarAdmin, alertasController.eliminar);

// Verificar estado del servicio WhatsApp
router.get('/whatsapp/status', verificarToken, verificarAdmin, (req, res) => {
    try {
        const status = {
            isReady: whatsappService.isServiceReady(),
            isInitialized: whatsappService.isInitialized
        };
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: 'Error verificando estado de WhatsApp' });
    }
});

export default router;
