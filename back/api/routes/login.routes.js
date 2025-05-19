const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Login = require('../models/login'); // Ajuste o caminho se necessário

// Rota para registrar um novo usuário (POST)
router.post('/registrar', async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Verificar se o email já existe
    const usuarioExistente = await Login.findOne({ email });
    if (usuarioExistente) {
      return res.status(409).json({ errorStatus: true, mensageStatus: 'Este email já está cadastrado.' });
    }

    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    // Criar um novo usuário
    const novoLogin = new Login({
      email,
      senha: senhaCriptografada,
    });

    // Salvar o novo usuário no banco de dados
    const usuarioSalvo = await novoLogin.save();

    return res.status(201).json({
      errorStatus: false,
      mensageStatus: 'Usuário registrado com sucesso!',
      data: { email: usuarioSalvo.email }, // Não retorne a senha
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'Houve um erro ao registrar o usuário.',
      errorObject: error,
    });
  }
});

// Rota para fazer login (POST)
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Verificar se o email existe
    const usuario = await Login.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ errorStatus: true, mensageStatus: 'Credenciais inválidas.' });
    }

    // Comparar a senha fornecida com a senha criptografada no banco de dados
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ errorStatus: true, mensageStatus: 'Credenciais inválidas.' });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'Login realizado com sucesso!',
      data: { email: usuario.email }, // Pode incluir um token aqui
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'Houve um erro ao fazer login.',
      errorObject: error,
    });
  }
});

module.exports = router;