const express = require('express');
const router = express.Router();
const Register = require('../models/registro');
const PasswordResetToken = require('../models/passwordResetToken');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); 

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post('/', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await Register.findOne({ email });
        if (!user) {

            return res.status(200).json({
                errorStatus: false,
                mensageStatus: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição.'
            });
        }

        // 1. Gerar um token único
        const token = crypto.randomBytes(32).toString('hex');

        // 2. Salvar o token no banco de dados (associado ao usuário)
        await PasswordResetToken.deleteOne({ userId: user._id });
        const newToken = new PasswordResetToken({
            userId: user._id,
            token: token
        });
        await newToken.save();

        // 3. Criar o link de redefinição de senha
        const resetLink = `${process.env.BASE_URL}/forgot-password/${user._id}/${token}`;

        // 4. Configurar e-mail
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Redefinição de Senha - CodeGlam',
            html: `
                <p>Olá,</p>
                <p>Recebemos uma solicitação para redefinir a sua senha.</p>
                <p>Clique no link abaixo para redefinir sua senha:</p>
                <p><a href="${resetLink}">Redefinir Senha</a></p>
                <p>Este link expirará em 1 hora.</p>
                <p>Se você não solicitou uma redefinição de senha, ignore este e-mail.</p>
                <p>Obrigado,</p>
                <p>Equipe CodeGlam</p>
            `
        };

        // 5. Enviar e-mail
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erro ao enviar e-mail:', error);
                return res.status(200).json({
                    errorStatus: false,
                    mensageStatus: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição.'
                });
            }
            console.log('E-mail de recuperação enviado: %s', info.messageId);
            return res.status(200).json({
                errorStatus: false,
                mensageStatus: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição.'
            });
        });

    } catch (error) {
        console.error('Erro na solicitação de recuperação de senha:', error);
        return res.status(500).json({ errorStatus: true, mensageStatus: 'Erro interno no servidor' });
    }
});

module.exports = router;