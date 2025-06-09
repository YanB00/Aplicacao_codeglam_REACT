const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Register = require('../models/registro'); 

router.post('/', async (req, res) => { 
  const { email, senha } = req.body;

  try {
    const usuario = await Register.findOne({ email });

    if (!usuario) {
      return res.status(401).json({ errorStatus: true, mensageStatus: 'Usuário não encontrado' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ errorStatus: true, mensageStatus: 'Senha incorreta' });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'Login bem-sucedido',
      data: {
        _id: usuario._id,
        nome: usuario.nome,
        empresa: usuario.empresa,
        email: usuario.email,
      },
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ errorStatus: true, mensageStatus: 'Erro interno no servidor' });
  }
});

module.exports = router;