const authService = require('../services/auth.service');

async function register(req, res) {
    try {

        const usuario =
            await authService.register(req.body);

        return res.status(201).json(usuario);

    } catch (error) {

        return res.status(400).json({
            erro: error.message
        });

    }
}

async function login(req, res) {
    try {

        const { email, senha } = req.body;

        const resultado =
            await authService.login(
                email,
                senha
            );

        return res.json(resultado);

    } catch (error) {

        return res.status(401).json({
            erro: error.message
        });

    }
}

async function forgotPassword(req, res) {

    try {

        const { email } = req.body;

        await authService.forgotPassword(email);

        return res.json({
            mensagem:
                'Se existir uma conta para este e-mail, enviaremos as instruções.'
        });

    } catch (err) {

        return res.status(400).json({
            erro: err.message
        });

    }

}

async function resetPasswordByToken(req, res) {

    try {

        const {

            token,

            novaSenha

        } = req.body;

        await authService.resetPasswordByToken(
            token,
            novaSenha
        );

        return res.json({

            sucesso: true

        });

    } catch (err) {

        return res.status(400).json({

            erro: err.message

        });

    }

}

module.exports = {
    register,
    login,
    forgotPassword,
    resetPasswordByToken
};