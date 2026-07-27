const db = require('../config/db');

async function savePayment(pedidoId, pagamento) {
    const result = await db.query(
        `
        INSERT INTO pagamentos
            (pedido_id, payment_id, qr_code, qr_code_base64, ticket_url, status, valor, expira_em)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
        `,
        [
            pedidoId,
            String(pagamento.paymentId),
            pagamento.qrCode,
            pagamento.qrCodeBase64,
            pagamento.ticketUrl || null,
            pagamento.status || 'pending',
            pagamento.valor || null,
            pagamento.expiraEm || null
        ]
    );
    return result.rows[0];
}

async function getLatestByPedido(pedidoId) {
    const result = await db.query(
        `SELECT * FROM pagamentos WHERE pedido_id = $1 ORDER BY id DESC LIMIT 1`,
        [pedidoId]
    );
    return result.rows[0];
}

async function updateStatusByPaymentId(paymentId, status) {
    await db.query(
        `UPDATE pagamentos SET status = $1, updated_at = NOW() WHERE payment_id = $2`,
        [status, String(paymentId)]
    );
}

async function getByPaymentId(paymentId) {
    const result = await db.query(
        `SELECT * FROM pagamentos WHERE payment_id = $1 ORDER BY id DESC LIMIT 1`,
        [String(paymentId)]
    );
    return result.rows[0];
}

module.exports = {
    savePayment,
    getLatestByPedido,
    updateStatusByPaymentId,
    getByPaymentId
};
