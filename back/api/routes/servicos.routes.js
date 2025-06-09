const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const Servico = require('../models/servico');
const Salao = require('../models/registro'); 

// Rota para criar um novo serviço (POST)
router.post('/', async (req, res) => {
  const { salaoId, titulo, preco, comissao, duracao, descricao, status } = req.body;

  try {
    const novoServico = new Servico({
      salaoId,
      titulo,
      preco,
      comissao,
      duracao,
      descricao,
      status: status || 'Ativo'
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
router.get('/salao/:salaoId', async (req, res) => {
const { salaoId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(salaoId)) {
        console.error('ERRO: ID do salão inválido:', salaoId);
        return res.status(400).json({
            errorStatus: true,
            mensageStatus: `ID do salão inválido: ${salaoId}`,
        });
    }
  const servicos = await Servico.find({ 
    salaoId: new mongoose.Types.ObjectId(salaoId), 
    status: { $in: ['Ativo', 'Bloqueado', 'Cancelado'] } 
});

    const servicosComIdString = servicos.map(servico => ({
        ...servico.toObject(),
        _id: servico._id.toString(),
        idServico: servico._id.toString(),
    }));

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'SERVIÇOS DO SALÃO ENCONTRADOS',
      data: servicosComIdString, 
    });
  } catch (error) {
    console.error('Erro ao buscar serviços do salão:', error);
    if (error.name === 'CastError') {
        return res.status(400).json({
            errorStatus: true,
            mensageStatus: `ID do salão inválido: ${salaoId}`,
            errorObject: error.message,
        });
    }
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS SERVIÇOS DO SALÃO',
      errorObject: error,
    });
  }
});



// Rota para atualizar o status de um serviço (PUT)
router.put('/status/:servicoId', async (req, res) => {
  const { servicoId } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['Ativo', 'Cancelado', 'Bloqueado', 'Desativado']; // Added 'Desativado'
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      errorStatus: true,
      mensageStatus: 'Status inválido fornecido. Os status permitidos são: Ativo, Cancelado, Bloqueado, Desativado.',
    });
  }

  try {
    const servicoAtualizado = await Servico.findByIdAndUpdate(
      servicoId,
      { status: status },
      { new: true }
    );

    if (!servicoAtualizado) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'Serviço não encontrado.',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'STATUS DO SERVIÇO ATUALIZADO COM SUCESSO',
      data: servicoAtualizado,
    });
  } catch (error) {
    console.error('Erro ao atualizar status do serviço:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO ATUALIZAR O STATUS DO SERVIÇO',
      errorObject: error,
    });
  }
});


// Rota para obter um serviço por ID (GET) - CAMINHO MODIFICADO
router.get('/item/:servicoId', async (req, res) => { 
  const { servicoId } = req.params;

  try {
    const servico = await Servico.findById(servicoId); 

    if (!servico) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'Serviço não encontrado.',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'SERVIÇO ENCONTRADO',
      data: servico, 
    });
  } catch (error) {
    console.error('Erro ao buscar serviço por ID:', error);
    if (error.name === 'CastError') {
        return res.status(400).json({
            errorStatus: true,
            mensageStatus: 'ID do serviço inválido.',
            errorObject: error,
        });
    }
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR O SERVIÇO POR ID',
      errorObject: error,
    });
  }
});

// Rota para atualizar um serviço por ID (PUT)
router.put('/item/:servicoId', async (req, res) => {
  const { servicoId } = req.params;
  const { titulo, preco, comissao, duracao, descricao, status, recorrencia } = req.body;

  if (!titulo || preco === undefined || comissao === undefined || !duracao || !descricao || !status) {
    return res.status(400).json({
      errorStatus: true,
      mensageStatus: 'Campos obrigatórios ausentes.',
    });
  }

  try {
    const servicoAtualizado = await Servico.findByIdAndUpdate(
      servicoId,
      {
        titulo,
        preco,
        comissao,
        duracao,
        descricao,
        status,
        recorrencia, 
      },
      { new: true, runValidators: true } 
    );

    if (!servicoAtualizado) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'Serviço não encontrado para atualização.',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'SERVIÇO ATUALIZADO COM SUCESSO',
      data: servicoAtualizado,
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    if (error.name === 'CastError') {
        return res.status(400).json({
            errorStatus: true,
            mensageStatus: 'ID do serviço inválido para atualização.',
            errorObject: error,
        });
    }
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO ATUALIZAR O SERVIÇO',
      errorObject: error,
    });
  }
});

// Rota para "desativar" (soft delete) um serviço por ID (PUT)
router.put('/deactivate/:servicoId', async (req, res) => { 
  const { servicoId } = req.params;

  try {
    const servicoDesativado = await Servico.findByIdAndUpdate(
      servicoId,
      { status: 'Desativado' }, 
      { new: true }
    );

    if (!servicoDesativado) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'Serviço não encontrado para desativação.',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'SERVIÇO DESATIVADO COM SUCESSO',
      data: servicoDesativado,
    });
  } catch (error) {
    console.error('Erro ao desativar serviço:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        errorStatus: true,
        mensageStatus: 'ID do serviço inválido para desativação.',
        errorObject: error,
      });
    }
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO DESATIVAR O SERVIÇO',
      errorObject: error,
    });
  }
});


module.exports = router;
