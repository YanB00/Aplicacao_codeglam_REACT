const express = require('express');
const router = express.Router();
const Cliente = require('../models/cliente');

// Rota para criar um novo cliente (POST)
router.post('/', async (req, res) => {
  const { nomeCompleto, dataNascimento, cpf, telefone, email, favoritos, problemasSaude, informacoesAdicionais } = req.body;

  try {
    const novoCliente = new Cliente({
      nomeCompleto,
      dataNascimento,
      cpf,
      telefone,
      email,
      favoritos,
      problemasSaude,
      informacoesAdicionais,
    });

    const clienteSalvo = await novoCliente.save();

    return res.status(201).json({
      errorStatus: false,
      mensageStatus: 'CLIENTE CADASTRADO COM SUCESSO',
      data: { ...clienteSalvo.toObject(), idCliente: clienteSalvo._id.toString() },
    });
  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error);
    return res.status(400).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO CADASTRAR O CLIENTE',
      errorObject: error,
    });
  }
});

// Rota para obter todos os clientes (GET)
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find();

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'CLIENTES ENCONTRADOS',
      data: clientes,
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS CLIENTES',
      errorObject: error,
    });
  }
});

// Rota para obter um cliente específico pelo ID (GET)
router.get('/:idCliente', async (req, res) => {
  const { idCliente } = req.params;

  try {
    const cliente = await Cliente.findById(idCliente); // Use findById para buscar pelo _id

    if (!cliente) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'CLIENTE NÃO ENCONTRADO',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'CLIENTE ENCONTRADO',
      data: { ...cliente.toObject(), idCliente: cliente._id.toString() }, // Retornamos o _id como idCliente
    });
  } catch (error) {
    console.error('Erro ao buscar cliente por ID:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR O CLIENTE',
      errorObject: error,
    });
  }
});

// Rota para atualizar um cliente existente (PUT)
router.put('/:idCliente', async (req, res) => {
  const { idCliente } = req.params;
  const { nomeCompleto, dataNascimento, telefone, email, favoritos, problemasSaude, informacoesAdicionais } = req.body;

  try {
    const clienteAtualizado = await Cliente.findByIdAndUpdate( // Use findByIdAndUpdate
      idCliente,
      { nomeCompleto, dataNascimento, telefone, email, favoritos, problemasSaude, informacoesAdicionais },
      { new: true }
    );

    if (!clienteAtualizado) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'CLIENTE NÃO ENCONTRADO PARA ATUALIZAÇÃO',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'CLIENTE ATUALIZADO COM SUCESSO',
      data: { ...clienteAtualizado.toObject(), idCliente: clienteAtualizado._id.toString() }, // Retornamos o _id como idCliente
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO ATUALIZAR O CLIENTE',
      errorObject: error,
    });
  }
});

// Rota para deletar um cliente (DELETE)
router.delete('/:idCliente', async (req, res) => {
  const { idCliente } = req.params;

  try {
    const clienteDeletado = await Cliente.findByIdAndDelete(idCliente); // Use findByIdAndDelete

    if (!clienteDeletado) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'CLIENTE NÃO ENCONTRADO PARA DELEÇÃO',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'CLIENTE DELETADO COM SUCESSO',
      data: { ...clienteDeletado.toObject(), idCliente: clienteDeletado._id.toString() }, // Retornamos o _id como idCliente
    });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO DELETAR O CLIENTE',
      errorObject: error,
    });
  }
});
// Rota para vincular um cliente a um registro (POST)
router.post('/registro', async (req, res) => {
  const { clienteId, registroId, status, informacoesAdicionais } = req.body;

  try {
    const novoClienteRegistro = new ClienteRegistro({
      clienteId,
      registroId,
      status,
      informacoesAdicionais,
    });

    const clienteRegistroSalvo = await novoClienteRegistro.save();

    return res.status(201).json({
      errorStatus: false,
      mensageStatus: 'VÍNCULO CLIENTE-REGISTRO CRIADO COM SUCESSO',
      data: clienteRegistroSalvo,
    });
  } catch (error) {
    console.error('Erro ao criar vínculo cliente-registro:', error);
    return res.status(400).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO CRIAR O VÍNCULO CLIENTE-REGISTRO',
      errorObject: error,
    });
  }
});

// Rota para obter todos os vínculos cliente-registro (GET)
router.get('/registro', async (req, res) => {
  try {
    const clientesRegistros = await ClienteRegistro.find().populate('clienteId').populate('registroId');

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'VÍNCULOS CLIENTE-REGISTRO ENCONTRADOS',
      data: clientesRegistros,
    });
  } catch (error) {
    console.error('Erro ao buscar vínculos cliente-registro:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS VÍNCULOS CLIENTE-REGISTRO',
      errorObject: error,
    });
  }
});

// Rota para obter registros de um cliente específico (GET)
router.get('/registro/cliente/:clienteId', async (req, res) => {
  const { clienteId } = req.params;

  try {
    const registrosDoCliente = await ClienteRegistro.find({ clienteId }).populate('clienteId').populate('registroId');

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'REGISTROS DO CLIENTE ENCONTRADOS',
      data: registrosDoCliente,
    });
  } catch (error) {
    console.error('Erro ao buscar registros do cliente:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS REGISTROS DO CLIENTE',
      errorObject: error,
    });
  }
});

// Rota para obter clientes de um registro específico (GET)
router.get('/registro/registro/:registroId', async (req, res) => {
  const { registroId } = req.params;

  try {
    const clientesDoRegistro = await ClienteRegistro.find({ registroId }).populate('clienteId').populate('registroId');

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'CLIENTES DO REGISTRO ENCONTRADOS',
      data: clientesDoRegistro,
    });
  } catch (error) {
    console.error('Erro ao buscar clientes do registro:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS CLIENTES DO REGISTRO',
      errorObject: error,
    });
  }
});

// Rota para atualizar o status de um vínculo cliente-registro (PUT)
router.put('/registro/:clienteRegistroId', async (req, res) => {
  const { clienteRegistroId } = req.params;
  const { status, informacoesAdicionais } = req.body;

  try {
    const clienteRegistroAtualizado = await ClienteRegistro.findByIdAndUpdate(
      clienteRegistroId,
      { status, informacoesAdicionais },
      { new: true }
    ).populate('clienteId').populate('registroId');

    if (!clienteRegistroAtualizado) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'VÍNCULO CLIENTE-REGISTRO NÃO ENCONTRADO PARA ATUALIZAÇÃO',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'VÍNCULO CLIENTE-REGISTRO ATUALIZADO COM SUCESSO',
      data: clienteRegistroAtualizado,
    });
  } catch (error) {
    console.error('Erro ao atualizar vínculo cliente-registro:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO ATUALIZAR O VÍNCULO CLIENTE-REGISTRO',
      errorObject: error,
    });
  }
});

// Rota para remover um vínculo cliente-registro (DELETE)
router.delete('/registro/:clienteRegistroId', async (req, res) => {
  const { clienteRegistroId } = req.params;

  try {
    const clienteRegistroDeletado = await ClienteRegistro.findByIdAndDelete(clienteRegistroId).populate('clienteId').populate('registroId');

    if (!clienteRegistroDeletado) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'VÍNCULO CLIENTE-REGISTRO NÃO ENCONTRADO PARA DELEÇÃO',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'VÍNCULO CLIENTE-REGISTRO REMOVIDO COM SUCESSO',
      data: clienteRegistroDeletado,
    });
  } catch (error) {
    console.error('Erro ao remover vínculo cliente-registro:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO REMOVER O VÍNCULO CLIENTE-REGISTRO',
      errorObject: error,
    });
  }
});

module.exports = router;