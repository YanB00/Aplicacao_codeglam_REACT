const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const registroFuncionarioSchema = new Schema({
  registroId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registro',
    required: true,
  },
  funcionarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Funcionario',
    required: true,
  },
  status: {
    type: String,
    enum: ['desligado', 'ativo', 'em ferias'],
    required: true,
    default: 'ativo',
  },
  dataVinculo: {
    type: Date,
    default: Date.now,
  },
  observacoes: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model('RegistroFuncionario', registroFuncionarioSchema);