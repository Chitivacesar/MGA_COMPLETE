const mongoose = require('mongoose');
const Cliente = require('../models/Cliente');
const Beneficiario = require('../models/Beneficiario');

async function main() {
  await mongoose.connect('mongodb+srv://raul321:pass123@cluster0.xjeaj.mongodb.net/MGA'); // Cambia el nombre de la base si es necesario

  // Traer todos los clientes
  const clientes = await Cliente.find();

  // Por cada cliente, buscar beneficiario con el mismo nombre y apellido y enlazar
  for (const cliente of clientes) {
    const beneficiarios = await Beneficiario.find({
      nombre: cliente.nombre,
      apellido: cliente.apellido
    });
    for (const beneficiario of beneficiarios) {
      beneficiario.clienteId = cliente._id;
      await beneficiario.save();
      console.log(`Enlazado beneficiario ${beneficiario.nombre} ${beneficiario.apellido} con cliente ${cliente._id}`);
    }
  }

  await mongoose.disconnect();
  console.log('Enlace completado.');
}

main().catch(err => console.error(err));
