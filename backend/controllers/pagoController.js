const Pago = require('../models/Pago');

const pagoController = {
  async getPagos(req, res) {
    try {
      const pagos = await Pago.find()
        .populate({
          path: 'venta',
          populate: {
            path: 'beneficiarioId',
            model: 'Beneficiario'
          }
        })
        .sort({ createdAt: -1 });

      const pagosFormateados = pagos.map(pago => {
        const pagoObj = pago.toObject();
        
        // Si el pago tiene ventas en lugar de venta, hacer la conversión
        if (pagoObj.ventas && !pagoObj.venta) {
          pagoObj.venta = pagoObj.ventas;
          delete pagoObj.ventas;
        }

        // Obtener la información del beneficiario
        const beneficiarioInfo = pagoObj.venta?.beneficiarioId || {};
        const nombreCompleto = [beneficiarioInfo.nombre, beneficiarioInfo.apellido]
          .filter(Boolean)
          .join(' ') || 'No disponible';

        return {
          ...pagoObj,
          infoBeneficiario: {
            nombre: nombreCompleto,
            documento: beneficiarioInfo.documento || 'No disponible',
            telefono: beneficiarioInfo.telefono || 'No disponible',
            email: beneficiarioInfo.email || 'No disponible'
          },
          infoCliente: {
            nombre: nombreCompleto,
            documento: beneficiarioInfo.documento || 'No disponible',
            telefono: beneficiarioInfo.telefono || 'No disponible',
            email: beneficiarioInfo.email || 'No disponible'
          },
          valor_total: pagoObj.valor_total || 0,
          valorTotal: pagoObj.valor_total || 0,
          porcentajePagado: pagoObj.valorAbonado ? (pagoObj.valorAbonado / pagoObj.valor_total * 100) : 0
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

  // FUNCIÓN DE DEBUG - AGREGAR AQUÍ
  async debugPagos(req, res) {
    try {
      console.log('=== DEBUG PAGOS ===');
      
      // 1. Ver pagos sin populate
      const pagosSinPopulate = await Pago.find().limit(2);
      console.log('PAGOS SIN POPULATE:', JSON.stringify(pagosSinPopulate, null, 2));
      
      // 2. Ver con populate paso a paso
      const pagosConVenta = await Pago.find()
        .populate('venta')
        .limit(2);
      console.log('PAGOS CON VENTA:', JSON.stringify(pagosConVenta, null, 2));
      
      // 3. Ver con populate completo
      const pagosCompletos = await Pago.find()
        .populate({
          path: 'venta',
          populate: {
            path: 'beneficiarioId',
            model: 'Beneficiario'
          }
        })
        .limit(2);
      console.log('PAGOS COMPLETOS:', JSON.stringify(pagosCompletos, null, 2));
      
      // 4. Verificar modelos
      const Venta = require('../models/Venta');
      const Beneficiario = require('../models/Beneficiario');
      
      const ventasCount = await Venta.countDocuments();
      const beneficiariosCount = await Beneficiario.countDocuments();
      const pagosCount = await Pago.countDocuments();
      
      console.log('CONTEOS:');
      console.log('- Pagos:', pagosCount);
      console.log('- Ventas:', ventasCount);
      console.log('- Beneficiarios:', beneficiariosCount);
      
      // 5. Ver una venta de ejemplo
      const ventaEjemplo = await Venta.findOne().populate('beneficiarioId');
      console.log('VENTA EJEMPLO:', JSON.stringify(ventaEjemplo, null, 2));
      
      res.json({
        success: true,
        pagosSinPopulate,
        pagosConVenta,
        pagosCompletos,
        counts: { pagos: pagosCount, ventas: ventasCount, beneficiarios: beneficiariosCount },
        ventaEjemplo
      });
      
    } catch (error) {
      console.error('ERROR EN DEBUG:', error);
      res.status(500).json({ error: error.message, stack: error.stack });
    }
  },

  // Obtener un pago por ID
  async getPagoById(req, res) {
    try {
      const { id } = req.params;
      
      const pago = await Pago.findById(id)
        .populate({
          path: 'venta',
          populate: {
            path: 'beneficiarioId',
            model: 'Beneficiario'
          }
        });

      if (!pago) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      // Formatear el pago individual
      const pagoObj = pago.toObject();
      const beneficiario = pagoObj.venta?.beneficiarioId;
      const beneficiarioData = beneficiario ? {
        _id: beneficiario._id,
        nombre: beneficiario.nombre || '',
        apellido: beneficiario.apellido || '',
        email: beneficiario.email || '',
        telefono: beneficiario.telefono || '',
        documento: beneficiario.documento || '',
        numero_de_documento: beneficiario.documento || beneficiario.numero_de_documento || '',
        correo: beneficiario.email || beneficiario.correo || ''
      } : null;
      
      const pagoFormateado = {
        ...pagoObj,
        valorTotal: pagoObj.valor_total,
        valor_total: pagoObj.valor_total,
        venta: pagoObj.venta ? {
          ...pagoObj.venta,
          valorTotal: pagoObj.venta.valor_total,
          valor_total: pagoObj.venta.valor_total,
          beneficiario: beneficiarioData
        } : null
      };

      res.json({
        success: true,
        data: pagoFormateado
      });

    } catch (error) {
      console.error('Error en getPagoById:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el pago',
        error: error.message
      });
    }
  },

  // Crear un nuevo pago
  async createPago(req, res) {
    try {
      const nuevoPago = new Pago(req.body);
      const pagoGuardado = await nuevoPago.save();
      
      // Obtener el pago completo con populate
      const pagoCompleto = await Pago.findById(pagoGuardado._id)
        .populate({
          path: 'venta',
          populate: {
            path: 'beneficiarioId',
            model: 'Beneficiario'
          }
        });

      res.status(201).json({
        success: true,
        data: pagoCompleto,
        message: 'Pago creado exitosamente'
      });

    } catch (error) {
      console.error('Error en createPago:', error);
      res.status(400).json({
        success: false,
        message: 'Error al crear el pago',
        error: error.message
      });
    }
  },

  // Actualizar un pago
  async updatePago(req, res) {
    try {
      const { id } = req.params;
      
      const pagoActualizado = await Pago.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      ).populate({
        path: 'venta',
        populate: {
          path: 'beneficiarioId',
          model: 'Beneficiario'
        }
      });

      if (!pagoActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      res.json({
        success: true,
        data: pagoActualizado,
        message: 'Pago actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error en updatePago:', error);
      res.status(400).json({
        success: false,
        message: 'Error al actualizar el pago',
        error: error.message
      });
    }
  },

  // Eliminar un pago
  async deletePago(req, res) {
    try {
      const { id } = req.params;
      
      const pagoEliminado = await Pago.findByIdAndDelete(id);

      if (!pagoEliminado) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Pago eliminado exitosamente',
        data: pagoEliminado
      });

    } catch (error) {
      console.error('Error en deletePago:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el pago',
        error: error.message
      });
    }
  }
};

module.exports = pagoController;