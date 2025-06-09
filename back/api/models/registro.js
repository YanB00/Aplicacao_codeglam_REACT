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
  },
  horariosFuncionamento: { 
      type: Object, 
      default: {
          segunda: { abre: '09:00', fecha: '18:00', ativo: true },
          terca:   { abre: '09:00', fecha: '18:00', ativo: true },
          quarta:  { abre: '09:00', fecha: '18:00', ativo: true },
          quinta:  { abre: '09:00', fecha: '18:00', ativo: true },
          sexta:   { abre: '09:00', fecha: '18:00', ativo: true },
          sabado:  { abre: '09:00', fecha: '13:00', ativo: true },
          domingo: { abre: '00:00', fecha: '00:00', ativo: false } 
      }
  },
  modulosAtivos: { 
      type: Object, 
      default: {
          clientes: true,
          funcionarios: true,
          servicos: true,
          agenda: true,
          historico: true,
      }
  },
}, { timestamps: true });

module.exports = mongoose.model('Registro', registroSchema);

