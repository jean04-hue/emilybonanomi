const cartService =
    require('../services/cart.service');

async function addItem(
    req,
    res
) {

    try {

        const {
            variacaoId,
            quantidade
        } = req.body;

        const item =
            await cartService.addItem(
                req.usuario.id,
                variacaoId,
                quantidade
            );

        return res.status(201).json(
            item
        );

    } catch (error) {

        return res.status(500).json({
            erro: error.message
        });

    }

}

async function getCart(
    req,
    res
) {

    try {

        const itens =
            await cartService.getCart(
                req.usuario.id
            );

        return res.json(itens);

    } catch (error) {

        return res.status(500).json({
            erro: error.message
        });

    }

}

async function updateItem(
    req,
    res
) {

    try {

        const {
            quantidade
        } = req.body;

        const item =
            await cartService.updateItem(
                req.params.id,
                quantidade
            );

        return res.json(item);

    } catch (error) {

        return res.status(500).json({
            erro: error.message
        });

    }

}

async function removeItem(
    req,
    res
) {

    try {

        await cartService.removeItem(
            req.params.id
        );

        return res.json({
            mensagem: 'Item removido'
        });

    } catch (error) {

        return res.status(500).json({
            erro: error.message
        });

    }

}

module.exports = {
    addItem,
    getCart,
    updateItem,
    removeItem
};