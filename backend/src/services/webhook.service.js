const { Payment } = require('mercadopago');
const client        = require('../config/mercadopago');
const orderModel    = require('../models/order.model');
const paymentModel  = require('../models/payment.model');

async function processPayment(paymentId) {

    const payment = new Payment(client);
    const data    = await payment.get({ id: paymentId });

    await orderModel.updateOrderPaymentStatus(paymentId, data.status);

    try {
        await paymentModel.updateStatusByPaymentId(paymentId, data.status);
    } catch (e) {
        console.warn('[webhook pagamentos]', e.message);
    }

    return data;
}

module.exports = { processPayment };
