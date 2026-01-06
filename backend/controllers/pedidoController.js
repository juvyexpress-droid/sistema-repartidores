const Pedido = require('../models/Pedido');
const Usuario = require('../models/Usuario');

const pedidoController = {
  async getAll(req, res) {
    try {
      const filters = {};
      
      if (req.query.estado) {
        filters.estado = req.query.estado;
      }

      // Si es repartidor, solo ve sus pedidos
      if (req.user.rol === 'repartidor') {
        filters.repartidor_id = req.user.id;
      }

      const pedidos = await Pedido.findAll(filters);
      res.json(pedidos);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      res.status(500).json({ error: 'Error al obtener pedidos' });
    }
  },

  async getById(req, res) {
    try {
      const pedido = await Pedido.findById(req.params.id);
      
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      // Si es repartidor, solo puede ver sus propios pedidos
      if (req.user.rol === 'repartidor' && pedido.repartidor_id !== req.user.id) {
        return res.status(403).json({ error: 'No tiene permiso para ver este pedido' });
      }

      res.json(pedido);
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      res.status(500).json({ error: 'Error al obtener pedido' });
    }
  },

  async create(req, res) {
    try {
      const { direccion_entrega, productos, total, notas, telefono_cliente, metodo_pago, cliente_nombre } = req.body;

      if (!direccion_entrega || !productos || !total) {
        return res.status(400).json({ error: 'Dirección, productos y total son requeridos' });
      }

      // Buscar o crear cliente
      let cliente_id = null;
      if (telefono_cliente) {
        let cliente = await Usuario.findByEmail(`${telefono_cliente}@whatsapp.com`);
        
        if (!cliente) {
          // Crear cliente automáticamente desde WhatsApp
          cliente = await Usuario.create({
            nombre: cliente_nombre || 'Cliente WhatsApp',
            email: `${telefono_cliente}@whatsapp.com`,
            telefono: telefono_cliente,
            rol: 'cliente',
            direccion: direccion_entrega,
            activo: true
          });
        }
        cliente_id = cliente.id;
      }

      // Asignar repartidor automáticamente
      const repartidor = await Usuario.getRepartidoresDisponibles();
      
      const nuevoPedido = await Pedido.create({
        cliente_id,
        repartidor_id: repartidor ? repartidor.id : null,
        direccion_entrega,
        productos,
        total,
        estado: 'pendiente',
        notas,
        telefono_cliente,
        metodo_pago
      });

      const pedidoCompleto = await Pedido.findById(nuevoPedido.id);
      
      res.status(201).json({
        mensaje: 'Pedido creado exitosamente',
        pedido: pedidoCompleto
      });
    } catch (error) {
      console.error('Error al crear pedido:', error);
      res.status(500).json({ error: 'Error al crear pedido' });
    }
  },

  async updateEstado(req, res) {
    try {
      const { estado } = req.body;
      const pedidoId = req.params.id;

      if (!estado) {
        return res.status(400).json({ error: 'Estado es requerido' });
      }

      const estadosValidos = ['pendiente', 'en_proceso', 'entregado', 'cancelado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }

      const pedidoActual = await Pedido.findById(pedidoId);
      if (!pedidoActual) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      // Si es repartidor, solo puede actualizar sus propios pedidos
      if (req.user.rol === 'repartidor' && pedidoActual.repartidor_id !== req.user.id) {
        return res.status(403).json({ error: 'No tiene permiso para actualizar este pedido' });
      }

      const pedidoActualizado = await Pedido.updateEstado(pedidoId, estado, req.user.id);

      res.json({
        mensaje: 'Estado actualizado exitosamente',
        pedido: pedidoActualizado
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({ error: 'Error al actualizar estado' });
    }
  },

  async update(req, res) {
    try {
      const pedidoActualizado = await Pedido.update(req.params.id, req.body);
      
      if (!pedidoActualizado) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      res.json({
        mensaje: 'Pedido actualizado exitosamente',
        pedido: pedidoActualizado
      });
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      res.status(500).json({ error: 'Error al actualizar pedido' });
    }
  },

  async delete(req, res) {
    try {
      const pedidoEliminado = await Pedido.delete(req.params.id);
      
      if (!pedidoEliminado) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      res.json({ mensaje: 'Pedido eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      res.status(500).json({ error: 'Error al eliminar pedido' });
    }
  },

  async getEstadisticas(req, res) {
    try {
      const estadisticas = await Pedido.getEstadisticas();
      res.json(estadisticas);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
};

module.exports = pedidoController;
