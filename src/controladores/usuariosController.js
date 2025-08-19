import baseDeDatos from '../modelos/baseDeDatosPostgres.js';
import bcrypt from 'bcrypt';

const usuariosController = {

    async crear(req, res) {
        try {
            const { nombre, email, password, telefono, rol = 'usuario' } = req.body;

            // Validaciones
            if (!nombre || !email || !password || !telefono) {
                return res.status(400).json({ error: 'Todos los campos son requeridos' });
            }

            // Validar formato de teléfono argentino
            const telefonoRegex = /^\+54\s9\s\d{4}\s\d{6}$/;
            if (!telefonoRegex.test(telefono)) {
                return res.status(400).json({ error: 'Formato de teléfono inválido. Use: +54 9 XXXX XXXXXX' });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
            }

            // Verificar si el email ya existe
            const usuarioExistente = await baseDeDatos.obtenerUno(
                'SELECT id FROM usuarios WHERE email = $1',
                [email]
            );

            if (usuarioExistente) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }

            // Verificar si el teléfono ya existe
            const telefonoExistente = await baseDeDatos.obtenerUno(
                'SELECT id FROM usuarios WHERE telefono = $1',
                [telefono]
            );

            if (telefonoExistente) {
                return res.status(400).json({ error: 'El teléfono ya está registrado' });
            }

            // Encriptar contraseña
            const passwordHash = await bcrypt.hash(password, 10);

            // Insertar usuario
            const resultado = await baseDeDatos.ejecutar(
                'INSERT INTO usuarios (nombre, email, contraseña, telefono, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [nombre, email, passwordHash, telefono, rol]
            );

            // Obtener el usuario creado (sin contraseña)
            const nuevoUsuario = await baseDeDatos.obtenerUno(
                'SELECT id, nombre, email, telefono, rol, fecha_creacion FROM usuarios WHERE id = $1',
                [resultado.rows[0].id]
            );

            console.log(`✅ Usuario creado: ${email} (ID: ${resultado.rows[0].id})`);

            res.status(201).json({
                mensaje: 'Usuario creado exitosamente',
                usuario: nuevoUsuario
            });

        } catch (error) {
            console.error('❌ Error creando usuario:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async listar(req, res) {
        try {
            const usuarios = await baseDeDatos.obtenerTodos(
                'SELECT id, nombre, email, telefono, rol, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC'
            );

            res.json({ usuarios });

        } catch (error) {
            console.error('❌ Error listando usuarios:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async obtener(req, res) {
        try {
            const { id } = req.params;
            const query = 'SELECT id, email, nombre, rol, telefono, disponible FROM usuarios WHERE id = $1';
            const result = await baseDeDatos.ejecutar(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async cambiarDisponibilidad(req, res) {
        try {
            const { id } = req.params;
            const { disponible } = req.body;
            
            // Validar que el usuario existe y es el mismo que hace la petición
            if (parseInt(id) !== req.usuario.id && req.usuario.rol !== 'admin') {
                return res.status(403).json({ error: 'No autorizado' });
            }
            
            const query = 'UPDATE usuarios SET disponible = $1 WHERE id = $2 RETURNING id, email, nombre, disponible';
            const result = await baseDeDatos.ejecutar(query, [disponible, id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            res.json({
                mensaje: `Estado de disponibilidad actualizado a ${disponible ? 'disponible' : 'no disponible'}`,
                usuario: result.rows[0]
            });
        } catch (error) {
            console.error('Error cambiando disponibilidad:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async obtenerDisponibles(req, res) {
        try {
            const query = "SELECT id, email, nombre, telefono FROM usuarios WHERE disponible = true AND rol = 'usuario'";
            const result = await baseDeDatos.ejecutar(query);
            
            res.json({
                total: result.rows.length,
                usuarios: result.rows
            });
        } catch (error) {
            console.error('Error obteniendo usuarios disponibles:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { nombre, email, rol } = req.body;

            // Verificar si el usuario existe
            const usuarioExistente = await baseDeDatos.obtenerUno(
                'SELECT id FROM usuarios WHERE id = $1',
                [id]
            );

            if (!usuarioExistente) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Verificar si el email ya existe en otro usuario
            if (email) {
                const emailExistente = await baseDeDatos.obtenerUno(
                    'SELECT id FROM usuarios WHERE email = $9 AND id != $10',
                    [email, id]
                );

                if (emailExistente) {
                    return res.status(400).json({ error: 'El email ya está registrado por otro usuario' });
                }
            }

            // Construir query de actualización
            const campos = [];
            const valores = [];

            if (nombre !== undefined) {
                campos.push('nombre = $11');
                valores.push(nombre);
            }

            if (email !== undefined) {
                campos.push('email = $12');
                valores.push(email);
            }

            if (rol !== undefined) {
                campos.push('rol = $13');
                valores.push(rol);
            }

            if (campos.length === 0) {
                return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
            }

            valores.push(id);

            await baseDeDatos.ejecutar(
                `UPDATE usuarios SET ${campos.join(', ')} WHERE id = $14`,
                valores
            );

            // Obtener usuario actualizado
            const usuarioActualizado = await baseDeDatos.obtenerUno(
                'SELECT id, nombre, email, rol, fecha_creacion FROM usuarios WHERE id = $15',
                [id]
            );

            console.log(`✅ Usuario actualizado: ID ${id}`);

            res.json({
                mensaje: 'Usuario actualizado exitosamente',
                usuario: usuarioActualizado
            });

        } catch (error) {
            console.error('❌ Error actualizando usuario:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async eliminar(req, res) {
        try {
            const { id } = req.params;

            // Verificar si el usuario existe
            const usuario = await baseDeDatos.obtenerUno(
                'SELECT id, email FROM usuarios WHERE id = $16',
                [id]
            );

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // No permitir eliminar el último admin
            if (usuario.rol === 'admin') {
                const adminCount = await baseDeDatos.obtenerUno(
                    'SELECT COUNT(*) as count FROM usuarios WHERE rol = "admin"'
                );

                if (adminCount.count <= 1) {
                    return res.status(400).json({ error: 'No se puede eliminar el último administrador' });
                }
            }

            await baseDeDatos.ejecutar('DELETE FROM usuarios WHERE id = $17', [id]);

            console.log(`✅ Usuario eliminado: ${usuario.email} (ID: ${id})`);

            res.json({ mensaje: 'Usuario eliminado exitosamente' });

        } catch (error) {
            console.error('❌ Error eliminando usuario:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};

export default usuariosController;
