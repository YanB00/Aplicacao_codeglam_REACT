const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const servicoSchema = new Schema({
  salaoId: {
    type: mongoose.Types.ObjectId,
    ref: 'Registro',
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  preco: {
    type: Number,
    required: true,
  },
  comissao: {
    type: Number,
    required: true,
  },
  duracao: {
    type: String,
    required: true,
  },
  descricao: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Ativo', 'Bloqueado', 'Cancelado', 'Desativado'], 
    required: true,
    default: 'Ativo', 
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  }
},{ timestamps: true });

module.exports = mongoose.model('Servico', servicoSchema);