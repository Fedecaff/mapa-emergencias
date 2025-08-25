import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import baseDeDatos from '../modelos/baseDeDatosPostgres.js';

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar almacenamiento de Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'perfiles_usuarios',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [
            { width: 300, height: 300, crop: 'fill' },
            { quality: 'auto' }
        ]
    }
});

// Configurar multer
const upload = multer({ storage: storage });

const perfilController = {

    async subirFotoPerfil(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar que el usuario existe
            const usuario = await baseDeDatos.obtenerUno(
                'SELECT id, foto_perfil FROM usuarios WHERE id = $1',
                [id]
            );

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Verificar que el usuario está actualizando su propio perfil o es admin
            if (parseInt(id) !== req.usuario.id && req.usuario.rol !== 'administrador') {
                return res.status(403).json({ error: 'No autorizado para actualizar este perfil' });
            }

            // Si ya tiene una foto, eliminarla de Cloudinary
            if (usuario.foto_perfil) {
                try {
                    const publicId = usuario.foto_perfil.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.log('⚠️ Error eliminando foto anterior:', error);
                }
            }

            // Subir nueva foto
            const resultado = await cloudinary.uploader.upload(req.file.path, {
                folder: 'perfiles_usuarios',
                transformation: [
                    { width: 300, height: 300, crop: 'fill' },
                    { quality: 'auto' }
                ]
            });

            // Actualizar URL en la base de datos
            await baseDeDatos.ejecutar(
                'UPDATE usuarios SET foto_perfil = $1 WHERE id = $2',
                [resultado.secure_url, id]
            );

            console.log(`✅ Foto de perfil subida para usuario ID: ${id}`);

            res.json({
                mensaje: 'Foto de perfil subida exitosamente',
                foto_url: resultado.secure_url
            });

        } catch (error) {
            console.error('❌ Error subiendo foto de perfil:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async eliminarFotoPerfil(req, res) {
        try {
            const { id } = req.params;

            // Verificar que el usuario existe
            const usuario = await baseDeDatos.obtenerUno(
                'SELECT id, foto_perfil FROM usuarios WHERE id = $1',
                [id]
            );

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Verificar que el usuario está eliminando su propia foto o es admin
            if (parseInt(id) !== req.usuario.id && req.usuario.rol !== 'administrador') {
                return res.status(403).json({ error: 'No autorizado para eliminar esta foto' });
            }

            if (!usuario.foto_perfil) {
                return res.status(400).json({ error: 'El usuario no tiene foto de perfil' });
            }

            // Eliminar de Cloudinary
            try {
                const publicId = usuario.foto_perfil.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.log('⚠️ Error eliminando foto de Cloudinary:', error);
            }

            // Actualizar base de datos
            await baseDeDatos.ejecutar(
                'UPDATE usuarios SET foto_perfil = NULL WHERE id = $1',
                [id]
            );

            console.log(`✅ Foto de perfil eliminada para usuario ID: ${id}`);

            res.json({
                mensaje: 'Foto de perfil eliminada exitosamente'
            });

        } catch (error) {
            console.error('❌ Error eliminando foto de perfil:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};

export { perfilController, upload };
