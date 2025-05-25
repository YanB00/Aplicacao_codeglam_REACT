const express = require('express');
const router = express.Router();
const Agendamento = require('../models/agendamento'); 

// Rota para criar um novo agendamento (POST)
router.post('/', async (req, res) => {
  const { salaoId, horaInicio, horaFim, servicoId, clienteId, funcionarioId, valor, observacoes, dataAgendamento } = req.body;

  try {
    const novoAgendamento = new Agendamento({
      salaoId,
      horaInicio,
      horaFim,
      servicoId,
      clienteId,
      funcionarioId,
      valor,
      observacoes,
      dataAgendamento,
    });

    const agendamentoSalvo = await novoAgendamento.save();

    return res.status(201).json({
      errorStatus: false,
      mensageStatus: 'AGENDAMENTO CRIADO COM SUCESSO',
      data: agendamentoSalvo,
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return res.status(400).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO CRIAR O AGENDAMENTO',
      errorObject: error,
    });
  }
});

// Rota para obter todos os agendamentos (GET)
router.get('/', async (req, res) => {
  try {
    const agendamentos = await Agendamento.find()
      .populate('salaoId', 'nome') // Popula o salaoId e traz apenas o nome
      .populate('servicoId', 'nome') // Popula o servicoId e traz apenas o nome
      .populate('clienteId', 'nomeCompleto') // Popula o clienteId e traz apenas o nomeCompleto
      .populate('funcionarioId', 'nomeCompleto'); // Popula o funcionarioId e traz apenas o nomeCompleto

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'AGENDAMENTOS ENCONTRADOS',
      data: agendamentos,
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS AGENDAMENTOS',
      errorObject: error,
    });
  }
});

// Rota para obter um agendamento específico pelo ID (GET)
router.get('/:agendamentoId', async (req, res) => {
  const { agendamentoId } = req.params;

  try {
    const agendamento = await Agendamento.findById(agendamentoId)
      .populate('salaoId', 'nome')
      .populate('servicoId', 'nome')
      .populate('clienteId', 'nomeCompleto')
      .populate('funcionarioId', 'nomeCompleto');

    if (!agendamento) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'AGENDAMENTO NÃO ENCONTRADO',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'AGENDAMENTO ENCONTRADO',
      data: agendamento,
    });
  } catch (error) {
    console.error('Erro ao buscar agendamento por ID:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR O AGENDAMENTO',
      errorObject: error,
    });
  }
});

// Rota para atualizar um agendamento existente (PUT)
router.put('/:agendamentoId', async (req, res) => {
  const { agendamentoId } = req.params;
  const { salaoId, horaInicio, horaFim, servicoId, clienteId, funcionarioId, valor, observacoes, dataAgendamento } = req.body;

  try {
    const agendamentoAtualizado = await Agendamento.findByIdAndUpdate(
      agendamentoId,
      { salaoId, horaInicio, horaFim, servicoId, clienteId, funcionarioId, valor, observacoes, dataAgendamento },
      { new: true } // Retorna o documento atualizado
    )
      .populate('salaoId', 'nome')
      .populate('servicoId', 'nome')
      .populate('clienteId', 'nomeCompleto')
      .populate('funcionarioId', 'nomeCompleto');

    if (!agendamentoAtualizado) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'AGENDAMENTO NÃO ENCONTRADO PARA ATUALIZAÇÃO',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'AGENDAMENTO ATUALIZADO COM SUCESSO',
      data: agendamentoAtualizado,
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO ATUALIZAR O AGENDAMENTO',
      errorObject: error,
    });
  }
});

// Rota para deletar um agendamento (DELETE)
router.delete('/:agendamentoId', async (req, res) => {
  const { agendamentoId } = req.params;

  try {
    const agendamentoDeletado = await Agendamento.findByIdAndDelete(agendamentoId);

    if (!agendamentoDeletado) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'AGENDAMENTO NÃO ENCONTRADO PARA DELEÇÃO',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'AGENDAMENTO DELETADO COM SUCESSO',
      data: agendamentoDeletado,
    });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO DELETAR O AGENDAMENTO',
      errorObject: error,
    });
  }
});

// Rota para obter agendamentos por Salão (GET)
router.get('/salao/:salaoId', async (req, res) => {
  const { salaoId } = req.params;

  try {
    const agendamentosSalao = await Agendamento.find({ salaoId })
      .populate('servicoId', 'nome')
      .populate('clienteId', 'nomeCompleto')
      .populate('funcionarioId', 'nomeCompleto');

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'AGENDAMENTOS DO SALÃO ENCONTRADOS',
      data: agendamentosSalao,
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos por salão:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS AGENDAMENTOS DO SALÃO',
      errorObject: error,
    });
  }
});

// Rota para obter agendamentos por Cliente (GET)
router.get('/cliente/:clienteId', async (req, res) => {
  const { clienteId } = req.params;

  try {
    const agendamentosCliente = await Agendamento.find({ clienteId })
      .populate('salaoId', 'nome')
      .populate('servicoId', 'nome')
      .populate('funcionarioId', 'nomeCompleto');

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'AGENDAMENTOS DO CLIENTE ENCONTRADOS',
      data: agendamentosCliente,
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos por cliente:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS AGENDAMENTOS DO CLIENTE',
      errorObject: error,
    });
  }
});

// Rota para obter agendamentos por Funcionário (GET)
router.get('/funcionario/:funcionarioId', async (req, res) => {
  const { funcionarioId } = req.params;

  try {
    const agendamentosFuncionario = await Agendamento.find({ funcionarioId })
      .populate('salaoId', 'nome')
      .populate('servicoId', 'nome')
      .populate('clienteId', 'nomeCompleto');

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'AGENDAMENTOS DO FUNCIONÁRIO ENCONTRADOS',
      data: agendamentosFuncionario,
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos por funcionário:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS AGENDAMENTOS DO FUNCIONÁRIO',
      errorObject: error,
    });
  }
});

// Rota para obter agendamentos por Data (GET)
router.get('/data/:dataAgendamento', async (req, res) => {
  const { dataAgendamento } = req.params;

  try {
    const startOfDay = new Date(dataAgendamento);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dataAgendamento);
    endOfDay.setHours(23, 59, 59, 999);

    const agendamentosData = await Agendamento.find({
      dataAgendamento: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate('salaoId', 'nome')
      .populate('servicoId', 'nome')
      .populate('clienteId', 'nomeCompleto')
      .populate('funcionarioId', 'nomeCompleto');

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'AGENDAMENTOS DA DATA ENCONTRADOS',
      data: agendamentosData,
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos por data:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS AGENDAMENTOS DA DATA',
      errorObject: error,
    });
  }
});

module.exports = router;