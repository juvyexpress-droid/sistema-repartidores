const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      const usuario = await Usuario.findByEmail(email);
      
      if (!usuario || !usuario.password_hash) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const isValidPassword = await bcrypt.compare(password, usuario.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      if (!usuario.activo) {
        return res.status(403).json({ error: 'Usuario inactivo' });
      }

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  },

  async register(req, res) {
    try {
      const { nombre, email, password, telefono, direccion, rol } = req.body;

      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
      }

      const existingUser = await Usuario.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const nuevoUsuario = await Usuario.create({
        nombre,
        email,
        telefono,
        direccion,
        rol: rol || 'cliente',
        password_hash,
        activo: true
      });

      res.status(201).json({
        mensaje: 'Usuario registrado exitosamente',
        usuario: nuevoUsuario
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  },

  async getProfile(req, res) {
    try {
      const usuario = await Usuario.findById(req.user.id);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }
};

module.exports = authController;
