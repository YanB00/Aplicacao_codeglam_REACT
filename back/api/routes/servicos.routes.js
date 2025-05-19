const express = require('express');
const router = express.Router();
const Servico = require('../models/servico');
const Salao = require('../models/registro');

// Rota para criar um novo serviço (POST)
router.post('/', async (req, res) => {
  const { salaoId, titulo, preco, comissao, duracao, descricao } = req.body;

  try {
    const novoServico = new Servico({
      salaoId,
      titulo,
      preco,
      comissao,
      duracao,
      descricao,
    });

    const servicoSalvo = await novoServico.save();

    return res.status(201).json({
      errorStatus: false,
      mensageStatus: 'SERVIÇO CADASTRADO COM SUCESSO',
      data: servicoSalvo,
    });
  } catch (error) {
    console.error('Erro ao cadastrar serviço:', error);
    return res.status(400).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO CADASTRAR O SERVIÇO',
      errorObject: error,
    });
  }
});

// Rota para obter todos os serviços de um salão específico (GET)
router.get('/servicos/:salaoId', async (req, res) => {
  const { salaoId } = req.params;

  try {
    const servicos = await Servico.find({ salaoId });

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'SERVIÇOS DO SALÃO ENCONTRADOS',
      data: servicos,
    });
  } catch (error) {
    console.error('Erro ao buscar serviços do salão:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS SERVIÇOS DO SALÃO',
      errorObject: error,
    });
  }
});

module.exports = router;