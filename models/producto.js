const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productoSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es necesario']
  },
  precioUni: {
    type: Number,
    required: [true, 'El precio es necesario']
  },
  descripcion: {
    type: String,
    required: false
  },
  disponible: {
    type: Boolean,
    required: false,
    default: true
  },
  categoria: {
    type: Schema.Types.ObjectId,
    ref: 'Categoria'
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario'
  }
});

module.exports = mongoose.model('Producto', productoSchema);