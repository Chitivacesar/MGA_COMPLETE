const Pago = require('../models/Pago');

const pagoController = {
  async getPagos(req, res) {
    try {
      const pagos = await Pago.find()
        .populate({
          path: 'ventas',
          populate: [{
            path: 'beneficiarioId',
            model: 'Beneficiario'
          }]
        })
        .sort({ createdAt: -1 });

      const pagosFormateados = pagos.map(pago => {
        const pagoObj = pago.toObject();
        return {
          _id: pagoObj._id,
          fechaPago: pagoObj.fechaPago,
          metodoPago: pagoObj.metodoPago,
          estado: pagoObj.estado,
          createdAt: pagoObj.createdAt,
          updatedAt: pagoObj.updatedAt,
          valor_total: pagoObj.valor_total || 0,
          valorTotal: pagoObj.valor_total || 0,
          ventas: pagoObj.ventas ? {
            _id: pagoObj.ventas._id,
            valor_total: pagoObj.ventas.valor_total || 0,
            beneficiario: pagoObj.ventas.beneficiarioId ? {
              _id: pagoObj.ventas.beneficiarioId._id,
              nombre: pagoObj.ventas.beneficiarioId.nombre,
              apellido: pagoObj.ventas.beneficiarioId.apellido,
              tipo_de_documento: pagoObj.ventas.beneficiarioId.tipo_de_documento,
              numero_de_documento: pagoObj.ventas.beneficiarioId.numero_de_documento,
              telefono: pagoObj.ventas.beneficiarioId.telefono,
              clienteId: pagoObj.ventas.beneficiarioId.clienteId
            } : null
          } : null,
          porcentajePagado: pagoObj.ventas?.valor_total ? 
            Math.round((pagoObj.valor_total / pagoObj.ventas.valor_total) * 100) : 0
        };
      });

      res.json({
        success: true,
        data: pagosFormateados,
        total: pagosFormateados.length
      });
    } catch (error) {
      console.error('Error en getPagos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los pagos',
        error: error.message
      });
    }
  },

  async getPagoById(req, res) {
    try {
      const pago = await Pago.findById(req.params.id)
        .populate({
          path: 'ventas',
          populate: [{
            path: 'beneficiarioId',
            model: 'Beneficiario'
          }]
        });

      if (!pago) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      const pagoObj = pago.toObject();
      res.json({
        success: true,
        data: {
          ...pagoObj,
          ventas: pagoObj.ventas ? {
            ...pagoObj.ventas,
            beneficiario: pagoObj.ventas.beneficiarioId ? {
              ...pagoObj.ventas.beneficiarioId,
              clienteId: pagoObj.ventas.beneficiarioId.clienteId
            } : null
          } : null
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el pago',
        error: error.message
      });
    }
  },

  async createPago(req, res) {
    try {
      const nuevoPago = new Pago(req.body);
      await nuevoPago.save();
      const pagoCompleto = await Pago.findById(nuevoPago._id)
        .populate({
          path: 'ventas',
          populate: [{
            path: 'beneficiarioId',
            model: 'Beneficiario'
          }]
        });

      res.status(201).json({
        success: true,
        data: pagoCompleto
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el pago',
        error: error.message
      });
    }
  },

  async updatePago(req, res) {
    try {
      const pago = await Pago.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!pago) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      res.json({
        success: true,
        data: pago
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el pago',
        error: error.message
      });
    }
  },

  async deletePago(req, res) {
    try {
      const pago = await Pago.findByIdAndDelete(req.params.id);

      if (!pago) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Pago eliminado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el pago',
        error: error.message
      });
    }
  },

  async debugPagos(req, res) {
    try {
      console.log('=== DEBUG PAGOS ===');
      const pagos = await Pago.find().limit(1)
        .populate({
          path: 'ventas',
          populate: [{
            path: 'beneficiarioId',
            model: 'Beneficiario'
          }]
        });

      res.json({
        success: true,
        data: pagos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en debug de pagos',
        error: error.message
      });
    }
  }
};

module.exports = pagoController;