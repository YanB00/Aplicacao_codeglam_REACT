const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const funcionarioServicoSchema = new Schema({
  funcionarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Funcionario',
    required: true,
  },
  servicoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servico',
    required: true,
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

module.exports = mongoose.model('FuncionarioServico', funcionarioServicoSchema);