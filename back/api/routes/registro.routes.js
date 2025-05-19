const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Para hashear a senha
const Register = require('../models/registro');

router.post('/register', async (req, res) => {
  const { nome, empresa, telefone, email, senha } = req.body; // Destructuring direto

  try {
    // Verificar se o email já existe
    const salaoExistente = await Register.findOne({ email });
    if (salaoExistente) {
      return res.status(409).json({
        errorStatus: true,
        mensageStatus: 'Este e-mail já está cadastrado.',
      });
    }

    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const novoSalao = new Register({
      nome,
      empresa,
      telefone,
      email,
      senha: senhaHash,
    });

    const registroSalvo = await novoSalao.save();

    return res.status(201).json({
      errorStatus: false,
      mensageStatus: 'SALÃO REGISTRADO COM SUCESSO',
      data: {
        _id: registroSalvo._id,
        nome: registroSalvo.nome,
        empresa: registroSalvo.empresa,
        email: registroSalvo.email,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar salão:', error);
    return res.status(400).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO REGISTRAR O SALÃO',
      errorObject: error,
    });
  }
});

module.exports = router;