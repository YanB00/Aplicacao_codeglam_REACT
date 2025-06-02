const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agendamentoSchema = new Schema({ 
  salaoId: {
    type: mongoose.Types.ObjectId,
    ref: 'Registro',
    required: true,
  },
  horaInicio: {
    type: String, 
    required: true,
  },
  horaFim: {
    type: String, 
    required: true,
  },
  servicoId: {
    type: mongoose.Types.ObjectId,
    ref: 'Servico',
    required: true,
  },
  clienteId: { 
    type: mongoose.Types.ObjectId,
    ref: 'Cliente',
    required: true,
  },
  funcionarioId: { 
    type: mongoose.Types.ObjectId,
    ref: 'Funcionario', 
    required: true,
  },
  valor: {
    type: Number,
    required: true,
  },
  observacoes: {
    type: String,
  },
  dataAgendamento: { 
    type: Date,
    required: true,
  },
  concluido: {
    type: Boolean,
    default: false,
  },
  cancelado: {
    type: Boolean,
    default: false,
  },

  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Agendamento', agendamentoSchema); 