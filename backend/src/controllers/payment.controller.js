console.log('######## PAYMENT CONTROLLER CARREGADO ########');

const paymentService = require('../services/payment.service');
const paymentModel   = require('../models/payment.model');
const orderModel     = require('../models/order.model');
const { Payment }    = require('mercadopago');
const mpClient       = require('../config/mercadopago');

// POST /api/payments/pix   { pedidoId }
async function createPix(req, res) {
    try {
        const { pedidoId } = req.body;
        if (!pedidoId) {
            return res.status(400).json({ erro: 'pedidoId é obrigatório' });
        }

        const pedido = await orderModel.getOrderById(pedidoId, req.usuario.id);
        if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

        // Se já existe pagamento pendente, retorna o mesmo
        const existente = await paymentModel.getLatestByPedido(pedidoId);
        if (existente && existente.status === 'pending' && existente.qr_code) {
            return res.json({
                paymentId:    existente.payment_id,
                status:       existente.status,
                qrCode:       existente.qr_code,
                qrCodeBase64: existente.qr_code_base64
            });
        }

        const pagamento = await paymentService.createPixPayment(pedido, req.usuario.email);

        await orderModel.updatePaymentData(pedido.id, pagamento.paymentId);
        await paymentModel.savePayment(pedido.id, {
            ...pagamento,
            status: 'pending',
            valor: pedido.total
        });

        return res.json({
            paymentId:    pagamento.paymentId,
            status:       'pending',
            qrCode:       pagamento.qrCode,
            qrCodeBase64: pagamento.qrCodeBase64
        });
    } catch (error) {
        console.error('[createPix]', error);
        return res.status(400).json({ erro: error.message });
    }
}

// GET /api/payments/:pedidoId/status
// GET /api/payments/:pedidoId/status
async function getStatus(req, res) {

    console.log("================================");
    console.log("ENTROU NO GET STATUS");
    console.log(req.params);
    console.log(req.usuario);
    console.log("================================");

    try {

        const pedidoId = req.params.pedidoId;

        console.log('Pedido:', pedidoId);

        const pedido = await orderModel.getOrderById(
            pedidoId,
            req.usuario.id
        );

        console.log("PEDIDO:");
        console.log(pedido);

        if (!pedido) {
            return res.status(404).json({
                erro: 'Pedido não encontrado'
            });
        }

        const pagamento = await paymentModel.getLatestByPedido(pedidoId);

        console.log('Pagamento encontrado:');
        console.log(pagamento);

        if (!pagamento) {
            console.log('SEM PAGAMENTO');
            return res.json({
                status: pedido.status_pagamento || 'pending'
            });
        }

        console.log('ANTES DO MP');

        try {

            console.log('Criando client');

            const mp = new Payment(mpClient);

            console.log('Consultando pagamento');

            const dados = await mp.get({
                id: pagamento.payment_id
            });

            console.log('RESPOSTA MP');
            console.log(dados);

            if (
    dados.status &&
    dados.status !== pagamento.status
) {

    await paymentModel.updateStatusByPaymentId(
        pagamento.payment_id,
        dados.status
    );

    await orderModel.updateOrderPaymentStatus(
        pagamento.payment_id,
        dados.status
    );

    pagamento.status = dados.status;
}

        } catch (e) {

            console.log('ERRO MP');
            console.log(e);

        }

        console.log('DEPOIS DO MP');

        return res.json({
            status: pagamento.status
        });

    } catch (error) {

        console.error('[getStatus]', error);

        return res.status(400).json({
            erro: error.message
        });

    }
}

module.exports = {
    createPix,
    getStatus
};