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
      foto: fotoPath,
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

  const { idCliente } = req.params;
  console.log('CLIENTES ROUTES - PUT /:idCliente - ID:', idCliente, 'Body:', req.body);
  
  const { nomeCompleto, dataNascimento, cpf, telefone, email, favoritos, problemasSaude, informacoesAdicionais } = req.body;
  const fotoPath = req.file ? req.file.path : null; 

  const updateData = { 
    nomeCompleto, 
    dataNascimento, 
    // Limpar CPF antes de salvar
    cpf: cpf ? cpf.replace(/\D/g, '') : undefined, 
    telefone: telefone ? telefone.replace(/\D/g, '') : undefined, 
    email, 
    favoritos: favoritos ? favoritos.split(',').map(s => s.trim()).filter(s => s !== '') : [], 
    problemasSaude, 
    informacoesAdicionais 
  };

  if (fotoPath) {
    updateData.foto = fotoPath;
  }


  try {
    const clienteAtualizado = await Cliente.findByIdAndUpdate( 
      idCliente,
      updateData, 
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
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => error.errors[key].message);
      return res.status(400).json({
        errorStatus: true,
        mensageStatus: 'ERRO DE VALIDAÇÃO: ' + errors.join(', '),
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
      { active: false }, // Define o campo 'active' como false
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
