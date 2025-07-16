const mongoose = require('mongoose');

const beneficiarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
  tipo_de_documento: {
    type: String,
    required: true
  },
  numero_de_documento: {
    type: String,
    required: true,
    unique: true
  },
  telefono: {
    type: String,
    required: true
  },
  direccion: {
    type: String,
    required: true
  },
  fechaDeNacimiento: {
    type: Date,
    required: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  clienteId: {
    type: String,
    required: true
  },
  usuario_has_rolId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
}, {
  collection: 'beneficiarios',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: [
        'nombre',
        'apellido',
        'tipo_de_documento',
        'numero_de_documento',
        'telefono',
        'direccion',
        'fechaDeNacimiento'
      ],
      properties: {
        nombre: {
          bsonType: 'string'
        },
        apellido: {
          bsonType: 'string'
        },
        tipo_de_documento: {
          bsonType: 'string'
        },
        numero_de_documento: {
          bsonType: 'string'
        },
        telefono: {
          bsonType: 'string'
        },
        direccion: {
          bsonType: 'string'
        },
        fechaDeNacimiento: {
          bsonType: 'date'
        },
        fechaRegistro: {
          bsonType: 'date'
        },
        clienteId: {
          bsonType: 'string'
        },
        usuario_has_rolId: {
          bsonType: 'objectId'
        }
      }
    }
  }
});

module.exports = mongoose.model('Beneficiario', beneficiarioSchema);