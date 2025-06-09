const express = require('express');
const router = express.Router();
const Cliente = require('../models/cliente'); 
const ClienteRegistro = require('../models/relationship/clienteRegistro');
const multer = require('multer'); 
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs'); 

const uploadDir = 'uploads/client_photos/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp|avif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Apenas imagens (jpeg, jpg, png, gif, webp, avif) são permitidas!'));
    }
});

router.use((req, res, next) => {
  console.log('CLIENTES ROUTES - Requisição recebida:', req.method, req.originalUrl);
  next();
});

//Salão pelo ID (GET)
router.get('/salao/:salaoId', async (req, res) => {
    const { salaoId } = req.params;
    console.log('--- BACKEND CLIENTES (GET por SalaoId) ---');
    console.log('    SalaoId recebido (req.params.salaoId):', salaoId);

    try {
        if (!mongoose.Types.ObjectId.isValid(salaoId)) {
            console.error('    ERRO: ID do salão inválido:', salaoId);
            return res.status(400).json({
                errorStatus: true,
                mensageStatus: `ID do salão inválido: ${salaoId}`,
            });
        }

        const clientes = await Cliente.find({ salaoId: new mongoose.Types.ObjectId(salaoId), active: true });

        const clientesComIdString = clientes.map(cliente => ({
            ...cliente.toObject(),
            _id: cliente._id.toString(),
        }));

        console.log('    Clientes encontrados para o salão:', clientesComIdString.length);

        return res.status(200).json({
            errorStatus: false,
            mensageStatus: 'CLIENTES DO SALÃO ENCONTRADOS',
            data: clientesComIdString,
        });

    } catch (error) {
        console.error('    ERRO (CATCH) ao buscar clientes por salão:', error.message);
        console.error('    Stack Trace:', error.stack);
        return res.status(500).json({
            errorStatus: true,
            mensageStatus: 'Houve um erro interno ao buscar os clientes do salão.',
            errorObject: error.message,
        });
    }
});


// Rota para obter todos os clientes ATIVOS (GET)
router.get('/listClientes', async (req, res) => {
  console.log('CLIENTES ROUTES - GET / - Listando todos os clientes ATIVOS');
  try {
    // Busca apenas clientes com 'active: true'
    const clientes = await Cliente.find({ active: true }); 
    console.log('CLIENTES ROUTES - GET / - Clientes encontrados:', clientes);

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'CLIENTES ATIVOS ENCONTRADOS',
      data: clientes,
    });
  } catch (error) {
    console.error('CLIENTES ROUTES - GET / - Erro ao buscar clientes:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS CLIENTES',
      errorObject: error,
    });
  }
});

// Rota para obter um cliente específico por ID (apenas se estiver ATIVO)
router.get('/:idCliente', async (req, res) => {
  const { idCliente } = req.params;
  console.log('CLIENTES ROUTES - GET /:idCliente - ID:', idCliente);

  try {
    // Busca o cliente por ID e verifica se está ativo
    const cliente = await Cliente.findOne({ _id: idCliente, active: true }); 

    if (!cliente) {
      console.log('CLIENTES ROUTES - GET /:idCliente - Cliente não encontrado ou inativo:', idCliente);
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'CLIENTE NÃO ENCONTRADO OU INATIVO',
      });
    }

    console.log('CLIENTES ROUTES - GET /:idCliente - Cliente encontrado:', cliente);
    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'CLIENTE ENCONTRADO',
      data: { ...cliente.toObject(), idCliente: cliente._id.toString() },
    });
  } catch (error) {
    console.error('CLIENTES ROUTES - GET /:idCliente - Erro ao buscar cliente por ID:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR O CLIENTE',
      errorObject: error,
    });
  }
});

// Rota para criar um novo cliente (POST)
router.post('/', upload.single('foto'), async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({
      errorStatus: true,
      mensageStatus: req.fileValidationError,
    });
  }

  const { nomeCompleto, dataNascimento, cpf, telefone, email, favoritos, problemasSaude, informacoesAdicionais, salaoId } = req.body;
  const fotoPath = req.file ? req.file.path : null;

  const cleanedCpf = cpf ? cpf.replace(/\D/g, '') : null;

  try {
    const novoCliente = new Cliente({
      nomeCompleto,
      dataNascimento,
      cpf: cleanedCpf, 
      telefone,
      email,
      favoritos: Array.isArray(favoritos) ? favoritos : (favoritos ? favoritos.split(',').map(s => s.trim()).filter(s => s !== '') : []),
      problemasSaude,
      informacoesAdicionais,
      foto: fotoPath,
      salaoId
    });

    const clienteSalvo = await novoCliente.save();
    return res.status(201).json({
      errorStatus: false,
      mensageStatus: 'CLIENTE CADASTRADO COM SUCESSO',
      data: { ...clienteSalvo.toObject(), idCliente: clienteSalvo._id.toString() }, 
    });

  } catch (error) {
    console.error('CLIENTES ROUTES - POST / - Erro ao cadastrar cliente:', error);
    if (error.code === 11000) {
        return res.status(409).json({
            errorStatus: true,
            mensageStatus: 'CPF JÁ CADASTRADO. Por favor, verifique os dados.',
            errorObject: error,
        });
    } else if (error.name === 'ValidationError') { 
        const errors = Object.keys(error.errors).map(key => error.errors[key].message);
        return res.status(400).json({
            errorStatus: true,
            mensageStatus: 'ERRO DE VALIDAÇÃO: ' + errors.join(', '),
            errorObject: error,
        });
    } else {
        return res.status(400).json({ 
            errorStatus: true,
            mensageStatus: 'HOUVE UM ERRO AO CADASTRAR O CLIENTE',
            errorObject: error,
        });
    }
  }
});

// Rota para atualizar um cliente existente (PUT)
router.put('/:idCliente', upload.single('foto'), async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({
      errorStatus: true,
      mensageStatus: req.fileValidationError,
    });
  }
  console.log('--- CLIENTES ROUTES - PUT /:idCliente - START ---');
  const { idCliente } = req.params; 
  console.log('ID Cliente (param):', idCliente);
  console.log('Request Body:', req.body);
  console.log('Uploaded File (req.file):', req.file);

  if (req.fileValidationError) {
    console.error('File Validation Error:', req.fileValidationError);
    return res.status(400).json({ errorStatus: true, mensageStatus: req.fileValidationError });
  }

  const { nomeCompleto, dataNascimento, cpf, telefone, email, favoritos, problemasSaude, informacoesAdicionais, salaoId, fotoExistente } = req.body; // <-- fotoExistente is read from req.body
  let fotoPath = req.file ? req.file.path : null; 

  const updateData = {
    nomeCompleto,
    dataNascimento,
    cpf: cpf ? cpf.replace(/\D/g, '') : undefined,
    telefone: telefone ? telefone.replace(/\D/g, '') : undefined,
    email,
    favoritos: favoritos ? (Array.isArray(favoritos) ? favoritos : favoritos.split(',').map(s => s.trim()).filter(s => s !== '')) : [],
    problemasSaude,
    informacoesAdicionais,
  };

  if (fotoPath) {
    updateData.foto = fotoPath.replace(/\\/g, '/'); 
  } else if (fotoExistente) {
    updateData.foto = fotoExistente.replace('http://localhost:3000/', '').replace(/\\/g, '/'); 
  } else {
  }
  console.log('Update Data object:', updateData);

  try {
    if (!mongoose.Types.ObjectId.isValid(idCliente)) {
        console.error('Invalid idCliente for update:', idCliente);
        return res.status(400).json({
            errorStatus: true,
            mensageStatus: `ID do cliente inválido: ${idCliente}`,
        });
    }

    const clienteAtualizado = await Cliente.findByIdAndUpdate(
        idCliente,
        updateData,
        { new: true, runValidators: true }
    );

    if (!clienteAtualizado) {
      console.log('CLIENTES ROUTES - PUT /:idCliente - Cliente não encontrado para atualização:', idCliente);
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'CLIENTE NÃO ENCONTRADO PARA ATUALIZAÇÃO',
      });
    }

    console.log('CLIENTES ROUTES - PUT /:idCliente - Cliente atualizado com sucesso:', clienteAtualizado);
    return res.status(200).json({ 
      errorStatus: false,
      mensageStatus: 'CLIENTE ATUALIZADO COM SUCESSO',
      data: { ...clienteAtualizado.toObject(), idCliente: clienteAtualizado._id.toString() },
    });

  } catch (error) {
    console.error('CLIENTES ROUTES - PUT /:idCliente - Erro (CATCH) ao atualizar cliente:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => error.errors[key].message);
      return res.status(400).json({
        errorStatus: true,
        mensageStatus: 'ERRO DE VALIDAÇÃO: ' + errors.join(', '),
        validationErrors: error.errors,
        errorObject: error,
      });
    }
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO ATUALIZAR O CLIENTE',
      errorObject: error,
    });
  }
});

// Rota para DESATIVAR (soft delete) um cliente (PUT)
router.put('/deactivate/:idCliente', async (req, res) => {
  const { idCliente } = req.params;
  console.log('CLIENTES ROUTES - PUT /deactivate/:idCliente - Desativando cliente com ID:', idCliente);

  try {
    const clienteDesativado = await Cliente.findByIdAndUpdate(
      idCliente,
      { active: false }, 
      { new: true }
    );

    if (!clienteDesativado) {
      console.log('CLIENTES ROUTES - PUT /deactivate/:idCliente - Cliente não encontrado para desativação:', idCliente);
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'CLIENTE NÃO ENCONTRADO PARA DESATIVAÇÃO',
      });
    }

    console.log('CLIENTES ROUTES - PUT /deactivate/:idCliente - Cliente desativado com sucesso:', clienteDesativado);
    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'CLIENTE DESATIVADO COM SUCESSO',
      data: { ...clienteDesativado.toObject(), idCliente: clienteDesativado._id.toString() }, 
    });
  } catch (error) {
    console.error('CLIENTES ROUTES - PUT /deactivate/:idCliente - Erro ao desativar cliente:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO DESATIVAR O CLIENTE',
      errorObject: error,
    });
  }
});

router.get('/birthdays/currentMonth/:salaoId', async (req, res) => {
  const { salaoId } = req.params;
  console.log('CLIENTES ROUTES - GET /birthdays/currentMonth/:salaoId - Buscando aniversariantes do mês atual para o salão:', salaoId);

  const currentMonth = new Date().getMonth() + 1; // getMonth() é 0-indexado, então +1 para mês real

  try {
    // Filtra clientes que estão ATIVOS e pertencem ao salaoId fornecido
    const birthdayClients = await Cliente.aggregate([
      {
        $match: {
          active: true,
          salaoId: new mongoose.Types.ObjectId(salaoId), // <--- FILTRA POR SALAOID
          $expr: {
            $eq: [{ $month: '$dataNascimento' }, currentMonth]
          }
        }
      },
      {
        $project: {
          _id: 1,
          nomeCompleto: 1,
          foto: 1,
          dataNascimento: 1,
          email: 1,
          telefone: 1,
          favoritos: 1,
          problemasSaude: 1,
          informacoesAdicionais: 1,
          since: "$createdAt"
        }
      }
    ]);

    console.log('CLIENTES ROUTES - GET /birthdays/currentMonth/:salaoId - Aniversariantes encontrados:', birthdayClients.length);

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'ANIVERSARIANTES DO MÊS DO SALÃO ENCONTRADOS',
      data: birthdayClients,
    });
  } catch (error) {
    console.error('CLIENTES ROUTES - GET /birthdays/currentMonth/:salaoId - Erro ao buscar aniversariantes por salão:', error);
    // Verifique se o erro é de CastError para ObjectId inválido
    if (error.name === 'CastError') {
      return res.status(400).json({
        errorStatus: true,
        mensageStatus: `ID do salão inválido: ${salaoId}`,
        errorObject: error.message,
      });
    }
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS ANIVERSARIANTES DO MÊS DO SALÃO',
      errorObject: error.message,
    });
  }
});


// Rota para remover um vínculo cliente-registro (DELETE) - Mantido, pois é uma relação
router.delete('/registro/:clienteRegistroId', async (req, res) => {
  const { clienteRegistroId } = req.params;
  console.log('CLIENTES ROUTES - DELETE /registro/:clienteRegistroId - ID:', clienteRegistroId);

  try {
    const clienteRegistroDeletado = await ClienteRegistro.findByIdAndDelete(clienteRegistroId).populate('clienteId').populate('registroId');

    if (!clienteRegistroDeletado) {
      console.log('CLIENTES ROUTES - DELETE /registro/:clienteRegistroId - Vínculo cliente-registro não encontrado para deleção:', clienteRegistroId);
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'VÍNCULO CLIENTE-REGISTRO NÃO ENCONTRADO PARA DELEÇÃO',
      });
    }

    console.log('CLIENTES ROUTES - DELETE /registro/:clienteRegistroId - Vínculo cliente-registro removido:', clienteRegistroDeletado);
    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'VÍNCULO CLIENTE-REGISTRO REMOVIDO COM SUCESSO',
      data: clienteRegistroDeletado,
    });
  } catch (error) {
    console.error('CLIENTES ROUTES - DELETE /registro/:clienteRegistroId - Erro ao remover vínculo cliente-registro:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO REMOVER O VÍNCULO CLIENTE-REGISTRO',
      errorObject: error,
    });
  }
});

module.exports = router;
