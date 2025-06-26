const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Register = require('../models/registro');

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

const isValidTime = (time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);


router.post('/', async (req, res) => {
    const { nome, empresa, telefone, email, senha } = req.body;
    console.log('[BACKEND - POST /register] Recebendo dados:', { nome, empresa, telefone, email, senha });

    try {
        // Verificar se o email já existe
        const salaoExistente = await Register.findOne({ email });
        if (salaoExistente) {
            console.log('[BACKEND - POST /register] E-mail já cadastrado:', email);
            return res.status(409).json({
                errorStatus: true,
                mensageStatus: 'Este e-mail já está cadastrado.',
            });
        }

        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);
        console.log('[BACKEND - POST /register] Senha hasheada.');

        const novoSalao = new Register({
            nome,
            empresa,
            telefone,
            email,
            senha: senhaHash,
        });

        const registroSalvo = await novoSalao.save();
        console.log('[BACKEND - POST /register] Salão registrado com sucesso:', { _id: registroSalvo._id, nome, empresa, email });

        return res.status(201).json({
            errorStatus: false,
            mensageStatus: 'SALÃO REGISTRADO COM SUCESSO',
            data: {
                _id: registroSalvo._id,
                nome: registroSalvo.nome,
                empresa: registroSalvo.empresa,
                email: registroSalvo.email,
            },
        });
    } catch (error) {
        console.error('[BACKEND - POST /register] Erro ao registrar salão:', error);
        return res.status(400).json({
            errorStatus: true,
            mensageStatus: 'HOUVE UM ERRO AO REGISTRAR O SALÃO',
            errorObject: error,
        });
    }
});


router.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`[BACKEND - GET /register/:id] Recebendo requisição para ID: ${id}`);

    try {
        const salao = await Register.findOne({ _id: id, isDeleted: false });

        if (!salao) {
            console.log(`[BACKEND - GET /register/:id] Salão não encontrado ou está deletado para ID: ${id}`);
            return res.status(404).json({ errorStatus: true, mensageStatus: 'Salão não encontrado ou desativado' });
        }

        const defaultHorarios = Register.schema.paths.horariosFuncionamento.defaultValue;
        const finalHorarios = { ...defaultHorarios, ...salao.horariosFuncionamento };
        salao.horariosFuncionamento = finalHorarios;

        console.log(`[BACKEND - GET /register/:id] Salão encontrado para ID ${id}:`, { _id: salao._id, nome: salao.nome, empresa: salao.empresa, email: salao.email });
        return res.status(200).json({ errorStatus: false, data: salao });
    } catch (error) {
        console.error('[BACKEND - GET /register/:id] Erro ao buscar detalhes do salão:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ errorStatus: true, mensageStatus: `ID de salão inválido: ${id}` });
        }
        return res.status(500).json({ errorStatus: true, mensageStatus: 'Erro interno no servidor', errorObject: error });
    }
});


/*
router.get('/', async (req, res) => {
    try {
        const saloes = await Register.find({ isDeleted: false }); // Filtra apenas salões não deletados
        return res.status(200).json({ errorStatus: false, data: saloes });
    } catch (error) {
        console.error('Erro ao buscar salões:', error);
        return res.status(500).json({ errorStatus: true, mensageStatus: 'Erro interno no servidor' });
    }
});
*/

router.put('/:id', async (req, res) => {
    const { id } = req.params;

    const {
        nome, empresa, telefone, email, senha,
        horariosFuncionamento, 
        modulosAtivos,
    } = req.body;

    console.log(`[BACKEND - PUT /register/:id] Recebendo requisição para ID: ${id}`);
    console.log('[BACKEND - PUT /register/:id] Body recebido:', {
        nome, empresa, telefone, email,
        senha: senha ? '[SENHA FORNECIDA]' : '[SENHA NÃO FORNECIDA]',
        horariosFuncionamento,
        modulosAtivos
    });

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`[BACKEND - PUT /register/:id] ID inválido: ${id}`);
            return res.status(400).json({
                errorStatus: true,
                mensageStatus: `ID de salão inválido: ${id}`,
            });
        }

        const updateFields = {
            empresa: empresa,
            telefone: telefone,
            email: email,
            nome: nome,
            modulosAtivos: modulosAtivos
        };

        if (horariosFuncionamento && typeof horariosFuncionamento === 'object') {
            const allowedDays = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
            const validatedHorarios = {};

            for (const day of allowedDays) {
                const dayData = horariosFuncionamento[day];
                if (dayData) {
                    const newDayEntry = {
                        abre: dayData.abre || '00:00', 
                        fecha: dayData.fecha || '00:00', 
                        ativo: typeof dayData.ativo === 'boolean' ? dayData.ativo : false 
                    };

                    if (newDayEntry.ativo) {
                        if (!isValidTime(newDayEntry.abre)) {
                            return res.status(400).json({
                                errorStatus: true,
                                mensageStatus: `Hora de abertura inválida para ${day}: ${newDayEntry.abre}. Use o formato HH:mm.`,
                            });
                        }
                        if (!isValidTime(newDayEntry.fecha)) {
                            return res.status(400).json({
                                errorStatus: true,
                                mensageStatus: `Hora de fechamento inválida para ${day}: ${newDayEntry.fecha}. Use o formato HH:mm.`,
                            });
                        }

                        const [abreHour, abreMinute] = newDayEntry.abre.split(':').map(Number);
                        const [fechaHour, fechaMinute] = newDayEntry.fecha.split(':').map(Number);

                        if (fechaHour * 60 + fechaMinute <= abreHour * 60 + abreMinute) {
                            return res.status(400).json({
                                errorStatus: true,
                                mensageStatus: `A hora de fechamento (${newDayEntry.fecha}) deve ser posterior à hora de abertura (${newDayEntry.abre}) para ${day}.`,
                            });
                        }
                    } else {
                        newDayEntry.abre = '00:00';
                        newDayEntry.fecha = '00:00';
                    }
                    validatedHorarios[day] = newDayEntry;
                } else {
                    validatedHorarios[day] = Register.schema.paths.horariosFuncionamento.defaultValue[day] || { abre: '00:00', fecha: '00:00', ativo: false };
                }
            }
            updateFields.horariosFuncionamento = validatedHorarios;
        } else if (horariosFuncionamento === null || horariosFuncionamento === undefined) {
        } else {
            return res.status(400).json({ errorStatus: true, mensageStatus: 'Horários de funcionamento fornecidos em formato inválido.' });
        }


        if (senha) {
            const saltRounds = 10;
            updateFields.senha = await bcrypt.hash(senha, saltRounds);
            console.log(`[BACKEND - PUT /register/:id] Senha será atualizada para ID ${id}.`);
        }

        const updatedRegistro = await Register.findByIdAndUpdate(
            id,
            updateFields,
            { new: true, runValidators: true } 
        );

        if (!updatedRegistro) {
            console.warn(`[BACKEND - PUT /register/:id] Salão não encontrado para ID: ${id}`);
            return res.status(404).json({
                errorStatus: true,
                mensageStatus: 'Salão não encontrado para atualização.',
            });
        }

        console.log(`[BACKEND - PUT /register/:id] Salão atualizado com sucesso para ID ${id}.`);
        return res.status(200).json({
            errorStatus: false,
            mensageStatus: 'Informações do salão atualizadas com sucesso!',
            data: {
                _id: updatedRegistro._id,
                nome: updatedRegistro.nome,
                empresa: updatedRegistro.empresa,
                telefone: updatedRegistro.telefone,
                email: updatedRegistro.email,
                horariosFuncionamento: updatedRegistro.horariosFuncionamento,
                modulosAtivos: updatedRegistro.modulosAtivos,
            },
        });

    } catch (error) {
        console.error('[BACKEND - PUT /register/:id] Erro ao atualizar informações do salão:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            return res.status(400).json({
                errorStatus: true,
                mensageStatus: `Erro de validação: ${errors.join(', ')}`,
                validationErrors: error.errors,
            });
        }
        return res.status(500).json({
            errorStatus: true,
            mensageStatus: 'Houve um erro interno ao atualizar as informações do salão.',
            errorObject: error.message,
        });
    }
});


router.put('/soft-delete/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`[BACKEND - PUT /register/soft-delete/:id] Recebendo requisição para soft delete do ID: ${id}`);

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`[BACKEND - PUT /register/soft-delete/:id] ID inválido: ${id}`);
            return res.status(400).json({
                errorStatus: true,
                mensageStatus: `ID de salão inválido: ${id}`,
            });
        }

        const salao = await Register.findById(id);

        if (!salao) {
            console.log(`[BACKEND - PUT /register/soft-delete/:id] Salão não encontrado para ID: ${id}`);
            return res.status(404).json({
                errorStatus: true,
                mensageStatus: 'Salão não encontrado para exclusão.',
            });
        }

        if (salao.isDeleted) {
            console.log(`[BACKEND - PUT /register/soft-delete/:id] Salão com ID ${id} já está marcado como deletado.`);
            return res.status(409).json({
                errorStatus: true,
                mensageStatus: 'Este salão já está desativado.',
            });
        }

        salao.isDeleted = true; // Marca o salão como deletado
        await salao.save();

        console.log(`[BACKEND - PUT /register/soft-delete/:id] Salão com ID ${id} marcado como deletado com sucesso.`);
        return res.status(200).json({
            errorStatus: false,
            mensageStatus: 'Cadastro do salão desativado com sucesso.',
            data: { _id: salao._id, empresa: salao.empresa, isDeleted: salao.isDeleted }
        });

    } catch (error) {
        console.error('[BACKEND - PUT /register/soft-delete/:id] Erro ao desativar salão:', error);
        return res.status(500).json({
            errorStatus: true,
            mensageStatus: 'Houve um erro interno ao desativar o cadastro do salão.',
            errorObject: error.message,
        });
    }
});

router.put('/restore/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`[BACKEND - PUT /register/restore/:id] Recebendo requisição para restaurar o ID: ${id}`);

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                errorStatus: true,
                mensageStatus: `ID de salão inválido: ${id}`,
            });
        }

        const salao = await Register.findById(id);

        if (!salao) {
            return res.status(404).json({
                errorStatus: true,
                mensageStatus: 'Salão não encontrado para restauração.',
            });
        }

        if (!salao.isDeleted) {
            return res.status(409).json({
                errorStatus: true,
                mensageStatus: 'Este salão não está desativado.',
            });
        }

        salao.isDeleted = false; 
        await salao.save();

        console.log(`[BACKEND - PUT /register/restore/:id] Salão com ID ${id} restaurado com sucesso.`);
        return res.status(200).json({
            errorStatus: false,
            mensageStatus: 'Cadastro do salão restaurado com sucesso.',
            data: { _id: salao._id, empresa: salao.empresa, isDeleted: salao.isDeleted }
        });

    } catch (error) {
        console.error('[BACKEND - PUT /register/restore/:id] Erro ao restaurar salão:', error);
        return res.status(500).json({
            errorStatus: true,
            mensageStatus: 'Houve um erro interno ao restaurar o cadastro do salão.',
            errorObject: error.message,
        });
    }
});


module.exports = router;


module.exports = router;