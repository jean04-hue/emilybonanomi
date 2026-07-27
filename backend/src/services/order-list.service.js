const orderListModel =
    require('../models/order-list.model');

async function getOrders(
    usuarioId
) {

    return await orderListModel.getOrdersByUser(
        usuarioId
    );

}

module.exports = {
    getOrders
};