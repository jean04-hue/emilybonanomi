const orderModel   = require('../models/order.model');
const paymentModel = require('../models/payment.model');
const paymentService = require('./payment.service');

async function createOrder(usuarioId, enderecoId, payerEmail) {

    const itens = await orderModel.getCartItems(usuarioId);

    if (itens.length === 0) {
        throw new Error('Carrinho vazio');
    }

    let subtotal = 0;
    for (const item of itens) {
        if (item.quantidade > item.estoque) {
            throw new Error(`Estoque insuficiente para ${item.nome}`);
        }
        subtotal += Number(item.subtotal);
    }

    const total = subtotal;

    const pedido = await orderModel.createOrder(
        usuarioId, enderecoId, subtotal, total
    );

    for (const item of itens) {
        await orderModel.createOrderItem(pedido.id, item);
        await orderModel.decreaseStock(item.variacao_id, item.quantidade);
    }

    await orderModel.clearCart(usuarioId);

    const pagamento = await paymentService.createPixPayment(pedido, payerEmail);

    await orderModel.updatePaymentData(pedido.id, pagamento.paymentId);

    // Persiste também na tabela dedicada `pagamentos`
    try {
        await paymentModel.savePayment(pedido.id, {
            ...pagamento,
            status: 'pending',
            valor: pedido.total
        });
    } catch (e) {
        console.warn('[pagamentos] falha ao salvar:', e.message);
    }

    return { pedido, pagamento };
}

async function cancelOrder(pedidoId, usuarioId) {

    const pedido = await orderModel.getOrderById(pedidoId, usuarioId);
    if (!pedido) throw new Error('Pedido não encontrado');
    if (pedido.status_pagamento === 'approved') {
        throw new Error('Pedido já foi pago');
    }
    if (['enviado','entregue'].includes(pedido.status)) {
        throw new Error('Pedido já foi enviado, não pode ser cancelado');
    }

    const itens = await orderModel.getOrderItems(pedidoId);
    for (const item of itens) {
        await orderModel.increaseStock(item.variacao_id, item.quantidade);
    }

    await orderModel.cancelOrder(pedidoId);

    return { mensagem: 'Pedido cancelado com sucesso' };
}

module.exports = { createOrder, cancelOrder };
