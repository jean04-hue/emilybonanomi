const addressModel = require('../models/address.model');

async function getAllAddresses(userId) {
    return await addressModel.findAllByUser(userId);
}

async function createAddress(
    userId,
    apelido,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    principal
) {

    if (principal) {
        await addressModel.clearPrincipal(userId);
    }

    return await addressModel.create(
        userId,
        apelido,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        principal
    );
}

async function updateAddress(
    id,
    userId,
    apelido,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    principal
) {

    const endereco =
        await addressModel.findById(id, userId);

    if (!endereco) {
        throw new Error('Endereço não encontrado');
    }

    if (principal) {
        await addressModel.clearPrincipal(userId);
    }

    return await addressModel.update(
        id,
        userId,
        apelido,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        principal
    );
}

async function deleteAddress(
    id,
    userId
) {

    const endereco =
        await addressModel.findById(id, userId);

    if (!endereco) {
        throw new Error('Endereço não encontrado');
    }

    await addressModel.remove(
        id,
        userId
    );

    return {
        sucesso: true
    };
}

module.exports = {
    getAllAddresses,
    createAddress,
    updateAddress,
    deleteAddress
};