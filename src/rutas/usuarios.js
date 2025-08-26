import express from 'express';
import usuariosController from '../controladores/usuariosController.js';
import { verificarToken, verificarAdmin, verificarDisponibilidad } from '../middleware/autenticacion.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas específicas (deben ir ANTES de las rutas con parámetros)
router.get('/operadores-ubicacion', verificarAdmin, usuariosController.obtenerOperadoresConUbicacion);
router.get('/disponibles', usuariosController.obtenerDisponibles);
router.get('/instituciones', usuariosController.obtenerInstituciones);
router.get('/roles-institucion', usuariosController.obtenerRolesInstitucion);

// Rutas que requieren permisos de administrador
router.post('/', verificarAdmin, usuariosController.crear);
router.get('/', verificarAdmin, usuariosController.listar);
router.get('/:id', verificarAdmin, usuariosController.obtener);
router.put('/:id', verificarAdmin, usuariosController.actualizar);
router.delete('/:id', verificarAdmin, usuariosController.eliminar);

// Rutas de disponibilidad (permiten a usuarios cambiar su propia disponibilidad)
router.put('/:id/disponibilidad', verificarDisponibilidad, usuariosController.cambiarDisponibilidad);

// Rutas de perfil (permiten a usuarios actualizar su propio perfil)
router.put('/:id/perfil', verificarDisponibilidad, usuariosController.actualizarPerfil);

// Rutas de geolocalización
router.put('/:id/ubicacion', verificarDisponibilidad, usuariosController.actualizarUbicacion);

export default router;


