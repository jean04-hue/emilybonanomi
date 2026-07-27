const service =
    require('../services/admin-category.service');

async function list(
    req,
    res
) {

    try {

        const categorias =
            await service.list();

        res.json(categorias);

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });

    }

}

async function create(
    req,
    res
) {

    try {

        const categoria =
            await service.create(
                req.body
            );

        res.status(201).json(
            categoria
        );

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });

    }

}

async function update(
    req,
    res
) {

    try {

        const categoria =
            await service.update(
                req.params.id,
                req.body
            );

        res.json(categoria);

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });

    }

}

async function remove(
    req,
    res
) {

    try {

        await service.remove(
            req.params.id
        );

        res.json({
            mensagem:
                'Categoria desativada'
        });

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });

    }

}

module.exports = {
    list,
    create,
    update,
    remove
};