const Contador = require('../models/Contador');

// GET - Obtener todos los contadores
exports.getContadores = async (req, res) => {
    try {
        const contadores = await Contador.find();
        res.json(contadores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET - Obtener un contador por ID
exports.getContadorById = async (req, res) => {
    try {
        const contador = await Contador.findById(req.params.id);
        if (contador) {
            res.json(contador);
        } else {
            res.status(404).json({ message: 'Contador no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST - Crear un nuevo contador
exports.createContador = async (req, res) => {
    const { _id, seq } = req.body;

    try {
        const existente = await Contador.findById(_id);
        if (existente) {
            return res.status(400).json({ message: 'El contador ya existe' });
        }

        const nuevoContador = new Contador({
            _id: _id,
            seq: seq || 0
        });

        const contadorGuardado = await nuevoContador.save();
        res.status(201).json(contadorGuardado);
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PATCH - Incrementar el contador
exports.incrementarContador = async (req, res) => {
    try {
        const actualizado = await Contador.findByIdAndUpdate(
            req.params.id,
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        res.json({ message: 'Contador incrementado', contador: actualizado });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE - Eliminar contador
exports.deleteContador = async (req, res) => {
    try {
        const contador = await Contador.findById(req.params.id);
        if (contador) {
            await contador.deleteOne();
            res.json({ message: 'Contador eliminado' });
        } else {
            res.status(404).json({ message: 'Contador no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};