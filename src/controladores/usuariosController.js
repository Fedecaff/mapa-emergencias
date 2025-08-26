import baseDeDatos from '../modelos/baseDeDatosPostgres.js';
import bcrypt from 'bcrypt';

const usuariosController = {

    async crear(req, res) {
        try {
            const { nombre, email, password, telefono, rol = 'operador', institucion, rol_institucion } = req.body;

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

            // Insertar usuario con nuevos campos
            const resultado = await baseDeDatos.ejecutar(
                'INSERT INTO usuarios (nombre, email, password, telefono, rol, institucion, rol_institucion) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                [nombre, email, passwordHash, telefono, rol, institucion || null, rol_institucion || null]
            );

            // Obtener el usuario creado (sin contraseña)
            const nuevoUsuario = await baseDeDatos.obtenerUno(
                'SELECT id, nombre, email, telefono, rol, institucion, rol_institucion, foto_perfil, fecha_creacion FROM usuarios WHERE id = $1',
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
            const query = 'SELECT id, email, nombre, rol, telefono, disponible, institucion, rol_institucion, foto_perfil FROM usuarios WHERE id = $1';
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
            if (parseInt(id) !== req.usuario.id && req.usuario.rol !== 'administrador') {
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
            const query = "SELECT id, email, nombre, telefono FROM usuarios WHERE disponible = true AND rol = 'operador'";
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

    async actualizarPerfil(req, res) {
        try {
            const { id } = req.params;
            const { nombre, institucion, rol_institucion, foto_perfil, telefono } = req.body;

            // Verificar si el usuario existe
            const usuarioExistente = await baseDeDatos.obtenerUno(
                'SELECT id FROM usuarios WHERE id = $1',
                [id]
            );

            if (!usuarioExistente) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Construir query de actualización
            const campos = [];
            const valores = [];
            let contador = 2;

            if (nombre !== undefined) {
                campos.push(`nombre = $${contador}`);
                valores.push(nombre);
                contador++;
            }

            if (institucion !== undefined) {
                campos.push(`institucion = $${contador}`);
                valores.push(institucion);
                contador++;
            }

            if (rol_institucion !== undefined) {
                campos.push(`rol_institucion = $${contador}`);
                valores.push(rol_institucion);
                contador++;
            }

            if (foto_perfil !== undefined) {
                campos.push(`foto_perfil = $${contador}`);
                valores.push(foto_perfil);
                contador++;
            }

            if (telefono !== undefined) {
                campos.push(`telefono = $${contador}`);
                valores.push(telefono);
                contador++;
            }

            if (campos.length === 0) {
                return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
            }

            valores.push(id);

            await baseDeDatos.ejecutar(
                `UPDATE usuarios SET ${campos.join(', ')} WHERE id = $${contador}`,
                valores
            );

            // Obtener usuario actualizado
            const usuarioActualizado = await baseDeDatos.obtenerUno(
                'SELECT id, nombre, email, telefono, rol, institucion, rol_institucion, foto_perfil, disponible FROM usuarios WHERE id = $1',
                [id]
            );

            console.log(`✅ Perfil actualizado: ID ${id}`);

            res.json({
                mensaje: 'Perfil actualizado exitosamente',
                usuario: usuarioActualizado
            });

        } catch (error) {
            console.error('❌ Error actualizando perfil:', error);
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
            if (usuario.rol === 'administrador') {
                const adminCount = await baseDeDatos.obtenerUno(
                    'SELECT COUNT(*) as count FROM usuarios WHERE rol = "administrador"'
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
    },

    async obtenerInstituciones(req, res) {
        try {
            // Lista hardcodeada de instituciones
            const instituciones = [
                "Bomberos Voluntarios de Valle Viejo",
                "Bomberos Voluntarios de San Fernando"
            ];

            res.json({
                instituciones: instituciones
            });

        } catch (error) {
            console.error('❌ Error obteniendo instituciones:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async obtenerRolesInstitucion(req, res) {
        try {
            // Lista hardcodeada de roles de institución
            const roles = [
                "Comandante",
                "Subcomandante",
                "Oficial",
                "Bombero",
                "Cadete"
            ];

            res.json({
                roles: roles
            });

        } catch (error) {
            console.error('❌ Error obteniendo roles de institución:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async actualizarUbicacion(req, res) {
        try {
            const { id } = req.params;
            const { latitud, longitud } = req.body;

            // Verificar que el usuario existe
            const usuario = await baseDeDatos.obtenerUno(
                'SELECT id FROM usuarios WHERE id = $1',
                [id]
            );

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Verificar que el usuario está actualizando su propia ubicación o es admin
            if (parseInt(id) !== req.usuario.id && req.usuario.rol !== 'administrador') {
                return res.status(403).json({ error: 'No autorizado para actualizar esta ubicación' });
            }

            // Validar coordenadas
            if (typeof latitud !== 'number' || typeof longitud !== 'number') {
                return res.status(400).json({ error: 'Latitud y longitud deben ser números' });
            }

            if (latitud < -90 || latitud > 90) {
                return res.status(400).json({ error: 'Latitud debe estar entre -90 y 90' });
            }

            if (longitud < -180 || longitud > 180) {
                return res.status(400).json({ error: 'Longitud debe estar entre -180 y 180' });
            }

            // Actualizar ubicación
            await baseDeDatos.ejecutar(
                'UPDATE usuarios SET latitud = $1, longitud = $2, ultima_actualizacion_ubicacion = NOW() WHERE id = $3',
                [latitud, longitud, id]
            );

            console.log(`✅ Ubicación actualizada para usuario ID: ${id} (${latitud}, ${longitud})`);

            res.json({
                mensaje: 'Ubicación actualizada exitosamente',
                ubicacion: {
                    latitud,
                    longitud,
                    ultima_actualizacion: new Date()
                }
            });

        } catch (error) {
            console.error('❌ Error actualizando ubicación:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async obtenerOperadoresConUbicacion(req, res) {
        try {
            // Solo administradores pueden ver ubicaciones de operadores
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
            }

            const operadores = await baseDeDatos.obtenerTodos(`
                SELECT 
                    id, 
                    nombre, 
                    email, 
                    telefono, 
                    disponible, 
                    institucion, 
                    rol_institucion, 
                    foto_perfil,
                    latitud, 
                    longitud, 
                    ultima_actualizacion_ubicacion,
                    CASE 
                        WHEN disponible = true 
                        AND ultima_actualizacion_ubicacion IS NOT NULL 
                        AND ultima_actualizacion_ubicacion > NOW() - INTERVAL '5 minutes'
                        THEN true 
                        ELSE false 
                    END as disponible_real
                FROM usuarios 
                WHERE rol = 'operador' 
                ORDER BY disponible_real DESC, nombre
            `);

            res.json({
                total: operadores.length,
                operadores: operadores
            });

        } catch (error) {
            console.error('❌ Error obteniendo operadores con ubicación:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async subirFotoPerfil(req, res) {
        try {
            const { id } = req.params;

            // Verificar que el usuario existe
            const usuario = await baseDeDatos.obtenerUno(
                'SELECT id FROM usuarios WHERE id = $1',
                [id]
            );

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Verificar que el usuario está actualizando su propia foto o es admin
            if (parseInt(id) !== req.usuario.id && req.usuario.rol !== 'administrador') {
                return res.status(403).json({ error: 'No autorizado para actualizar esta foto' });
            }

            // Verificar que se subió un archivo
            if (!req.file) {
                return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
            }

            // Aquí usarías Cloudinary para subir la imagen
            // Por ahora, simulamos la subida
            const fotoUrl = `https://via.placeholder.com/150/3498db/ffffff?text=${req.usuario.nombre}`;

            // Actualizar la foto en la base de datos
            await baseDeDatos.ejecutar(
                'UPDATE usuarios SET foto_perfil = $1 WHERE id = $2',
                [fotoUrl, id]
            );

            console.log(`✅ Foto de perfil subida para usuario ID: ${id}`);

            res.json({
                mensaje: 'Foto de perfil subida exitosamente',
                foto_perfil: fotoUrl
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
                'SELECT id FROM usuarios WHERE id = $1',
                [id]
            );

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Verificar que el usuario está eliminando su propia foto o es admin
            if (parseInt(id) !== req.usuario.id && req.usuario.rol !== 'administrador') {
                return res.status(403).json({ error: 'No autorizado para eliminar esta foto' });
            }

            // Eliminar la foto de la base de datos
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

export default usuariosController;
