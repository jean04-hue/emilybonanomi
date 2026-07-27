const orderDetailsService =
    require('../services/order-details.service');

async function getOrderDetails(
    req,
    res
) {

    try {

        const pedido =
    await orderDetailsService.getOrderDetails(
        req.params.id,
        req.usuario
    );

        return res.json(
            pedido
        );

    } catch (error) {

        return res.status(404).json({
            erro: error.message
        });

    }

}

module.exports = {
    getOrderDetails
};