const bcrypt = require('bcryptjs');
const profileModel = require('../models/profile.model');

async function getProfile(userId) {
    const usuario = await profileModel.findById(userId);

    if (!usuario) {
        throw new Error('Usuário não encontrado');
    }

    return usuario;
}

async function updateProfile(
    userId,
    nome,
    sobrenome,
    telefone
) {
    const usuario = await profileModel.findById(userId);

    if (!usuario) {
        throw new Error('Usuário não encontrado');
    }

    return await profileModel.updateProfile(
        userId,
        nome,
        sobrenome,
        telefone
    );
}

async function updatePassword(
    userId,
    senhaAtual,
    novaSenha
) {
    const usuario =
        await profileModel.findPasswordById(userId);

    if (!usuario) {
        throw new Error('Usuário não encontrado');
    }

    const senhaValida =
        await bcrypt.compare(
            senhaAtual,
            usuario.senha_hash
        );

    if (!senhaValida) {
        throw new Error('Senha atual inválida');
    }

    const novaSenhaHash =
        await bcrypt.hash(novaSenha, 10);

    await profileModel.updatePassword(
        userId,
        novaSenhaHash
    );

    return {
        sucesso: true
    };
}

async function resetTempPassword(
    userId,
    novaSenha
) {

    const usuario =
        await profileModel.findById(
            userId
        );

    if (!usuario) {

        throw new Error(
            'Usuário não encontrado'
        );

    }

    const novaSenhaHash =
        await bcrypt.hash(
            novaSenha,
            10
        );

    await profileModel.resetTempPassword(
        userId,
        novaSenhaHash
    );

    return {

        sucesso: true

    };

}

module.exports = {
    getProfile,
    updateProfile,
    updatePassword,
    resetTempPassword // <-- Adicionado
};