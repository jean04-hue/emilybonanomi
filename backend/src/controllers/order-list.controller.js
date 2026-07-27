const orderModel =
    require('../models/order.model');

async function getOrders(
    req,
    res
) {

    try {

        const pedidos =
            await orderModel.getOrdersByUser(
                req.usuario.id
            );

        return res.json(
            pedidos
        );

    } catch (error) {

        return res.status(500).json({
            erro: error.message
        });

    }

}

module.exports = {
    getOrders
};