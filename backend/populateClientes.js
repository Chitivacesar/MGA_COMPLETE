const mongoose = require('mongoose');
const Cliente = require('./models/Cliente');

const clientes = [
  { nombre: 'Xiomara', apellido: 'Agudelo', numero_de_documento: '10000001', telefono: '3001111111', email: 'xiomara@mail.com', direccion: 'Calle 1', fechaDeNacimiento: '1990-01-01' },
  { nombre: 'Carlos', apellido: 'Martínez', numero_de_documento: '10000002', telefono: '3002222222', email: 'carlos@mail.com', direccion: 'Calle 2', fechaDeNacimiento: '1985-02-02' },
  { nombre: 'Juan', apellido: 'Pérez', numero_de_documento: '10000003', telefono: '3003333333', email: 'juan@mail.com', direccion: 'Calle 3', fechaDeNacimiento: '1992-03-03' },
  { nombre: 'Laura', apellido: 'Gómez', numero_de_documento: '10000004', telefono: '3004444444', email: 'laura@mail.com', direccion: 'Calle 4', fechaDeNacimiento: '1995-04-04' },
  { nombre: 'Mariana', apellido: 'Ruiz', numero_de_documento: '10000005', telefono: '3005555555', email: 'mariana@mail.com', direccion: 'Calle 5', fechaDeNacimiento: '1998-05-05' }
];

async function main() {
  await mongoose.connect('mongodb://localhost:27017/tu_basededatos'); // Cambia el nombre de la base de datos si es necesario
  await Cliente.deleteMany({});
  const insertados = await Cliente.insertMany(clientes);
  console.log('Clientes insertados:', insertados);
  await mongoose.disconnect();
}

main().catch(err => console.error(err));
