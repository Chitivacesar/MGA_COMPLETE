const Venta = require("../models/Venta")

// GET - Obtener todas las ventas
exports.getVentas = async (req, res) => {
  try {
    const ventas = await Venta.find()
      .sort({ createdAt: -1 })
      .populate("beneficiarioId")
      .populate("matriculaId")
      .populate("cursoId")
    res.json(ventas)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET - Obtener una venta por ID
exports.getVentaById = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate("beneficiarioId")
      .populate("matriculaId")
      .populate("cursoId")
    if (venta) {
      res.json(venta)
    } else {
      res.status(404).json({ message: "Venta no encontrada" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// POST - Crear una nueva venta
exports.createVenta = async (req, res) => {
  try {
    // Depuración: Verificar los datos recibidos
    console.log('Datos recibidos para crear venta:', req.body);

    // Validar campos requeridos antes de crear la venta
    if (!req.body.beneficiarioId || !req.body.cursoId || !req.body.fechaInicio || !req.body.valor_total) {
      return res.status(400).json({ message: 'Faltan campos requeridos en la solicitud', data: req.body });
    }

    const venta = new Venta({
      beneficiarioId: req.body.beneficiarioId,
      matriculaId: req.body.matriculaId || null,
      cursoId: req.body.cursoId || null,
      numero_de_clases: req.body.numero_de_clases || null,
      ciclo: req.body.ciclo || null,
      tipo: req.body.tipo,
      fechaInicio: req.body.fechaInicio,
      fechaFin: req.body.fechaFin,
      estado: req.body.estado,
      valor_total: req.body.valor_total,
      observaciones: req.body.observaciones || null,
      descuento: req.body.descuento || 0,
    })

    // Generar consecutivo automáticamente si no se proporciona
    const ultimoConsecutivo = await Venta.findOne().sort({ consecutivo: -1 })
    venta.consecutivo = req.body.consecutivo || (ultimoConsecutivo ? ultimoConsecutivo.consecutivo + 1 : 1)

    // Generar codigoVenta automáticamente si no se proporciona
    venta.codigoVenta = req.body.codigoVenta || `CU-${venta.consecutivo.toString().padStart(4, "0")}`

    const nuevaVenta = await venta.save()
    res.status(201).json(nuevaVenta)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// PUT - Actualizar una venta
exports.updateVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" })
    }

    // Actualizar campos permitidos
    const camposPermitidos = [
      "beneficiarioId",
      "matriculaId",
      "cursoId",
      "numero_de_clases",
      "ciclo",
      "fechaInicio",
      "fechaFin",
      "estado",
      "valor_total",
      "observaciones",
      "descuento",
      "motivoAnulacion",
    ]

    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        venta[campo] = req.body[campo]
      }
    })

    venta.updatedAt = new Date()

    const ventaActualizada = await venta.save()
    res.json(ventaActualizada)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// DELETE - Eliminar una venta
exports.deleteVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" })
    }

    await venta.deleteOne()
    res.json({ message: "Venta eliminada" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// PATCH - Anular una venta con motivo
exports.anularVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" })
    }
    if (!req.body.motivoAnulacion) {
      return res.status(400).json({ message: "Debe proporcionar un motivo de anulación" })
    }

    venta.estado = "anulada"
    venta.motivoAnulacion = req.body.motivoAnulacion
    venta.updatedAt = new Date()

    await venta.save()
    res.json({ message: "Venta anulada correctamente", venta })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
