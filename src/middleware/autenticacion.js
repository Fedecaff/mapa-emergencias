import jwt from 'jsonwebtoken';
import baseDeDatos from '../modelos/baseDeDatosPostgres.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mapa-emergencias-secret-key';

// Middleware para verificar token JWT
export const verificarToken = async (req, res, next) => {
    try {
        console.log('🔐 === INICIO VERIFICACIÓN TOKEN ===');
        console.log('📤 Ruta:', req.path);
        console.log('📤 Método:', req.method);
        console.log('📤 Headers:', req.headers.authorization ? 'Presente' : 'Ausente');
        
        const token = req.headers.authorization?.split(' ')[1];
        console.log('🔑 Token extraído:', token ? token.substring(0, 20) + '...' : 'null');

        if (!token) {
            console.log('❌ No se proporcionó token');
            return res.status(401).json({
                error: 'Token no proporcionado'
            });
        }

        console.log('🔍 Verificando JWT...');
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ JWT verificado, ID usuario:', decoded.id);
        
        console.log('🔍 Buscando usuario en BD...');
        // Buscar usuario en base de datos
        const usuario = await baseDeDatos.obtenerUno(
            'SELECT id, email, nombre, rol FROM usuarios WHERE id = $1',
            [decoded.id]
        );

        if (!usuario) {
            console.log('❌ Usuario no encontrado en BD');
            return res.status(401).json({
                error: 'Token inválido'
            });
        }

        console.log('✅ Usuario encontrado:', usuario.nombre);
        // Agregar usuario al request
        req.usuario = usuario;
        console.log('🔐 === FIN VERIFICACIÓN TOKEN ===');
        next();

    } catch (error) {
        console.error('❌ Error verificando token:', error);
        console.error('📊 Stack trace:', error.stack);
        res.status(401).json({
            error: 'Token inválido'
        });
    }
};

// Middleware para verificar si es administrador
export const verificarAdmin = (req, res, next) => {
    if (!req.usuario) {
        return res.status(401).json({
            error: 'Usuario no autenticado'
        });
    }

    if (req.usuario.rol !== 'administrador') {
        return res.status(403).json({
            error: 'Acceso denegado. Se requieren permisos de administrador'
        });
    }

    next();
};

// Middleware para verificar permisos de disponibilidad
export const verificarDisponibilidad = (req, res, next) => {
    if (!req.usuario) {
        return res.status(401).json({
            error: 'Usuario no autenticado'
        });
    }

    const userId = parseInt(req.params.id);
    
    // Permitir si es administrador o si está cambiando su propia disponibilidad
    if (req.usuario.rol === 'administrador' || req.usuario.id === userId) {
        next();
    } else {
        return res.status(403).json({
            error: 'Acceso denegado. Solo puedes cambiar tu propia disponibilidad'
        });
    }
};

// Middleware opcional para autenticación (no bloquea si no hay token)
export const autenticacionOpcional = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            
            const usuario = await baseDeDatos.obtenerUno(
                'SELECT id, email, nombre, rol FROM usuarios WHERE id = $1',
                [decoded.id]
            );

            if (usuario) {
                req.usuario = usuario;
            }
        }

        next();

    } catch (error) {
        // Si hay error con el token, continuar sin usuario
        next();
    }
};

