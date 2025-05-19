const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clienteRegistroSchema = new Schema({
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
  },
  registroId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registro',
    required: true,
  },
  status: {
    type: String,
    enum: ['Ativo', 'Inativo', 'Pendente'],
    required: true,
    default: 'Ativo',
  },
  dataVinculo: {
    type: Date,
    default: Date.now,
  },
  informacoesAdicionais: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model('ClienteRegistro', clienteRegistroSchema);