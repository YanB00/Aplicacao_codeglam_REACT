const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Funcionario = require('../models/funcionario');
const RegistroFuncionario = require('../models/relationship/funcionarioRegistro');
const FuncionarioServico = require('../models/relationship/funcionarioServico');

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

// Rota para criar um novo funcionário (POST)
router.post('/add-funcionario', upload.single('foto'), async (req, res) => {
  const { nomeCompleto, dataNascimento, cpf, dataAdmissao, servicosRealizados, beneficios, informacoesAdicionais, telefone, email } = req.body;

  const foto = req.file ? req.file.filename : null;

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
    });

    const funcionarioSalvo = await novoFuncionario.save();

    return res.status(201).json({
      errorStatus: false,
      mensageStatus: 'FUNCIONÁRIO CADASTRADO COM SUCESSO',
      data: { ...funcionarioSalvo.toObject(), idFuncionario: funcionarioSalvo._id.toString() },
    });
  } catch (error) {
    console.error('Erro ao cadastrar funcionário:', error);
    return res.status(400).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO CADASTRAR O FUNCIONÁRIO',
      errorObject: error,
    });
  }
});


// Rota para obter todos os funcionários (GET)
router.get('/funcionarios', async (req, res) => {
  console.log('GET /funcionarios - Acessando rota');
  try {
    const funcionarios = await Funcionario.find();
    console.log('GET /funcionarios - Funcionários encontrados:', funcionarios);
    const funcionariosComIdString = funcionarios.map(funcionario => ({
      ...funcionario.toObject(),
      idFuncionario: funcionario._id.toString(),
    }));
    console.log('GET /funcionarios - Funcionários com id string:', funcionariosComIdString);

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'FUNCIONÁRIOS ENCONTRADOS',
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
    const funcionario = await Funcionario.findById(idFuncionario); // Busca pelo _id

    if (!funcionario) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'FUNCIONÁRIO NÃO ENCONTRADO',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'FUNCIONÁRIO ENCONTRADO',
      data: { ...funcionario.toObject(), idFuncionario: funcionario._id.toString() }, // Retorna _id como idFuncionario
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
router.put('/:idFuncionario', async (req, res) => {
  const { idFuncionario } = req.params;
  const { nomeCompleto, dataNascimento, cpf, dataAdmissao, servicosRealizados, beneficios, informacoesAdicionais, telefone, email, foto } = req.body;

  try {
    const funcionarioAtualizado = await Funcionario.findByIdAndUpdate( // Busca e atualiza pelo _id
      idFuncionario,
      { nomeCompleto, dataNascimento, cpf, dataAdmissao, servicosRealizados, beneficios, informacoesAdicionais, telefone, email, foto },
      { new: true } // Retorna o documento atualizado
    );

    if (!funcionarioAtualizado) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'FUNCIONÁRIO NÃO ENCONTRADO PARA ATUALIZAÇÃO',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'FUNCIONÁRIO ATUALIZADO COM SUCESSO',
      data: { ...funcionarioAtualizado.toObject(), idFuncionario: funcionarioAtualizado._id.toString() }, // Retorna _id como idFuncionario
    });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO ATUALIZAR O FUNCIONÁRIO',
      errorObject: error,
    });
  }
});

// Rota para deletar um funcionário (DELETE)
router.delete('/:idFuncionario', async (req, res) => {
  const { idFuncionario } = req.params;

  try {
    const funcionarioDeletado = await Funcionario.findByIdAndDelete(idFuncionario); // Busca e deleta pelo _id

    if (!funcionarioDeletado) {
      return res.status(404).json({
        errorStatus: true,
        mensageStatus: 'FUNCIONÁRIO NÃO ENCONTRADO PARA DELEÇÃO',
      });
    }

    return res.status(200).json({
      errorStatus: false,
      mensageStatus: 'FUNCIONÁRIO DELETADO COM SUCESSO',
      data: { ...funcionarioDeletado.toObject(), idFuncionario: funcionarioDeletado._id.toString() }, // Retorna _id como idFuncionario
    });
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO DELETAR O FUNCIONÁRIO',
      errorObject: error,
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