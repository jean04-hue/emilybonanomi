const service =
    require('../services/admin-stock.service');

async function list(
    req,
    res
) {

    try {

        const estoque =
            await service.list();

        res.json(estoque);

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

        const estoque =
            await service.update(
                req.params.produtoId,
                req.body.quantidade
            );

        res.json(estoque);

    } catch (error) {

        res.status(500).json({
            erro: error.message
        });

    }

}

module.exports = {
    list,
    update
};