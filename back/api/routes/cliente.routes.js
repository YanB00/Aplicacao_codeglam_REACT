const express = require('express');
const router = express.Router();
const Cliente = require('../models/cliente');
const ClienteRegistro = require('../models/relationship/clienteRegistro');
const multer = require('multer'); 
const path = require('path');
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

// Rota para obter todos os clientes (GET)
router.get('/listClientes', async (req, res) => {
  console.log('CLIENTES ROUTES - GET / - Listando todos os clientes');
  try {
    const clientes = await Cliente.find();
    console.log('CLIENTES ROUTES - GET / - Clientes encontrados:', clientes);

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'CLIENTES ENCONTRADOS',
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

router.get('/:idCliente', async (req, res) => {
  const { idCliente } = req.params;
  console.log('CLIENTES ROUTES - GET /:idCliente - ID:', idCliente);

  try {
    const cliente = await Cliente.findById(idCliente);

    if (!cliente) {
      console.log('CLIENTES ROUTES - GET /:idCliente - Cliente não encontrado:', idCliente);
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'CLIENTE NÃO ENCONTRADO',
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

  const { nomeCompleto, dataNascimento, cpf, telefone, email, favoritos, problemasSaude, informacoesAdicionais } = req.body;
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
      foto: fotoPath
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
router.put('/:idCliente', async (req, res) => {
  const { idCliente } = req.params;
  console.log('CLIENTES ROUTES - PUT /:idCliente - ID:', idCliente, 'Body:', req.body);
  const { nomeCompleto, dataNascimento, telefone, email, favoritos, problemasSaude, informacoesAdicionais } = req.body;

  try {
    const clienteAtualizado = await Cliente.findByIdAndUpdate( 
      idCliente,
      { 
        nomeCompleto, 
        dataNascimento, 
        telefone, 
        email, 
        favoritos: favoritos ? favoritos.split(',').map(s => s.trim()).filter(s => s !== '') : [], 
        problemasSaude, 
        informacoesAdicionais 
      },
      { new: true }
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
    console.error('CLIENTES ROUTES - PUT /:idCliente - Erro ao atualizar cliente:', error);
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
  console.log('CLIENTES ROUTES - DELETE /:idCliente - ID:', idCliente);

  try {
    const clienteDeletado = await Cliente.findByIdAndDelete(idCliente); 

    if (!clienteDeletado) {
      console.log('CLIENTES ROUTES - DELETE /:idCliente - Cliente não encontrado para deleção:', idCliente);
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'CLIENTE NÃO ENCONTRADO PARA DELEÇÃO',
      });
    }

    console.log('CLIENTES ROUTES - DELETE /:idCliente - Cliente deletado com sucesso:', clienteDeletado);
    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'CLIENTE DELETADO COM SUCESSO',
      data: { ...clienteDeletado.toObject(), idCliente: clienteDeletado._id.toString() }, 
    });
  } catch (error) {
    console.error('CLIENTES ROUTES - DELETE /:idCliente - Erro ao deletar cliente:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO DELETAR O CLIENTE',
      errorObject: error,
    });
  }
});

// Rota para vincular um cliente a um registro (POST)
router.post('/registro', async (req, res) => {
  console.log('CLIENTES ROUTES - POST /registro - Body:', req.body);
  const { clienteId, registroId, status, informacoesAdicionais } = req.body;

  try {
    const novoClienteRegistro = new ClienteRegistro({
      clienteId,
      registroId,
      status,
      informacoesAdicionais,
    });
    console.log('CLIENTES ROUTES - POST /registro - Novo ClienteRegistro:', novoClienteRegistro);

    const clienteRegistroSalvo = await novoClienteRegistro.save();
    console.log('CLIENTES ROUTES - POST /registro - ClienteRegistro salvo com sucesso:', clienteRegistroSalvo);

    return res.status(201).json({
      errorStatus: false,
      mensageStatus: 'VÍNCULO CLIENTE-REGISTRO CRIADO COM SUCESSO',
      data: clienteRegistroSalvo,
    });
  } catch (error) {
    console.error('CLIENTES ROUTES - POST /registro - Erro ao criar vínculo cliente-registro:', error);
    return res.status(400).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO CRIAR O VÍNCULO CLIENTE-REGISTRO',
      errorObject: error,
    });
  }
});

// Rota para obter todos os vínculos cliente-registro (GET)
router.get('/registro', async (req, res) => {
  console.log('CLIENTES ROUTES - GET /registro - Listando todos os vínculos cliente-registro');
  try {
    const clientesRegistros = await ClienteRegistro.find().populate('clienteId').populate('registroId');
    console.log('CLIENTES ROUTES - GET /registro - Vínculos cliente-registro encontrados:', clientesRegistros);

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'VÍNCULOS CLIENTE-REGISTRO ENCONTRADOS',
      data: clientesRegistros,
    });
  } catch (error) {
    console.error('CLIENTES ROUTES - GET /registro - Erro ao buscar vínculos cliente-registro:', error);
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
  console.log('CLIENTES ROUTES - GET /registro/cliente/:clienteId - clienteId:', clienteId);
  try {
    const registrosDoCliente = await ClienteRegistro.find({ clienteId }).populate('clienteId').populate('registroId');
    console.log('CLIENTES ROUTES - GET /registro/cliente/:clienteId - Registros do cliente encontrados:', registrosDoCliente);

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'REGISTROS DO CLIENTE ENCONTRADOS',
      data: registrosDoCliente,
    });
  } catch (error) {
    console.error('CLIENTES ROUTES - GET /registro/cliente/:clienteId - Erro ao buscar registros do cliente:', error);
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
  console.log('CLIENTES ROUTES - GET /registro/registro/:registroId - registroId:', registroId);
  try {
    const clientesDoRegistro = await ClienteRegistro.find({ registroId }).populate('clienteId').populate('registroId');
    console.log('CLIENTES ROUTES - GET /registro/registro/:registroId - Clientes do registro encontrados:', clientesDoRegistro);

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'CLIENTES DO REGISTRO ENCONTRADOS',
      data: clientesDoRegistro,
    });
  } catch (error) {
    console.error('CLIENTES ROUTES - GET /registro/registro/:registroId - Erro ao buscar clientes do registro:', error);
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
  console.log('CLIENTES ROUTES - PUT /registro/:clienteRegistroId - ID:', clienteRegistroId, 'Body:', req.body);

  try {
    const clienteRegistroAtualizado = await ClienteRegistro.findByIdAndUpdate(
      clienteRegistroId,
      { status, informacoesAdicionais },
      { new: true }
    ).populate('clienteId').populate('registroId');

    if (!clienteRegistroAtualizado) {
      console.log('CLIENTES ROUTES - PUT /registro/:clienteRegistroId - Vínculo cliente-registro não encontrado:', clienteRegistroId);
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'VÍNCULO CLIENTE-REGISTRO NÃO ENCONTRADO PARA ATUALIZAÇÃO',
      });
    }

    console.log('CLIENTES ROUTES - PUT /registro/:clienteRegistroId - Vínculo cliente-registro atualizado:', clienteRegistroAtualizado);
    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'VÍNCULO CLIENTE-REGISTRO ATUALIZADO COM SUCESSO',
      data: clienteRegistroAtualizado,
    });
  } catch (error) {
    console.error('CLIENTES ROUTES - PUT /registro/:clienteRegistroId - Erro ao atualizar vínculo cliente-registro:', error);
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
