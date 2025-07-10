const Pago = require('../models/Pago');

const pagoController = {
  async getPagos(req, res) {
    try {
      const pagos = await Pago.find()
        .populate({
          path: 'ventas',
          populate: {
            path: 'beneficiarioId',
            populate: {
              path: 'clienteId',
              model: 'Cliente'
            }
          }
        })
        .sort({ createdAt: -1 });

      const pagosFormateados = pagos.map(pago => {
        const pagoObj = pago.toObject();
        const venta = pagoObj.ventas;
        const beneficiario = venta?.beneficiarioId;
        const cliente = beneficiario?.clienteId;
        return {
          _id: pagoObj._id,
          fechaPago: pagoObj.fechaPago,
          metodoPago: pagoObj.metodoPago,
          estado: pagoObj.estado,
          createdAt: pagoObj.createdAt,
          updatedAt: pagoObj.updatedAt,
          ventas: venta ? {
            ...venta,
            beneficiario: beneficiario ? {
              ...beneficiario,
              cliente: cliente ? { ...cliente } : null
            } : null
          } : null,
          valor_total: pagoObj.valor_total || 0,
          valorTotal: pagoObj.valor_total || 0,
          porcentajePagado: venta?.valor_total ? Math.round((pagoObj.valor_total / venta.valor_total) * 100) : 0
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

  // FUNCIÓN DE DEBUG MEJORADA
  async debugPagos(req, res) {
    try {
      console.log('=== DEBUG PAGOS MEJORADO ===');
      
      // 1. Ver pagos sin populate
      const pagosSinPopulate = await Pago.find().limit(1);
      console.log('PAGOS SIN POPULATE:', JSON.stringify(pagosSinPopulate, null, 2));
      
      // 2. Ver con populate completo
      const pagosCompletos = await Pago.find()
        .populate({
          path: 'venta',
          populate: {
            path: 'beneficiarioId',
            model: 'Beneficiario'
          }
        })
        .limit(1);
      console.log('PAGOS COMPLETOS:', JSON.stringify(pagosCompletos, null, 2));
      
      // 3. Verificar estructura del beneficiario
      if (pagosCompletos.length > 0) {
        const beneficiario = pagosCompletos[0].venta?.beneficiarioId;
        console.log('ESTRUCTURA BENEFICIARIO:');
        console.log('- Nombre:', beneficiario?.nombre);
        console.log('- Apellido:', beneficiario?.apellido);
        console.log('- Documento:', beneficiario?.numero_de_documento); // CORREGIDO
        console.log('- Teléfono:', beneficiario?.telefono);
        console.log('- Email:', beneficiario?.email); // Puede no existir
        console.log('- Campos disponibles:', Object.keys(beneficiario || {}));
      }
      
      // 4. Verificar conteos
      const Venta = require('../models/Venta');
      const Beneficiario = require('../models/Beneficiario');
      
      const ventasCount = await Venta.countDocuments();
      const beneficiariosCount = await Beneficiario.countDocuments();
      const pagosCount = await Pago.countDocuments();
      
      console.log('CONTEOS:');
      console.log('- Pagos:', pagosCount);
      console.log('- Ventas:', ventasCount);
      console.log('- Beneficiarios:', beneficiariosCount);
      
      // 5. Ver ejemplo de venta con beneficiario
      const ventaEjemplo = await Venta.findOne().populate('beneficiarioId');
      console.log('VENTA EJEMPLO CON BENEFICIARIO:', JSON.stringify(ventaEjemplo, null, 2));
      
      res.json({
        success: true,
        pagosSinPopulate,
        pagosCompletos,
        counts: { pagos: pagosCount, ventas: ventasCount, beneficiarios: beneficiariosCount },
        ventaEjemplo,
        message: 'Debug completado - revisa la consola del servidor'
      });
      
    } catch (error) {
      console.error('ERROR EN DEBUG:', error);
      res.status(500).json({ error: error.message, stack: error.stack });
    }
  },

  // Obtener un pago por ID - CORREGIDO
  async getPagoById(req, res) {
    try {
      const { id } = req.params;
      
      const pago = await Pago.findById(id)
        .populate({
          path: 'ventas',
          populate: {
            path: 'beneficiarioId',
            populate: {
              path: 'clienteId',
              model: 'Cliente'
            }
          }
        });

      if (!pago) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      // Formatear el pago individual - CORREGIDO
      const pagoObj = pago.toObject();
      const venta = pagoObj.ventas;
      const beneficiario = venta?.beneficiarioId;
      const cliente = beneficiario?.clienteId;
      const pagoFormateado = {
        ...pagoObj,
        valorTotal: pagoObj.valor_total,
        valor_total: pagoObj.valor_total,
        ventas: venta ? {
          ...venta,
          beneficiario: beneficiario ? {
            ...beneficiario,
            cliente: cliente ? { ...cliente } : null
          } : null
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

  // Crear un nuevo pago - MEJORADO
  async createPago(req, res) {
    try {
      console.log('=== CREATING PAGO ===');
      console.log('Request body:', req.body);
      
      // AGREGADO: Validar que la venta existe
      const Venta = require('../models/Venta');
      let venta;
      // Buscar venta por código o por ID
      if (mongoose.Types.ObjectId.isValid(req.body.ventas)) {
        venta = await Venta.findById(req.body.ventas);
      } else {
        // Buscar por código de venta
        venta = await Venta.findOne({ codigoVenta: req.body.ventas });
      }
      if (!venta) {
        return res.status(400).json({
          success: false,
          message: 'Venta no encontrada. Verifica el código de venta.'
        });
      }
      // Crear el pago con el ID de la venta
      const pagoData = {
        ...req.body,
        ventas: venta._id // Asegurar que se use el ObjectId
      };
      const nuevoPago = new Pago(pagoData);
      const pagoGuardado = await nuevoPago.save();
      
      // Obtener el pago completo con populate profundo
      const pagoCompleto = await Pago.findById(pagoGuardado._id)
        .populate({
          path: 'ventas',
          populate: {
            path: 'beneficiarioId',
            populate: {
              path: 'clienteId',
              model: 'Cliente'
            }
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

  // Los demás métodos permanecen igual...
  async updatePago(req, res) {
    try {
      const { id } = req.params;
      
      const pagoActualizado = await Pago.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      ).populate({
        path: 'ventas',
        populate: {
          path: 'beneficiarioId',
          populate: {
            path: 'clienteId',
            model: 'Cliente'
          }
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