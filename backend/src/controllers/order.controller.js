const orderService = require('../services/order.service');

async function createOrder(req, res) {
    try {
        const { enderecoId } = req.body;
        const pedido = await orderService.createOrder(
            req.usuario.id,
            enderecoId,
            req.usuario.email
        );
        return res.json(pedido);
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            erro: error.message
        });
    }
}

async function cancelOrder(req, res) {
    try {
        const resultado = await orderService.cancelOrder(
            req.params.id,
            req.usuario.id
        );
        return res.json(resultado);
    } catch (error) {
        console.error(error); // Boa prática: manter o log de erro consistente com o createOrder
        return res.status(400).json({ 
            erro: error.message 
        });
    }
}

// Exportação unificada de todas as funções do controller
module.exports = { 
    createOrder, 
    cancelOrder 
};