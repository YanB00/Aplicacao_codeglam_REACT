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


router.post('/register', async (req, res) => {
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
        const salao = await Register.findById(id);
        if (!salao) {
            console.log(`[BACKEND - GET /register/:id] Salão não encontrado para ID: ${id}`);
            return res.status(404).json({ errorStatus: true, mensageStatus: 'Salão não encontrado' });
        }
        console.log(`[BACKEND - GET /register/:id] Salão encontrado para ID ${id}:`, { _id: salao._id, nome: salao.nome, empresa: salao.empresa, email: salao.email });
        return res.status(200).json({ errorStatus: false, data: salao });
    } catch (error) {
        console.error('[BACKEND - GET /register/:id] Erro ao buscar detalhes do salão:', error);
        return res.status(500).json({ errorStatus: true, mensageStatus: 'Erro interno no servidor', errorObject: error });
    }
});

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
            horariosFuncionamento: horariosFuncionamento, 
            modulosAtivos: modulosAtivos                 
        };

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



module.exports = router;