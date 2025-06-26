const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Register = require('../models/registro'); 
const PasswordResetToken = require('../models/passwordResetToken');

router.post('/:userId/:token', async (req, res) => {
    const { userId, token } = req.params;
    const { newPassword } = req.body;

    try {
        // 1. Encontrar o token no banco de dados
        const passwordResetToken = await PasswordResetToken.findOne({ userId, token });

        if (!passwordResetToken) {
            return res.status(400).json({ errorStatus: true, mensageStatus: 'Link de redefinição inválido ou expirado.' });
        }

        // 2. Encontrar o usuário
        const user = await Register.findById(userId);
        if (!user) {
            return res.status(400).json({ errorStatus: true, mensageStatus: 'Usuário não encontrado.' });
        }

        // 3. Hash da nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10); 

        // 4. Atualizar a senha do usuário
        user.senha = hashedPassword; 
        await user.save();

        // 5. Deletar o token usado para evitar reutilização
        await PasswordResetToken.deleteOne({ _id: passwordResetToken._id });

        return res.status(200).json({ errorStatus: false, mensageStatus: 'Senha redefinida com sucesso!' });

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        return res.status(500).json({ errorStatus: true, mensageStatus: 'Erro interno no servidor' });
    }
});

module.exports = router;