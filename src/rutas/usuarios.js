import express from 'express';
import multer from 'multer';
import usuariosController from '../controladores/usuariosController.js';
import { verificarToken, verificarAdmin, verificarDisponibilidad } from '../middleware/autenticacion.js';

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 10MB.' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Demasiados archivos. Solo se permite 1 archivo.' });
        }
        return res.status(400).json({ error: 'Error al procesar el archivo' });
    }
    
    if (error.message.includes('Solo se permiten archivos de imagen')) {
        return res.status(400).json({ error: 'Solo se permiten archivos de imagen (JPG, PNG, GIF, etc.)' });
    }
    
    console.error('❌ Error no manejado de multer:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
};

// Configuración de multer para subida de archivos
const upload = multer({ 
    storage: multer.memoryStorage(), // Usar memoria en lugar de disco
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB máximo
    },
    fileFilter: function (req, file, cb) {
        // Solo permitir imágenes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
});

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
router.get('/verificar-email', verificarAdmin, usuariosController.verificarEmail);
router.get('/:id', verificarAdmin, usuariosController.obtener);
router.put('/:id', verificarAdmin, usuariosController.actualizar);
router.delete('/:id', verificarAdmin, usuariosController.eliminar);

// Rutas de disponibilidad (permiten a usuarios cambiar su propia disponibilidad)
router.put('/:id/disponibilidad', verificarDisponibilidad, usuariosController.cambiarDisponibilidad);

// Rutas de perfil (permiten a usuarios actualizar su propio perfil)
router.put('/:id/perfil', verificarDisponibilidad, usuariosController.actualizarPerfil);

// Rutas de fotos de perfil
router.post('/:id/foto', verificarDisponibilidad, upload.single('foto'), handleMulterError, (req, res, next) => {
    // Verificar que se subió un archivo
    if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }
    
    console.log('✅ Archivo procesado correctamente por multer:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
    });
    next();
}, usuariosController.subirFotoPerfil);
router.delete('/:id/foto', verificarDisponibilidad, usuariosController.eliminarFotoPerfil);

// Rutas de geolocalización
router.put('/:id/ubicacion', verificarDisponibilidad, usuariosController.actualizarUbicacion);

export default router;

