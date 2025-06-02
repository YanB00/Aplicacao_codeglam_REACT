const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const funcionarioSchema = new Schema({
  nomeCompleto: {
    type: String,
    required: true,
  },
  dataNascimento: {
    type: Date,
    required: true, 
  },
  cpf: {
    type: String,
    required: true,
    unique: true,
  },
  dataAdmissao: {
    type: Date,
    required: true, 
  },
  servicosRealizados: {
    type: [String],
    default: [],
  },
  beneficios: {
    type: [String],
    default: [],
  },
  informacoesAdicionais: {
    type: String,
  },
  telefone: {
    type: String,
  },
  email: {
    type: String,
  },
  foto: {
    type: String,
    default: null,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true, 
  },
  salaoId: {
    type: mongoose.Types.ObjectId,
    ref: 'Registro', 
    required: true, 
  },
});

module.exports = mongoose.model('Funcionario', funcionarioSchema);