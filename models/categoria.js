const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const categoriaSchema = new Schema({
  nombre: {
    type: String,
    unique: true,
    required: [true, 'El nombre es necesario']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es necesaria']
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario es necesario']
  }
});

categoriaSchema.plugin(uniqueValidator, {message: '{PATH} debe ser único'});

module.exports = mongoose.model('Categoria', categoriaSchema);