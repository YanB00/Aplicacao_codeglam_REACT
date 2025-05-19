const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const registroSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  nome: { 
    type: String,
    required: true
  },
  empresa: { 
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Por favor, insira um email válido']
  },
  senha: {
    type: String,
    required: true,
    minlength: 10
  },
  telefone: { 
    type: String,
    required: true,
    match: [/^\d{10,11}$/, 'Telefone deve conter DDD e número (10 ou 11 dígitos)']
  },
  dataRegistro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Registro', registroSchema);