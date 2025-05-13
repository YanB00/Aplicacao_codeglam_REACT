const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clienteSchema = new Schema({
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
  clienteFrequente: {
    type: Boolean,
    default: false, 
  },
  procedimentosFavoritos: {
    type: [String], 
    default: [],
  },
  beneficios: {
    type: [String], 
    default: [],
  },
  problemasMedicos: {
    type: String,
    default: null,
  },
  informacoesAdicionais: {
    type: String,
    default: null,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Cliente', clienteSchema);