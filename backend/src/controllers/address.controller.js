const addressService =
    require('../services/address.service');

async function getAll(req, res) {

    try {

        const enderecos =
            await addressService.getAllAddresses(
                req.usuario.id
            );

        return res.json(enderecos);

    } catch (error) {

        return res.status(500).json({
            erro: error.message
        });

    }

}

async function create(req, res) {

    try {

        const {
            apelido,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            principal
        } = req.body;

        const endereco =
            await addressService.createAddress(
                req.usuario.id,
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

        return res.status(201).json(endereco);

    } catch (error) {

        return res.status(400).json({
            erro: error.message
        });

    }

}

async function update(req, res) {

    try {

        const {
            apelido,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            principal
        } = req.body;

        const endereco =
            await addressService.updateAddress(
                req.params.id,
                req.usuario.id,
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

        return res.json(endereco);

    } catch (error) {

        return res.status(400).json({
            erro: error.message
        });

    }

}

async function remove(req, res) {

    try {

        const resultado =
            await addressService.deleteAddress(
                req.params.id,
                req.usuario.id
            );

        return res.json(resultado);

    } catch (error) {

        return res.status(400).json({
            erro: error.message
        });

    }

}

module.exports = {
    getAll,
    create,
    update,
    remove
};