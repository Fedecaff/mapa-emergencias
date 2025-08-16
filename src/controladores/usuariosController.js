import baseDeDatos from '../modelos/baseDeDatos.js';
import bcrypt from 'bcrypt';

const usuariosController = {

    async crear(req, res) {
        try {
            const { nombre, email, password, rol = 'usuario' } = req.body;

            // Validaciones
            if (!nombre || !email || !password) {
                return res.status(400).json({ error: 'Todos los campos son requeridos' });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
            }

            // Verificar si el email ya existe
            const usuarioExistente = await baseDeDatos.obtenerUno(
                'SELECT id FROM usuarios WHERE email = ?',
                [email]
            );

            if (usuarioExistente) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }

            // Encriptar contraseña
            const passwordHash = await bcrypt.hash(password, 10);

            // Insertar usuario
            const resultado = await baseDeDatos.ejecutar(
                'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
                [nombre, email, passwordHash, rol]
            );

            // Obtener el usuario creado (sin contraseña)
            const nuevoUsuario = await baseDeDatos.obtenerUno(
                'SELECT id, nombre, email, rol, fecha_creacion FROM usuarios WHERE id = ?',
                [resultado.lastID]
            );

            console.log(`✅ Usuario creado: ${email} (ID: ${resultado.lastID})`);

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
                'SELECT id, nombre, email, rol, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC'
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

            const usuario = await baseDeDatos.obtenerUno(
                'SELECT id, nombre, email, rol, fecha_creacion FROM usuarios WHERE id = ?',
                [id]
            );

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({ usuario });

        } catch (error) {
            console.error('❌ Error obteniendo usuario:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { nombre, email, rol } = req.body;

            // Verificar si el usuario existe
            const usuarioExistente = await baseDeDatos.obtenerUno(
                'SELECT id FROM usuarios WHERE id = ?',
                [id]
            );

            if (!usuarioExistente) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Verificar si el email ya existe en otro usuario
            if (email) {
                const emailExistente = await baseDeDatos.obtenerUno(
                    'SELECT id FROM usuarios WHERE email = ? AND id != ?',
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
                campos.push('nombre = ?');
                valores.push(nombre);
            }

            if (email !== undefined) {
                campos.push('email = ?');
                valores.push(email);
            }

            if (rol !== undefined) {
                campos.push('rol = ?');
                valores.push(rol);
            }

            if (campos.length === 0) {
                return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
            }

            valores.push(id);

            await baseDeDatos.ejecutar(
                `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`,
                valores
            );

            // Obtener usuario actualizado
            const usuarioActualizado = await baseDeDatos.obtenerUno(
                'SELECT id, nombre, email, rol, fecha_creacion FROM usuarios WHERE id = ?',
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
                'SELECT id, email FROM usuarios WHERE id = ?',
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

            await baseDeDatos.ejecutar('DELETE FROM usuarios WHERE id = ?', [id]);

            console.log(`✅ Usuario eliminado: ${usuario.email} (ID: ${id})`);

            res.json({ mensaje: 'Usuario eliminado exitosamente' });

        } catch (error) {
            console.error('❌ Error eliminando usuario:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};

export default usuariosController;
