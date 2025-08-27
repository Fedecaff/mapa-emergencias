import baseDeDatos from '../modelos/baseDeDatosPostgres.js';
import emailService from '../servicios/emailService.js';

const verificacionController = {

    // Generar y enviar código de verificación
    async enviarCodigo(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'Email requerido' });
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Formato de email inválido' });
            }

            // Verificar si el email ya está verificado por otro usuario
            const emailVerificado = await baseDeDatos.obtenerUno(
                'SELECT id FROM usuarios WHERE email = $1 AND email_verificado = true',
                [email]
            );

            if (emailVerificado) {
                return res.status(400).json({ error: 'Este email ya está verificado por otro usuario' });
            }

            // Generar código de 6 dígitos
            const codigo = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Calcular tiempo de expiración (10 minutos)
            const expiraEn = new Date();
            expiraEn.setMinutes(expiraEn.getMinutes() + 10);

            // Guardar código en la base de datos
            await baseDeDatos.ejecutar(
                'INSERT INTO codigos_verificacion (email, codigo, expira_en) VALUES ($1, $2, $3)',
                [email, codigo, expiraEn]
            );

            // Enviar email con el código
            await emailService.enviarCodigoVerificacion(email, codigo);

            console.log(`✅ Código de verificación enviado a ${email}`);

            res.json({
                mensaje: 'Código de verificación enviado exitosamente',
                email: email
            });

        } catch (error) {
            console.error('❌ Error enviando código de verificación:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    // Verificar código
    async verificarCodigo(req, res) {
        try {
            const { email, codigo } = req.body;

            if (!email || !codigo) {
                return res.status(400).json({ error: 'Email y código requeridos' });
            }

            // Buscar código válido
            const codigoValido = await baseDeDatos.obtenerUno(`
                SELECT id, usado, expira_en 
                FROM codigos_verificacion 
                WHERE email = $1 AND codigo = $2 AND usado = false AND expira_en > CURRENT_TIMESTAMP
                ORDER BY fecha_creacion DESC 
                LIMIT 1
            `, [email, codigo]);

            if (!codigoValido) {
                return res.status(400).json({ error: 'Código inválido, expirado o ya usado' });
            }

            // Marcar código como usado
            await baseDeDatos.ejecutar(
                'UPDATE codigos_verificacion SET usado = true WHERE id = $1',
                [codigoValido.id]
            );

            console.log(`✅ Email ${email} verificado exitosamente`);

            res.json({
                mensaje: 'Email verificado exitosamente',
                email: email,
                verificado: true
            });

        } catch (error) {
            console.error('❌ Error verificando código:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    // Verificar estado de verificación de un email
    async verificarEstado(req, res) {
        try {
            const { email } = req.query;

            if (!email) {
                return res.status(400).json({ error: 'Email requerido' });
            }

            // Verificar si el email está verificado por algún usuario
            const usuarioVerificado = await baseDeDatos.obtenerUno(
                'SELECT id, email_verificado FROM usuarios WHERE email = $1',
                [email]
            );

            if (usuarioVerificado) {
                return res.json({
                    disponible: false,
                    verificado: usuarioVerificado.email_verificado,
                    mensaje: usuarioVerificado.email_verificado ? 
                        'Email ya verificado por otro usuario' : 
                        'Email registrado pero no verificado'
                });
            }

            // Verificar si hay códigos pendientes
            const codigoPendiente = await baseDeDatos.obtenerUno(`
                SELECT id FROM codigos_verificacion 
                WHERE email = $1 AND usado = false AND expira_en > CURRENT_TIMESTAMP
            `, [email]);

            res.json({
                disponible: true,
                verificado: false,
                tieneCodigoPendiente: !!codigoPendiente,
                mensaje: codigoPendiente ? 
                    'Email disponible, código de verificación pendiente' : 
                    'Email disponible para verificación'
            });

        } catch (error) {
            console.error('❌ Error verificando estado:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};

export default verificacionController;
