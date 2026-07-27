const orderDetailsModel =
    require('../models/order-details.model');

async function getOrderDetails(
    pedidoId,
    usuario
) {

    console.log('USUARIO:', usuario);

    let pedido;

    if (
        usuario.tipo_usuario === 'admin'
    ) {

        console.log('ENTROU COMO ADMIN');

        pedido =
            await orderDetailsModel.getOrderByIdAdmin(
                pedidoId
            );

    } else {

        console.log('ENTROU COMO CLIENTE');

        pedido =
            await orderDetailsModel.getOrderById(
                pedidoId,
                usuario.id
            );

    }


    console.log('PEDIDO:', pedido);
    
    if (!pedido) {

        throw new Error(
            'Pedido não encontrado'
        );

    }

    const itens =
        await orderDetailsModel.getOrderItems(
            pedidoId
        );

    pedido.itens = itens;

    return pedido;

}

module.exports = {
    getOrderDetails
};