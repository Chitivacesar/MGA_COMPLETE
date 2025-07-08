// Script para asignar clienteId a beneficiarios que lo tienen en null
// Ejecuta este script con: node backend/scripts/fix_beneficiarios_clienteId.js

const mongoose = require('mongoose');
const Beneficiario = require('../models/Beneficiario');
const Cliente = require('../models/Cliente');

const MONGO_URI = 'mongodb://localhost:27017/TU_BASE_DE_DATOS'; // Cambia TU_BASE_DE_DATOS por el nombre real

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Conectado a MongoDB');

  // Buscar beneficiarios sin clienteId
  const beneficiariosSinCliente = await Beneficiario.find({ clienteId: null });
  console.log(`Beneficiarios sin clienteId: ${beneficiariosSinCliente.length}`);

  for (const b of beneficiariosSinCliente) {
    // Buscar cliente por documento, nombre, etc. (ajusta la lógica según tus datos)
    // Buscar por documento primero, si existe
    let cliente = null;
    if (b.numero_de_documento) {
      cliente = await Cliente.findOne({ numeroDocumento: b.numero_de_documento });
    }
    // Si no lo encuentra por documento, buscar por nombre y apellido
    if (!cliente) {
      cliente = await Cliente.findOne({
        nombre: b.nombre,
        apellido: b.apellido
      });
    }
    if (cliente) {
      b.clienteId = cliente._id;
      await b.save();
      console.log(`Actualizado beneficiario ${b._id} con clienteId ${cliente._id}`);
    } else {
      console.log(`No se encontró cliente para beneficiario ${b._id}`);
    }
  }

  await mongoose.disconnect();
  console.log('Listo.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
