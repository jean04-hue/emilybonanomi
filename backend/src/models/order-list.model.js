const db = require('../config/db');

async function getOrdersByUser(
    usuarioId
) {

    const result =
        await db.query(
            `
            SELECT
                id,
                codigo_pedido,
                status,
                status_pagamento,
                total,
                created_at
            FROM pedidos
            WHERE usuario_id = $1
            ORDER BY id DESC
            `,
            [usuarioId]
        );

    return result.rows;

}

module.exports = {
    getOrdersByUser
};