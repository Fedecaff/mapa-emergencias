import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import baseDeDatos from '../modelos/baseDeDatosPostgres.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mapa-emergencias-secret-key';

class AutenticacionController {
    // Login de usuario
    async login(req, res) {
        try {
            console.log('🔐 Intentando login con:', { email: req.body.email });
            const { email, password } = req.body;

            // Validar campos requeridos
            if (!email || !password) {
                console.log('❌ Campos faltantes');
                return res.status(400).json({
                    error: 'Email y contraseña son requeridos'
                });
            }

            // Buscar usuario por email
            console.log('🔍 Buscando usuario en la base de datos...');
            const usuario = await baseDeDatos.obtenerUno(
                'SELECT * FROM usuarios WHERE email = $1',
                [email]
            );

            if (!usuario) {
                console.log('❌ Usuario no encontrado:', email);
                return res.status(401).json({
                    error: 'Credenciales inválidas'
                });
            }
            
            console.log('✅ Usuario encontrado:', usuario.email);

            // Verificar contraseña
            console.log('🔑 Verificando contraseña...');
            const passwordValida = await bcrypt.compare(password, usuario.password);
            if (!passwordValida) {
                console.log('❌ Contraseña incorrecta');
                return res.status(401).json({
                    error: 'Credenciales inválidas'
                });
            }
            
            console.log('✅ Contraseña válida');

            // Generar token JWT
            const token = jwt.sign(
                {
                    id: usuario.id,
                    email: usuario.email,
                    rol: usuario.rol
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Enviar respuesta
            res.json({
                mensaje: 'Login exitoso',
                token,
                usuario: {
                    id: usuario.id,
                    email: usuario.email,
                    nombre: usuario.nombre,
                    rol: usuario.rol
                }
            });

        } catch (error) {
            console.error('❌ Error en login:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Registro de usuario (solo para administradores)
    async registro(req, res) {
        try {
            const { email, password, nombre, rol = 'usuario' } = req.body;

            // Validar campos requeridos
            if (!email || !password || !nombre) {
                return res.status(400).json({
                    error: 'Email, contraseña y nombre son requeridos'
                });
            }

            // Verificar si el usuario ya existe
            const usuarioExistente = await baseDeDatos.obtenerUno(
                'SELECT id FROM usuarios WHERE email = $1',
                [email]
            );

            if (usuarioExistente) {
                return res.status(400).json({
                    error: 'El email ya está registrado'
                });
            }

            // Encriptar contraseña
            const passwordHash = await bcrypt.hash(password, 10);

            // Insertar nuevo usuario
            const resultado = await baseDeDatos.ejecutar(
                'INSERT INTO usuarios (email, password, nombre, rol) VALUES ($1, $2, $3, $4)',
                [email, passwordHash, nombre, rol]
            );

            res.status(201).json({
                mensaje: 'Usuario registrado exitosamente',
                usuario: {
                    id: resultado.id,
                    email,
                    nombre,
                    rol
                }
            });

        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    // Verificar token
    async verificarToken(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({
                    error: 'Token no proporcionado'
                });
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Buscar usuario en base de datos
            const usuario = await baseDeDatos.obtenerUno(
                'SELECT id, email, nombre, rol FROM usuarios WHERE id = $1',
                [decoded.id]
            );

            if (!usuario) {
                return res.status(401).json({
                    error: 'Token inválido'
                });
            }

            res.json({
                mensaje: 'Token válido',
                usuario
            });

        } catch (error) {
            console.error('Error verificando token:', error);
            res.status(401).json({
                error: 'Token inválido'
            });
        }
    }

    // Obtener perfil del usuario
    async obtenerPerfil(req, res) {
        try {
            const usuario = await baseDeDatos.obtenerUno(
                'SELECT id, email, nombre, rol, fecha_creacion FROM usuarios WHERE id = $1',
                [req.usuario.id]
            );

            if (!usuario) {
                return res.status(404).json({
                    error: 'Usuario no encontrado'
                });
            }

            res.json({
                usuario
            });

        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }
}

export default new AutenticacionController();




