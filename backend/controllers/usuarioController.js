const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

const usuarioController = {
  async getAll(req, res) {
    try {
      const filters = {};
      
      if (req.query.rol) {
        filters.rol = req.query.rol;
      }

      if (req.query.activo !== undefined) {
        filters.activo = req.query.activo === 'true';
      }

      const usuarios = await Usuario.findAll(filters);
      res.json(usuarios);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  },

  async getById(req, res) {
    try {
      const usuario = await Usuario.findById(req.params.id);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  },

  async create(req, res) {
    try {
      const { nombre, email, password, telefono, direccion, rol, activo } = req.body;

      if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
      }

      const existingUser = await Usuario.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }

      let password_hash = null;
      if (password) {
        password_hash = await bcrypt.hash(password, 10);
      }

      const nuevoUsuario = await Usuario.create({
        nombre,
        email,
        telefono,
        direccion,
        rol: rol || 'cliente',
        password_hash,
        activo: activo !== undefined ? activo : true
      });

      res.status(201).json({
        mensaje: 'Usuario creado exitosamente',
        usuario: nuevoUsuario
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  },

  async update(req, res) {
    try {
      const updateData = { ...req.body };

      if (updateData.password) {
        updateData.password_hash = await bcrypt.hash(updateData.password, 10);
        delete updateData.password;
      }

      const usuarioActualizado = await Usuario.update(req.params.id, updateData);
      
      if (!usuarioActualizado) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        mensaje: 'Usuario actualizado exitosamente',
        usuario: usuarioActualizado
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  },

  async delete(req, res) {
    try {
      const usuarioEliminado = await Usuario.delete(req.params.id);
      
      if (!usuarioEliminado) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ mensaje: 'Usuario eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }
};

module.exports = usuarioController;
