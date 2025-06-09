const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose'); 
const Registro = require('../models/registro');
const path = require('path');
const router = express.Router();
const Funcionario = require('../models/funcionario');
const RegistroFuncionario = require('../models/relationship/funcionarioRegistro');
const getSalaoIdFromUser = require('../middlewares/authMiddleware')

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/user-salao/:userId', async (req, res) => { 
    const { userId } = req.params;
    console.log('--- BACKEND FUNCIONÁRIOS (GET salaoId por userId) ---');
    console.log('   ID de Usuário recebido (req.params.userId):', userId);

    try {
        // Validação básica do ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                errorStatus: true,
                mensageStatus: `ID de usuário inválido: ${userId}`,
            });
        }

        const registro = await Registro.findById(userId);

        if (!registro) {
            return res.status(404).json({
                errorStatus: true,
                mensageStatus: 'Registro (Salao) não encontrado para este usuário.',
            });
        }

        const salaoId = registro._id;
        console.log('   SalaoId encontrado para o usuário:', salaoId);

        return res.status(200).json({
            errorStatus: false,
            mensageStatus: 'SalaoId encontrado com sucesso.',
            salaoId: salaoId,
        });

    } catch (error) {
        console.error('   Erro ao buscar salaoId por usuário:', error);
        return res.status(500).json({
            errorStatus: true,
            mensageStatus: 'Houve um erro ao buscar o ID do salão para o usuário.',
            errorObject: error.message,
        });
    }
});


// Rota para criar um novo funcionário (POST)
router.post('/add-funcionario', upload.single('foto'), getSalaoIdFromUser, async (req, res) => {
  const { nomeCompleto, dataNascimento, cpf, dataAdmissao, servicosRealizados, beneficios, informacoesAdicionais, telefone, email } = req.body; // Remove salaoId daqui, pois virá do middleware

  const foto = req.file ? req.file.filename : null;
  const salaoId = req.salaoId; 

  console.log('### ROTA ADD-FUNCIONARIO: Iniciando rota.');
  console.log('### ROTA ADD-FUNCIONARIO: salaoId recebido do middleware (req.salaoId):', salaoId ? salaoId.toString() : 'null'); // LOG G

  if (!salaoId) {
    console.error('### ROTA ADD-FUNCIONARIO: ERRO: salaoId não encontrado após middleware.'); // LOG H
    return res.status(400).json({
      errorStatus: true,
      mensageStatus: 'Salao ID não encontrado na requisição. Não é possível cadastrar funcionário sem um salão associado.',
    });
  }

  try {
    const novoFuncionario = new Funcionario({
      nomeCompleto,
      dataNascimento,
      cpf,
      dataAdmissao,
      servicosRealizados,
      beneficios,
      informacoesAdicionais,
      telefone,
      email,
      foto,
      salaoId, // Passar o salaoId obtido
    });

    const funcionarioSalvo = await novoFuncionario.save();
    console.log('### ROTA ADD-FUNCIONARIO: Funcionário salvo com sucesso!'); // LOG I

    return res.status(201).json({
      errorStatus: false,
      mensageStatus: 'FUNCIONÁRIO CADASTRADO COM SUCESSO',
      data: { ...funcionarioSalvo.toObject(), idFuncionario: funcionarioSalvo._id.toString() },
    });
  } catch (error) {
    console.error('### ROTA ADD-FUNCIONARIO: Erro (CATCH) ao cadastrar funcionário:', error); // LOG J
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => error.errors[key].message);
      return res.status(400).json({
        errorStatus: true,
        mensageStatus: `Erro de validação: ${errors.join(', ')}`,
        validationErrors: error.errors,
        errorObject: error,
      });
    }
    return res.status(400).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO CADASTRAR O FUNCIONÁRIO',
      errorObject: error,
    });
  }
});

// Rota para obter todos os funcionários (GET) -Apenas funcionarios Ativos
router.get('/', async (req, res) => {
  console.log('GET /funcionarios - Acessando rota');
  try {
    const funcionarios = await Funcionario.find({ active: true });
    console.log('GET /funcionarios - Funcionários encontrados (ativos):', funcionarios);
    const funcionariosComIdString = funcionarios.map(funcionario => ({
      ...funcionario.toObject(),
      idFuncionario: funcionario._id.toString(),
    }));
    console.log('GET /funcionarios - Funcionários com id string:', funcionariosComIdString);

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'FUNCIONÁRIOS ATIVOS ENCONTRADOS',
      data: funcionariosComIdString,
    });
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS FUNCIONÁRIOS',
      errorObject: error,
    });
  }
});



// Rota para obter um funcionário específico pelo ID (GET)
router.get('/:idFuncionario', async (req, res) => {
  const { idFuncionario } = req.params;

  try {
    const funcionario = await Funcionario.findById(idFuncionario)
      .populate('salaoId');

    if (!funcionario) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'FUNCIONÁRIO NÃO ENCONTRADO',
      });
    }
    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'FUNCIONÁRIO ENCONTRADO',
      data: { 
        ...funcionario.toObject(), 
        idFuncionario: funcionario._id.toString(),
        salaoId: funcionario.salaoId ? (funcionario.salaoId._id ? funcionario.salaoId._id.toString() : funcionario.salaoId.toString()) : null 
      }, 
    });
  } catch (error) {
    console.error('Erro ao buscar funcionário por ID:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR O FUNCIONÁRIO',
      errorObject: error,
    });
  }
});

// Rota para atualizar um funcionário existente (PUT)
router.put('/:idFuncionario', upload.any(), async (req, res) => { 
  const { idFuncionario } = req.params;
  const { nomeCompleto, dataNascimento, cpf, dataAdmissao, cargo, beneficios, informacoesAdicionais, telefone, email, fotoExistente } = req.body; // <-- Adicione fotoExistente aqui para fácil acesso

  let foto = null;

  if (req.files && req.files.length > 0) {

    const uploadedPhoto = req.files.find(file => file.fieldname === 'foto');
    if (uploadedPhoto) {
      foto = uploadedPhoto.filename;
    }
  } else if (fotoExistente) {
    foto = fotoExistente;
  }

  try {
    const funcionarioAtualizado = await Funcionario.findByIdAndUpdate(
      idFuncionario,
      { nomeCompleto, dataNascimento, cpf, dataAdmissao, cargo, beneficios, informacoesAdicionais, telefone, email, foto },
      { new: true, runValidators: true } 
    );

    if (!funcionarioAtualizado) {
      return res.status(404).json({ errorStatus: true, mensageStatus: 'FUNCIONÁRIO NÃO ENCONTRADO PARA ATUALIZAÇÃO' });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'FUNCIONÁRIO ATUALIZADO COM SUCESSO',
      data: { ...funcionarioAtualizado.toObject(), idFuncionario: funcionarioAtualizado._id.toString() },
    });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    // Verifique se o erro é de validação do Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => error.errors[key].message);
      return res.status(400).json({
        errorStatus: true,
        mensageStatus: `Erro de validação: ${errors.join(', ')}`,
        validationErrors: error.errors,
        errorObject: error,
      });
    }
    return res.status(500).json({ errorStatus: true, mensageStatus: 'HOUVE UM ERRO AO ATUALIZAR O FUNCIONÁRIO', errorObject: error });
  }
});

// Rota para "desativar" um funcionário (PUT - Soft Delete)
router.put('/deactivate/:idFuncionario', async (req, res) => {
  const { idFuncionario } = req.params;

  try {
    const funcionarioDesativado = await Funcionario.findByIdAndUpdate(
      idFuncionario,
      { active: false }, 
      { new: true }
    );

    if (!funcionarioDesativado) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'FUNCIONÁRIO NÃO ENCONTRADO PARA DESATIVAÇÃO',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'FUNCIONÁRIO DESATIVADO COM SUCESSO',
      data: { ...funcionarioDesativado.toObject(), idFuncionario: funcionarioDesativado._id.toString() },
    });
  } catch (error) {
    console.error('Erro ao desativar funcionário:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO DESATIVAR O FUNCIONÁRIO',
      errorObject: error,
    });
  }
});

router.get('/salao/:salaoId', async (req, res) => {
    const { salaoId } = req.params;
    console.log('--- BACKEND FUNCIONÁRIOS (GET por SalaoId) ---');
    console.log('   SalaoId recebido (req.params.salaoId):', salaoId);

    try {
        // Validação básica do ID
        if (!mongoose.Types.ObjectId.isValid(salaoId)) {
            console.error('   ERRO: ID do salão inválido:', salaoId);
            return res.status(400).json({
                errorStatus: true,
                mensageStatus: `ID do salão inválido: ${salaoId}`,
            });
        }

        const funcionarios = await Funcionario.find({ salaoId: new mongoose.Types.ObjectId(salaoId), active: true });

        const funcionariosComIdString = funcionarios.map(func => ({
            ...func.toObject(),
            _id: func._id.toString(), 
            idFuncionario: func._id.toString(), 
        }));

        console.log('   Funcionários encontrados para o salão:', funcionariosComIdString.length);

        return res.status(200).json({
            errorStatus: false,
            mensageStatus: 'FUNCIONÁRIOS DO SALÃO ENCONTRADOS',
            data: funcionariosComIdString,
        });

    } catch (error) {
        console.error('   ERRO (CATCH) ao buscar funcionários por salão:', error.message);
        console.error('   Stack Trace:', error.stack);
        return res.status(500).json({
            errorStatus: true,
            mensageStatus: 'Houve um erro interno ao buscar os funcionários do salão.',
            errorObject: error.message,
        });
    }
});


// Rotas para lidar com o relacionamento Funcionário-Registro (RegistroFuncionario)

// Rota para adicionar um funcionário a um registro (POST)
router.post('/registro', async (req, res) => {
  const { registroId, funcionarioId, status, observacoes } = req.body;

  try {
    const novoRegistroFuncionario = new RegistroFuncionario({
      registroId,
      funcionarioId,
      status,
      observacoes,
    });

    const registroFuncionarioSalvo = await novoRegistroFuncionario.save();

    return res.status(201).json({
      errorStatus: false,
      mensageStatus: 'VÍNCULO FUNCIONÁRIO-REGISTRO CRIADO COM SUCESSO',
      data: registroFuncionarioSalvo,
    });
  } catch (error) {
    console.error('Erro ao criar vínculo funcionário-registro:', error);
    return res.status(400).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO CRIAR O VÍNCULO FUNCIONÁRIO-REGISTRO',
      errorObject: error,
    });
  }
});

// Rota para obter todos os vínculos funcionário-registro (GET)
router.get('/registro', async (req, res) => {
  try {
    const registrosFuncionarios = await RegistroFuncionario.find().populate('registroId').populate('funcionarioId');
    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'VÍNCULOS FUNCIONÁRIO-REGISTRO ENCONTRADOS',
      data: registrosFuncionarios,
    });
  } catch (error) {
    console.error('Erro ao buscar vínculos funcionário-registro:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS VÍNCULOS FUNCIONÁRIO-REGISTRO',
      errorObject: error,
    });
  }
});

// Rota para obter vínculos de um funcionário específico (GET)
router.get('/registro/funcionario/:funcionarioId', async (req, res) => {
  const { funcionarioId } = req.params;

  try {
    const registros = await RegistroFuncionario.find({ funcionarioId }).populate('registroId').populate('funcionarioId');
    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'VÍNCULOS DO FUNCIONÁRIO ENCONTRADOS',
      data: registros,
    });
  } catch (error) {
    console.error('Erro ao buscar vínculos do funcionário:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS VÍNCULOS DO FUNCIONÁRIO',
      errorObject: error,
    });
  }
});

// Rota para obter vínculos de um registro específico (GET)
router.get('/registro/registro/:registroId', async (req, res) => {
  const { registroId } = req.params;

  try {
    const registros = await RegistroFuncionario.find({ registroId }).populate('registroId').populate('funcionarioId');
    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'VÍNCULOS DO REGISTRO ENCONTRADOS',
      data: registros,
    });
  } catch (error) {
    console.error('Erro ao buscar vínculos do registro:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS VÍNCULOS DO REGISTRO',
      errorObject: error,
    });
  }
});

// Rotas para lidar com o relacionamento Funcionário-Serviço (FuncionarioServico)

// Rota para vincular um funcionário a um serviço (POST)
router.post('/servico', async (req, res) => {
  const { funcionarioId, servicoId, observacoes } = req.body;

  try {
    const novoFuncionarioServico = new FuncionarioServico({
      funcionarioId,
      servicoId,
      observacoes,
    });

    const funcionarioServicoSalvo = await novoFuncionarioServico.save();

    return res.status(201).json({
      errorStatus: false,
      mensageStatus: 'VÍNCULO FUNCIONÁRIO-SERVIÇO CRIADO COM SUCESSO',
      data: funcionarioServicoSalvo,
    });
  } catch (error) {
    console.error('Erro ao criar vínculo funcionário-serviço:', error);
    return res.status(400).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO CRIAR O VÍNCULO FUNCIONÁRIO-SERVIÇO',
      errorObject: error,
    });
  }
});

// Rota para obter todos os vínculos funcionário-serviço (GET)
router.get('/servico', async (req, res) => {
  try {
    const funcionariosServicos = await FuncionarioServico.find().populate('funcionarioId').populate('servicoId');
    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'VÍNCULOS FUNCIONÁRIO-SERVIÇO ENCONTRADOS',
      data: funcionariosServicos,
    });
  } catch (error) {
    console.error('Erro ao buscar vínculos funcionário-serviço:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS VÍNCULOS FUNCIONÁRIO-SERVIÇO',
      errorObject: error,
    });
  }
});

// Rota para obter serviços de um funcionário específico (GET)
router.get('/servico/funcionario/:funcionarioId', async (req, res) => {
  const { funcionarioId } = req.params;

  try {
    const servicosDoFuncionario = await FuncionarioServico.find({ funcionarioId }).populate('funcionarioId').populate('servicoId');
    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'SERVIÇOS DO FUNCIONÁRIO ENCONTRADOS',
      data: servicosDoFuncionario,
    });
  } catch (error) {
    console.error('Erro ao buscar serviços do funcionário:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS SERVIÇOS DO FUNCIONÁRIO',
      errorObject: error,
    });
  }
});

// Rota para obter funcionários de um serviço específico (GET)
router.get('/servico/servico/:servicoId', async (req, res) => {
  const { servicoId } = req.params;

  try {
    const funcionariosDoServico = await FuncionarioServico.find({ servicoId }).populate('funcionarioId').populate('servicoId');
    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'FUNCIONÁRIOS DO SERVIÇO ENCONTRADOS',
      data: funcionariosDoServico,
    });
  } catch (error) {
    console.error('Erro ao buscar funcionários do serviço:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS FUNCIONÁRIOS DO SERVIÇO',
      errorObject: error,
    });
  }
});

module.exports = router;