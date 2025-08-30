import express from 'express';
import alertasController from '../controladores/alertasController.js';
import { verificarToken, verificarAdmin } from '../middleware/autenticacion.js';

const router = express.Router();

// Ruta de prueba temporal
router.get('/test', (req, res) => {
    console.log('🧪 === PRUEBA ENDPOINT ALERTAS ===');
    res.json({ mensaje: 'Endpoint de alertas funcionando correctamente' });
});

// Rutas públicas (requieren autenticación)
router.post('/crear', verificarToken, alertasController.crear);
router.get('/listar', verificarToken, alertasController.listar);
router.get('/:id', verificarToken, alertasController.obtener);

// Rutas de administración (solo admins)
router.put('/:id/estado', verificarToken, verificarAdmin, alertasController.actualizarEstado);
router.delete('/:id', verificarToken, verificarAdmin, alertasController.eliminar);

export default router;
