const cartModel =
    require('../models/cart.model');

async function addItem(
    usuarioId,
    variacaoId,
    quantidade
) {

    const carrinho =
        await cartModel.getOrCreateCart(
            usuarioId
        );

    return await cartModel.addItem(
        carrinho.id,
        variacaoId,
        quantidade
    );

}

async function getCart(usuarioId) {

    return await cartModel.getCart(
        usuarioId
    );

}

async function updateItem(
    itemId,
    quantidade
) {

    return await cartModel.updateItem(
        itemId,
        quantidade
    );

}

async function removeItem(
    itemId
) {

    await cartModel.removeItem(
        itemId
    );

}

module.exports = {
    addItem,
    getCart,
    updateItem,
    removeItem
};