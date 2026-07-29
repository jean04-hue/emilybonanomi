const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const emailService = require('./email.service');

async function register(userData) {

    const {
        nome,
        sobrenome,
        cpf,
        email,
        telefone,
        senha
    } = userData;

    const usuarioExistente =
        await userModel.findByEmail(email);

    if (usuarioExistente) {
        throw new Error('E-mail já cadastrado');
    }

    const senhaHash =
        await bcrypt.hash(senha, 10);

    return await userModel.create({
        nome,
        sobrenome,
        cpf,
        email,
        telefone,
        senhaHash
    });
}

async function login(email, senha) {

    const usuario = await userModel.findByEmail(email);

    if (!usuario) {
        throw new Error('E-mail ou senha inválidos');
    }

    if (!usuario.ativo) {
        throw new Error(
            'Sua conta foi desativada. Entre em contato com o administrador.'
        );
    }

    const senhaCorreta = await bcrypt.compare(
        senha,
        usuario.senha_hash
    );

    if (!senhaCorreta) {
        throw new Error('E-mail ou senha inválidos');
    }

    const token = jwt.sign(
        {
            id: usuario.id,
            email: usuario.email,
            tipo_usuario: usuario.tipo_usuario,
            senha_temporaria: usuario.senha_temporaria || false
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );

    return {
        token,
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo_usuario: usuario.tipo_usuario,
            senha_temporaria: usuario.senha_temporaria || false
        }
    };
}

async function forgotPassword(email) {

    const usuario =
        await userModel.findByEmail(email);

    if (!usuario) {

        return;

    }

    const token =
        jwt.sign(

            {

                id: usuario.id,

                recovery: true

            },

            process.env.JWT_SECRET,

            {

                expiresIn: '30m'

            }

        );

console.log(
'FRONTEND_LOJA_URL:',
process.env.FRONTEND_LOJA_URL
);

const link =
`${process.env.FRONTEND_LOJA_URL}/alterar-senha.html?token=${token}`;

console.log('LINK GERADO:', link);

try {

    await emailService.enviarEmailRecuperacao({
        to: usuario.email,
        nome: usuario.nome,
        link
    });

    console.log("EMAIL ENVIADO COM SUCESSO");

} catch (err) {

    console.error("ERRO AO ENVIAR EMAIL");

    console.error(err);

    throw err;

}

}

async function resetPasswordByToken(

    token,

    novaSenha

) {

    const decoded =
        jwt.verify(

            token,

            process.env.JWT_SECRET

        );

    if (

        !decoded.recovery

    ) {

        throw new Error(

            'Token inválido.'

        );

    }

    const hash =
        await bcrypt.hash(

            novaSenha,

            10

        );

    await userModel.updatePassword(

        decoded.id,

        hash

    );

}

module.exports = {
    register,
    login,
    forgotPassword,
    resetPasswordByToken
};