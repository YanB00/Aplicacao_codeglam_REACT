const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loginSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Por favor, insira um email válido']
  },
  senha: {
    type: String,
    required: true,
    minlength: 10
  }
});

module.exports = mongoose.model('Login', loginSchema);