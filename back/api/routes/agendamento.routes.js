const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Agendamento = require('../models/agendamento'); 
const Servico = require('../models/servico'); 


function getBrasiliaStartOfDayUTC(dateString) { 
    const localMoment = moment.tz(dateString, 'YYYY-MM-DD', 'America/Sao_Paulo');
    return localMoment.startOf('day').utc().toDate();
}

// Rota para criar um novo agendamento (POST)
router.post('/', async (req, res) => {
    const {
        salaoId,
        horaInicio,    
        horaFim,       
        servicoId,
        clienteId,
        funcionarioId,
        valor,
        observacoes,
        dataAgendamento, 
        concluido,
        cancelado,
    } = req.body;

    try {
        if (!dataAgendamento) {
            return res.status(400).json({
                errorStatus: true,
                mensageStatus: 'O campo dataAgendamento é obrigatório.',
            });
        }

        const hojeBrasiliaStartOfDay = moment.tz('America/Sao_Paulo').startOf('day');
        const dataAgendamentoMoment = moment.tz(dataAgendamento, 'YYYY-MM-DD', 'America/Sao_Paulo');

        if (dataAgendamentoMoment.isBefore(hojeBrasiliaStartOfDay, 'day')) {
            return res.status(400).json({
                errorStatus: true,
                mensageStatus: 'Não é permitido agendar em datas anteriores ao dia atual.',
            });
        }
        let dataAgendamentoUTC = getBrasiliaStartOfDayUTC(dataAgendamento);

        // --- Validação 2: Serviço e Status do Serviço ---
        const servico = await Servico.findById(servicoId);
        if (!servico) {
            return res.status(404).json({ errorStatus: true, mensageStatus: 'Serviço não encontrado.' });
        }
        if (servico.status !== 'Ativo') {
            return res.status(400).json({ errorStatus: true, mensageStatus: `O serviço '<span class="math-inline">\{servico\.titulo\}' está com status '</span>{servico.status}' e não pode ser agendado. Apenas serviços 'Ativo' são permitidos.` });
        }

        // --- Validação 3: Conflito de Horário (Início vs Fim) ---
        const newAppointmentStart = moment.tz(`${dataAgendamento} ${horaInicio}`, 'YYYY-MM-DD HH:mm', 'America/Sao_Paulo');
        const newAppointmentEnd = moment.tz(`${dataAgendamento} ${horaFim}`, 'YYYY-MM-DD HH:mm', 'America/Sao_Paulo');

        if (newAppointmentEnd.isSameOrBefore(newAppointmentStart)) {
            return res.status(400).json({ mensageStatus: 'A hora de fim deve ser posterior à hora de início do agendamento.', errorStatus: true });
        }

        // --- Validação 4: Conflito de Horário para o FUNCIONÁRIO ---
        const existingAppointmentsFuncionario = await Agendamento.find({
            funcionarioId: funcionarioId,
            dataAgendamento: dataAgendamentoUTC,
            cancelado: false, 
        });

        for (const existingApp of existingAppointmentsFuncionario) {
            const existingAppStart = moment.tz(`${moment(existingApp.dataAgendamento).format('YYYY-MM-DD')} ${existingApp.horaInicio}`, 'YYYY-MM-DD HH:mm', 'America/Sao_Paulo');
            const existingAppEnd = moment.tz(`${moment(existingApp.dataAgendamento).format('YYYY-MM-DD')} ${existingApp.horaFim}`, 'YYYY-MM-DD HH:mm', 'America/Sao_Paulo');

            if (newAppointmentStart.isBefore(existingAppEnd) && newAppointmentEnd.isAfter(existingAppStart)) {
                return res.status(400).json({ errorStatus: true, mensageStatus: `O funcionário já possui um agendamento conflitante das ${existingApp.horaInicio} às ${existingApp.horaFim} neste dia.` });
            }
        }

        // Validação 5: Conflito de Horário para o CLIENTE
        const existingAppointmentsCliente = await Agendamento.find({
            clienteId: clienteId,
            dataAgendamento: dataAgendamentoUTC, 
            cancelado: false, 
        });
        for (const existingApp of existingAppointmentsCliente) {
            const existingAppStart = moment.tz(`${moment(existingApp.dataAgendamento).format('YYYY-MM-DD')} ${existingApp.horaInicio}`, 'YYYY-MM-DD HH:mm', 'America/Sao_Paulo');
            const existingAppEnd = moment.tz(`${moment(existingApp.dataAgendamento).format('YYYY-MM-DD')} ${existingApp.horaFim}`, 'YYYY-MM-DD HH:mm', 'America/Sao_Paulo');

            if (newAppointmentStart.isBefore(existingAppEnd) && newAppointmentEnd.isAfter(existingAppStart)) {
                return res.status(400).json({
                    errorStatus: true,
                    mensageStatus: `O cliente já possui um agendamento conflitante das ${existingApp.horaInicio} às ${existingApp.horaFim} neste dia.`,
                });
            }
        }

        const novoAgendamento = new Agendamento({
            salaoId,
            horaInicio,
            horaFim,
            servicoId,
            clienteId,
            funcionarioId,
            valor,
            observacoes,
            dataAgendamento: dataAgendamentoUTC,
            concluido: concluido || false,
            cancelado: cancelado || false,
        });

        const agendamentoSalvo = await novoAgendamento.save();

        const agendamentoPopulado = await Agendamento.findById(agendamentoSalvo._id)
            .populate('salaoId', 'nome')
            .populate('servicoId', 'titulo')
            .populate('clienteId', 'nomeCompleto')
            .populate('funcionarioId', 'nomeCompleto');

        return res.status(201).json({
            errorStatus: false,
            mensageStatus: 'AGENDAMENTO CRIADO COM SUCESSO',
            data: agendamentoPopulado,
        });
    } catch (error) {
        console.error('Erro detalhado ao criar agendamento (backend):', JSON.stringify(error, null, 2));

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message,
                value: err.value,
            }));
            console.error('Erros de validação do Mongoose:', errors);
            return res.status(400).json({
                errorStatus: true,
                mensageStatus: 'Erro de validação ao criar o agendamento. Verifique os campos.',
                validationErrors: errors,
                errorObject: error.message,
            });
        }
        if (error.name === 'CastError' && error.path === '_id') { 
            return res.status(400).json({
                errorStatus: true,
                mensageStatus: `ID de serviço inválido: ${servicoId}.`,
                errorObject: error.message,
            });
        }


        return res.status(400).json({
            errorStatus: true,
            mensageStatus: 'HOUVE UM ERRO AO CRIAR O AGENDAMENTO',
            errorObject: error.message,
        });
    }
});

// Rota para capturar agendamentos cancelados (GET)
router.get('/cancelados', async (req, res) => {
    try {
        const agendamentosCancelados = await Agendamento.find({ cancelado: true })
            .populate('salaoId', 'nome')
            .populate('servicoId', 'titulo')
            .populate('clienteId', 'nomeCompleto')
            .populate('funcionarioId', 'nomeCompleto')
            .sort({ dataAgendamento: -1, horaInicio: -1 }); 

        return res.status(200).json({
            errorStatus: false,
            mensageStatus: 'AGENDAMENTOS CANCELADOS ENCONTRADOS',
            data: agendamentosCancelados,
        });
    } catch (error) {
        console.error('Erro ao buscar agendamentos cancelados:', error);
        return res.status(500).json({
            errorStatus: true,
            mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS AGENDAMENTOS CANCELADOS',
            errorObject: error.message,
        });
    }
});

// Rota para obter agendamentos por Data (GET)
router.get('/data/:dataAgendamento', async (req, res) => {
  const { dataAgendamento } = req.params;
  try {
    const startOfDayBrasiliaUTC = getBrasiliaStartOfDayUTC(dataAgendamento);
    const date = new Date(dataAgendamento + 'T00:00:00.000Z');
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setUTCDate(date.getUTCDate() + 1);

    const nextDayBrasiliaUTC = moment.tz(dataAgendamento, 'YYYY-MM-DD', 'America/Sao_Paulo')
      .add(1, 'days')
      .startOf('day')
      .utc()
      .toDate();
    const agendamentosData = await Agendamento.find({
            dataAgendamento: {
                $gte: startOfDayBrasiliaUTC,
                $lt: nextDayBrasiliaUTC,     
            },
        })
            .populate('salaoId', 'nome')
            .populate('servicoId', 'titulo')
            .populate('clienteId', 'nomeCompleto')
            .populate('funcionarioId', 'nomeCompleto')
            .sort({ horaInicio: 1 });


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
      errorObject: error.message,
    });
  }
});

router.get('/grafico/agendamentos-mensal', async (req, res) => {
    try {
        const now = moment.tz('America/Sao_Paulo');
        const startOfMonth = now.startOf('month').utc().toDate(); 
        const endOfMonth = now.endOf('month').utc().toDate();  

        const result = await Agendamento.aggregate([
            {
                $match: {
                    dataAgendamento: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: null, 
                    concluidos: {
                        $sum: { $cond: [{ $eq: ["$concluido", true] }, 1, 0] }
                    },
                    cancelados: {
                        $sum: { $cond: [{ $eq: ["$cancelado", true] }, 1, 0] }
                    },
                    emProgresso: {
                        $sum: { $cond: [{ $and: [{ $eq: ["$concluido", false] }, { $eq: ["$cancelado", false] }] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0, 
                    concluidos: 1,
                    cancelados: 1,
                    emProgresso: 1,
                    total: { $sum: ["$concluidos", "$cancelados", "$emProgresso"] } 
                }
            }
        ]);

        const dataParaGrafico = result.length > 0 ? result[0] : { concluidos: 0, cancelados: 0, emProgresso: 0, total: 0 };

        return res.status(200).json({
            errorStatus: false,
            mensageStatus: 'Dados para o gráfico de agendamentos do mês obtidos com sucesso.',
            data: dataParaGrafico,
        });

    } catch (error) {
        console.error('Erro ao buscar dados para o gráfico de agendamentos:', error);
        return res.status(500).json({
            errorStatus: true,
            mensageStatus: 'Houve um erro ao buscar dados para o gráfico de agendamentos.',
            errorObject: error.message,
        });
    }
});


// Rota para obter todos os agendamentos (GET)
router.get('/', async (req, res) => {
  try {
    const agendamentos = await Agendamento.find()
      .populate('salaoId', 'nome')
      .populate('servicoId', 'titulo')
      .populate('clienteId', 'nomeCompleto')
      .populate('funcionarioId', 'nomeCompleto')
      .sort({ dataAgendamento: 1, horaInicio: 1 });

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
      errorObject: error.message,
    });
  }
});

// Rota para obter um agendamento específico pelo ID (GET)
router.get('/:agendamentoId', async (req, res) => {
  const { agendamentoId } = req.params;

  try {
    const agendamento = await Agendamento.findById(agendamentoId)
      .populate('salaoId', 'nome')
      .populate('servicoId', 'titulo')
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
    if (error.name === 'CastError') {
        return res.status(400).json({
            errorStatus: true,
            mensageStatus: `ID de agendamento inválido: ${agendamentoId}`,
            errorObject: error.message,
        });
    }
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO BUSCAR O AGENDAMENTO',
      errorObject: error.message,
    });
  }
});


// Rota para atualizar um agendamento existente (PUT)
router.put('/:agendamentoId', async (req, res) => {
  const { agendamentoId } = req.params;
  const {
    salaoId,
    horaInicio,
    horaFim,
    servicoId,
    clienteId,
    funcionarioId,
    valor,
    observacoes,
    dataAgendamento,
    concluido,
    cancelado,
  } = req.body;

  const updateFields = {};
  if (salaoId !== undefined) updateFields.salaoId = salaoId;
  if (horaInicio !== undefined) updateFields.horaInicio = horaInicio;
  if (horaFim !== undefined) updateFields.horaFim = horaFim;
  if (servicoId !== undefined) updateFields.servicoId = servicoId;
  if (clienteId !== undefined) updateFields.clienteId = clienteId;
  if (funcionarioId !== undefined) updateFields.funcionarioId = funcionarioId;
  if (valor !== undefined) updateFields.valor = valor;
  if (observacoes !== undefined) updateFields.observacoes = observacoes;
  if (dataAgendamento !== undefined) { updateFields.dataAgendamento = getBrasiliaStartOfDayUTC(dataAgendamento); }
  if (concluido !== undefined) updateFields.concluido = concluido;
  if (cancelado !== undefined) updateFields.cancelado = cancelado;

  if (updateFields.concluido === true) {
    updateFields.cancelado = false;
  } else if (updateFields.cancelado === true) {
    updateFields.concluido = false;
  }

  try {
    const agendamentoAtualizado = await Agendamento.findByIdAndUpdate(
      agendamentoId,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate('salaoId', 'nome')
      .populate('servicoId', 'titulo')
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
    console.error('Erro detalhado ao atualizar agendamento (backend):', JSON.stringify(error, null, 2));
     if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      console.error('Erros de validação do Mongoose (PUT):', errors);
      return res.status(400).json({
        errorStatus: true,
        mensageStatus: 'Erro de validação ao atualizar o agendamento.',
        validationErrors: errors,
        errorObject: error.message,
      });
    }
    if (error.name === 'CastError') { 
        return res.status(400).json({
            errorStatus: true,
            mensageStatus: `ID de agendamento inválido para atualização: ${agendamentoId}`,
            errorObject: error.message,
        });
    }
    return res.status(500).json({ 
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO INTERNO AO ATUALIZAR O AGENDAMENTO',
      errorObject: error.message,
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
      data: { id: agendamentoDeletado._id }, 
    });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
     if (error.name === 'CastError') {
        return res.status(400).json({
            errorStatus: true,
            mensageStatus: `ID de agendamento inválido para deleção: ${agendamentoId}`,
            errorObject: error.message,
        });
    }
    return res.status(500).json({
      errorStatus: true,
      mensageStatus: 'HOUVE UM ERRO AO DELETAR O AGENDAMENTO',
      errorObject: error.message,
    });
  }
});

// Rota para obter agendamentos por Salão (GET)
router.get('/salao/:salaoId', async (req, res) => {
  const { salaoId } = req.params;
  try {
    const agendamentosSalao = await Agendamento.find({ salaoId })
      .populate('servicoId', 'titulo')
      .populate('clienteId', 'nomeCompleto')
      .populate('funcionarioId', 'nomeCompleto')
      .sort({ dataAgendamento: 1, horaInicio: 1 });

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
      errorObject: error.message,
    });
  }
});


// Rota para obter agendamentos por Cliente (GET)
router.get('/cliente/:clienteId', async (req, res) => {
  const { clienteId } = req.params;
  try {
    const agendamentosCliente = await Agendamento.find({ clienteId })
      .populate('salaoId', 'nome')
      .populate('servicoId', 'titulo')
      .populate('funcionarioId', 'nomeCompleto')
      .sort({ dataAgendamento: 1, horaInicio: 1 });
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
      errorObject: error.message,
    });
  }
});

// Rota para obter agendamentos por Funcionário (GET)
router.get('/funcionario/:funcionarioId', async (req, res) => {
    const { funcionarioId } = req.params;
    console.log('--- BACKEND AGENDAMENTOS (GET por Funcionário) ---');
    console.log('  ID de Funcionário recebido (req.params.funcionarioId):', funcionarioId);

    try {
        // CRIE UM OBJETOID A PARTIR DA STRING DO PARAMETRO
        const funcionarioObjectId = new mongoose.Types.ObjectId(funcionarioId); 
        console.log('  ID de Funcionário convertido para ObjectId:', funcionarioObjectId); 

        const query = { funcionarioId: funcionarioObjectId }; 
        console.log('  Objeto de Query de Mongoose:', JSON.stringify(query)); 

        const agendamentosFuncionario = await Agendamento.find(query) 
            .populate('salaoId', 'nome')
            .populate('servicoId', 'titulo')
            .populate('clienteId', 'nomeCompleto')
            .populate('funcionarioId', 'nomeCompleto')
            .sort({ dataAgendamento: 1, horaInicio: 1 });
        
        console.log('  Resultado da busca (agendamentosFuncionario):', agendamentosFuncionario);
        console.log('  Número de agendamentos encontrados:', agendamentosFuncionario.length);

        return res.status(200).json({
            errorStatus: false,
            mensageStatus: 'AGENDAMENTOS DO FUNCIONÁRIO ENCONTRADOS',
            data: agendamentosFuncionario, 
        });
    } catch (error) {
        console.error('  Erro ao buscar agendamentos por funcionário:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                errorStatus: true,
                mensageStatus: `ID do funcionário inválido para busca: ${funcionarioId}`,
                errorObject: error.message,
            });
        }
        return res.status(500).json({
            errorStatus: true,
            mensageStatus: 'HOUVE UM ERRO AO BUSCAR OS AGENDAMENTOS DO FUNCIONÁRIO',
            errorObject: error.message,
        });
    }
});


module.exports = router;
