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
  idCliente: {
    type: String,
    unique: true,
  },
  dataCadastro: { 
    type: Date,
    default: Date.now,
  },
  favoritos: { 
    type: [String],
    default: [],
  },
  problemasSaude: { 
    type: String,
    default: null,
  },
  informacoesAdicionais: {
    type: String,
    default: null,
  },
  telefone: {
    type: String,
  },
  email: {
    type: String,
  }
});

module.exports = mongoose.model('Cliente', clienteSchema);