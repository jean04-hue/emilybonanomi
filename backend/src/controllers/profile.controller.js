const profileService =
    require('../services/profile.service');

async function getProfile(req, res) {
    try {

        const usuario =
            await profileService.getProfile(
                req.usuario.id
            );

        return res.json(usuario);

    } catch (error) {

        return res.status(404).json({
            erro: error.message
        });

    }
}

async function updateProfile(req, res) {
    try {

        const {
            nome,
            sobrenome,
            telefone
        } = req.body;

        const usuario =
            await profileService.updateProfile(
                req.usuario.id,
                nome,
                sobrenome,
                telefone
            );

        return res.json(usuario);

    } catch (error) {

        return res.status(400).json({
            erro: error.message
        });

    }
}

async function updatePassword(req, res) {
    try {

        const {
            senhaAtual,
            novaSenha
        } = req.body;

        await profileService.updatePassword(
            req.usuario.id,
            senhaAtual,
            novaSenha
        );

        return res.json({
            mensagem:
                'Senha alterada com sucesso. Faça login novamente.'
        });

    } catch (error) {

        return res.status(400).json({
            erro: error.message
        });

    }
}

async function resetTempPassword(req, res) {
    try {
        const { novaSenha } = req.body;

        if (!novaSenha || novaSenha.length < 6) {
            return res.status(400).json({ erro: 'A nova senha deve ter no mínimo 6 caracteres.' });
        }

        await profileService.resetTempPassword(req.usuario.id, novaSenha);

        return res.json({
            mensagem: 'Senha alterada com sucesso! Você já pode navegar na loja.'
        });

    } catch (error) {
        return res.status(400).json({
            erro: error.message
        });
    }
}

// Lembre-se de exportar junto com os outros:
module.exports = {
    getProfile,
    updateProfile,
    updatePassword,
    resetTempPassword
};