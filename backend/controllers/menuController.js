const Menu = require('../models/Menu');

const menuController = {
  async getAll(req, res) {
    try {
      const filters = {};
      
      if (req.query.categoria) {
        filters.categoria = req.query.categoria;
      }

      if (req.query.disponible !== undefined) {
        filters.disponible = req.query.disponible === 'true';
      }

      const menus = await Menu.findAll(filters);
      res.json(menus);
    } catch (error) {
      console.error('Error al obtener menús:', error);
      res.status(500).json({ error: 'Error al obtener menús' });
    }
  },

  async getById(req, res) {
    try {
      const menu = await Menu.findById(req.params.id);
      
      if (!menu) {
        return res.status(404).json({ error: 'Menú no encontrado' });
      }

      res.json(menu);
    } catch (error) {
      console.error('Error al obtener menú:', error);
      res.status(500).json({ error: 'Error al obtener menú' });
    }
  },

  async create(req, res) {
    try {
      const { nombre, descripcion, precio, categoria, disponible, imagen_url } = req.body;

      if (!nombre || !precio) {
        return res.status(400).json({ error: 'Nombre y precio son requeridos' });
      }

      const nuevoMenu = await Menu.create({
        nombre,
        descripcion,
        precio,
        categoria,
        disponible: disponible !== undefined ? disponible : true,
        imagen_url
      });

      res.status(201).json({
        mensaje: 'Menú creado exitosamente',
        menu: nuevoMenu
      });
    } catch (error) {
      console.error('Error al crear menú:', error);
      res.status(500).json({ error: 'Error al crear menú' });
    }
  },

  async update(req, res) {
    try {
      const menuActualizado = await Menu.update(req.params.id, req.body);
      
      if (!menuActualizado) {
        return res.status(404).json({ error: 'Menú no encontrado' });
      }

      res.json({
        mensaje: 'Menú actualizado exitosamente',
        menu: menuActualizado
      });
    } catch (error) {
      console.error('Error al actualizar menú:', error);
      res.status(500).json({ error: 'Error al actualizar menú' });
    }
  },

  async delete(req, res) {
    try {
      const menuEliminado = await Menu.delete(req.params.id);
      
      if (!menuEliminado) {
        return res.status(404).json({ error: 'Menú no encontrado' });
      }

      res.json({ mensaje: 'Menú eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar menú:', error);
      res.status(500).json({ error: 'Error al eliminar menú' });
    }
  },

  async getCategorias(req, res) {
    try {
      const categorias = await Menu.getCategorias();
      res.json(categorias);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({ error: 'Error al obtener categorías' });
    }
  }
};

module.exports = menuController;
