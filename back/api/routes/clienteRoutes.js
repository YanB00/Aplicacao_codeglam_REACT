const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Cliente = require('../models/cliente');
const SalaoCliente = require('../models/relationship/salaoCliente');
const moment = require('moment');

router.post('/', async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {
    const { nomeCompleto, dataNascimento, cpf, clienteFrequente, procedimentosFavoritos, beneficios, problemasMedicos, informacoesAdicionais, salaoId } = req.body;
    let newClient = null;

    // Validação básica dos campos (você pode adicionar mais validações)
    if (!nomeCompleto || !dataNascimento) {
      return res.status(400).json({ error: true, message: 'Nome completo e data de nascimento são obrigatórios.' });
    }

    const existentClient = await Cliente.findOne({
      $or: [
        { cpf }, // Agora considerando o CPF como um identificador único
      ],
    });

    if (!existentClient) {
      const _id = mongoose.Types.ObjectId();
      newClient = await new Cliente({
        _id,
        nome: nomeCompleto, // Adaptando para o campo 'nome' no modelo Cliente
        dataNascimento: moment(dataNascimento, 'DD/MM/YYYY').toDate(), // Convertendo para objeto Date
        cpf,
        clienteFrequente: clienteFrequente === 'Sim', // Convertendo "Sim/Não" para booleano
        procedimentosFavoritos,
        beneficios,
        problemasMedicos,
        informacoesAdicionais,
      }).save({ session });
    }

    const clienteId = existentClient ? existentClient._id : newClient._id;

    const existentRelationship = await SalaoCliente.findOne({
      salaoId,
      clienteId,
    });

    if (!existentRelationship) {
      await new SalaoCliente({
        salaoId,
        clienteId,
      }).save({ session });
    } else if (existentRelationship.status === 'I') {
      await SalaoCliente.findOneAndUpdate(
        { salaoId, clienteId },
        { status: 'A' },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    if (existentRelationship && existentRelationship.status === 'A' && existentClient) {
      res.json({ error: true, message: 'Cliente já cadastrado!' });
    } else {
      res.json({ error: false });
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: true, message: err.message });
  }
});

router.post('/filter', async (req, res) => {
  try {
    const clientes = await Cliente.find(req.body.filters);
    res.json({ error: false, clientes });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

router.get('/salao/:salaoId', async (req, res) => {
  try {
    const clientes = await SalaoCliente.find({
      salaoId: req.params.salaoId,
      status: 'A',
    })
      .populate('clienteId')
      .select('clienteId');

    res.json({
      error: false,
      clientes: clientes.map((c) => ({
        ...c.clienteId._doc,
        vinculoId: c._id,
        dataCadastro: moment(c.dataCadastro).format('DD/MM/YYYY'),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

router.delete('/vinculo/:id', async (req, res) => {
  try {
    await SalaoCliente.findByIdAndUpdate(req.params.id, { status: 'I' });
    res.json({ error: false });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

module.exports = router;