const mongoose = require('mongoose');
const Cliente = require('../models/Cliente');

const clientes = [
  {
    nombre: 'Juan',
    apellido: 'Pérez',
    tipoDocumento: 'CC',
    numeroDocumento: '1022145793',
    telefono: '3207845449',
    correo: 'juan.perez@mail.com',
    direccion: 'Calle 1',
    fechaNacimiento: new Date('1990-01-01'),
    estado: true
  },
  {
    nombre: 'Laura',
    apellido: 'Gómez',
    tipoDocumento: 'CC',
    numeroDocumento: '1022145794',
    telefono: '3207845448',
    correo: 'laura.gomez@mail.com',
    direccion: 'Calle 2',
    fechaNacimiento: new Date('1992-02-02'),
    estado: true
  },
  {
    nombre: 'Carlos',
    apellido: 'Martínez',
    tipoDocumento: 'TI',
    numeroDocumento: '3216484190',
    telefono: '3002484601',
    correo: 'carlos.martinez@mail.com',
    direccion: 'Calle 3',
    fechaNacimiento: new Date('2000-03-03'),
    estado: true
  },
  {
    nombre: 'Xiomara',
    apellido: 'Agudelo',
    tipoDocumento: 'CC',
    numeroDocumento: '1022145795',
    telefono: '3207845447',
    correo: 'xiomara.agudelo@mail.com',
    direccion: 'Calle 4',
    fechaNacimiento: new Date('1995-04-04'),
    estado: true
  },
  {
    nombre: 'Mariana',
    apellido: 'Ruiz',
    tipoDocumento: 'CC',
    numeroDocumento: '1022145796',
    telefono: '3207845446',
    correo: 'mariana.ruiz@mail.com',
    direccion: 'Calle 5',
    fechaNacimiento: new Date('1998-05-05'),
    estado: true
  }
];

async function main() {
  await mongoose.connect('mongodb+srv://raul321:pass123@cluster0.xjeaj.mongodb.net/MGA'); // Cambia el nombre de la base si es necesario
  await Cliente.deleteMany({});
  const insertados = await Cliente.insertMany(clientes);
  console.log('Clientes insertados:', insertados);
  await mongoose.disconnect();
}

main().catch(err => console.error(err));
