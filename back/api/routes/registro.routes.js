const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Para hashear a senha
const Register = require('../models/registro');

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

router.get('/register/:id', async (req, res) => {
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

module.exports = router;