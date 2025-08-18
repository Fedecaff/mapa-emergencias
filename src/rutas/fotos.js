import express from 'express';
import multer from 'multer';
import fotosController from '../controladores/fotosController.js';
import { verificarToken, verificarAdmin } from '../middleware/autenticacion.js';
import path from 'path';
import os from 'os';

const router = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Usar directorio temporal del sistema
        cb(null, os.tmpdir());
    },
    filename: function (req, file, cb) {
        // Generar nombre único temporal
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    },
    fileFilter: function (req, file, cb) {
        // Validar tipos de archivo
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
});

// Rutas públicas (solo ver fotos)
router.get('/punto/:punto_id', fotosController.obtenerFotosPunto);

// Rutas protegidas (solo administradores)
router.post('/subir', verificarToken, verificarAdmin, upload.single('foto'), fotosController.subirFoto);
router.delete('/:id', verificarToken, verificarAdmin, fotosController.eliminarFoto);
router.get('/todas', verificarToken, verificarAdmin, fotosController.obtenerTodasFotos);

export default router;
