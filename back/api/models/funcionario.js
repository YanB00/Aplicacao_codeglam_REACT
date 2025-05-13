const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const funcionarioSchema = new Schema({
  nomeCompleto: {
    type: String,
    required: true,
  },
  dataNascimento: {
    type: Date,
    required: Date.now,
  },
  cpf: {
    type: String,
    required: true,
    unique: true,
  },
  idFuncionario: {
    type: String,
    unique: true,
  },
  dataAdmissao: {
    type: Date,
    required: Date.now,
  },
  cargo: {
    type: String,
  },
  beneficios: {
    type: String,
  },
  problemasSaude: {
    type: String,
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
});

module.exports = mongoose.model('Funcionario', funcionarioSchema);