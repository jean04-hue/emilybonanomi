const { Payment } = require('mercadopago');
const client = require('../config/mercadopago');

async function createPixPayment(pedido, payerEmail) {

    const payment = new Payment(client);

    const result = await payment.create({
        body: {
            transaction_amount: Number(pedido.total),
            description: `Pedido ${pedido.codigo_pedido}`,
            payment_method_id: 'pix',
            payer: {
    email: "financeiro.neiderjean@gmail.com"
},
            external_reference: String(pedido.id),
            notification_url: process.env.MP_WEBHOOK_URL || undefined
        }
    });

    const txData = result.point_of_interaction.transaction_data;

    return {
        paymentId: result.id,
        qrCode: txData.qr_code,
        qrCodeBase64: txData.qr_code_base64,
        ticketUrl: txData.ticket_url,
        expiraEm: result.date_of_expiration
    };
}

module.exports = { createPixPayment };