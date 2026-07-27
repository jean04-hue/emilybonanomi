const db = require('../config/db');

async function getCartItems(
    usuarioId
) {

    const result =
        await db.query(
            `
            SELECT

                ci.id,
                ci.quantidade,

                pv.id AS variacao_id,
                pv.estoque,

                p.id AS produto_id,
                p.nome,
                p.sku,
                p.preco,

                (
                    p.preco *
                    ci.quantidade
                ) AS subtotal

            FROM carrinhos c

            INNER JOIN carrinho_itens ci
                ON ci.carrinho_id = c.id

            INNER JOIN produto_variacoes pv
                ON pv.id = ci.variacao_id

            INNER JOIN produtos p
                ON p.id = pv.produto_id

            WHERE c.usuario_id = $1
            `,
            [usuarioId]
        );

    return result.rows;

}

async function createOrder(
    usuarioId,
    enderecoId,
    subtotal,
    total
) {

    const codigoPedido =
        'PED' +
        Date.now();

    const result =
        await db.query(
            `
            INSERT INTO pedidos
            (
                codigo_pedido,
                usuario_id,
                endereco_id,
                subtotal,
                total
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5
            )
            RETURNING *
            `,
            [
                codigoPedido,
                usuarioId,
                enderecoId,
                subtotal,
                total
            ]
        );

    return result.rows[0];

}

async function createOrderItem(
    pedidoId,
    item
) {

    await db.query(
        `
        INSERT INTO pedido_itens
        (
            pedido_id,
            produto_id,
            variacao_id,
            sku,
            nome_produto,
            cor,
            tamanho,
            preco_unitario,
            quantidade,
            subtotal
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10
        )
        `,
        [
            pedidoId,
            item.produto_id,
            item.variacao_id,
            item.sku,
            item.nome,
            'Unico',
            'U',
            item.preco,
            item.quantidade,
            item.subtotal
        ]
    );

}

async function decreaseStock(
    variacaoId,
    quantidade
) {

    await db.query(
        `
        UPDATE produto_variacoes
        SET estoque =
            estoque - $1
        WHERE id = $2
        `,
        [
            quantidade,
            variacaoId
        ]
    );

}

async function clearCart(
    usuarioId
) {

    await db.query(
        `
        DELETE FROM carrinho_itens
        WHERE carrinho_id IN
        (
            SELECT id
            FROM carrinhos
            WHERE usuario_id = $1
        )
        `,
        [usuarioId]
    );

}

async function updatePaymentData(
    pedidoId,
    paymentId
) {

    await db.query(
        `
        UPDATE pedidos
        SET
            mercadopago_payment_id = $1
        WHERE id = $2
        `,
        [
            paymentId,
            pedidoId
        ]
    );

}

async function updateOrderPaymentId(
    pedidoId,
    paymentId
) {

    await db.query(
        `
        UPDATE pedidos
        SET mercadopago_payment_id = $1
        WHERE id = $2
        `,
        [
            String(paymentId),
            pedidoId
        ]
    );

}

async function updateOrderPaymentStatus(
    paymentId,
    statusPagamento
) {

    let statusPedido =
        'aguardando_pagamento';

    if (
        statusPagamento === 'approved'
    ) {

        statusPedido =
            'pago';

    }

    await db.query(
        `
        UPDATE pedidos
        SET
            status_pagamento = $1,
            status = $2
        WHERE mercadopago_payment_id = $3
        `,
        [
            statusPagamento,
            statusPedido,
            paymentId
        ]
    );

}

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
            ORDER BY created_at DESC
            `,
            [usuarioId]
        );

    return result.rows;

}

async function getOrderById(
    pedidoId,
    usuarioId
) {

    const result =
        await db.query(
            `
            SELECT *
            FROM pedidos
            WHERE id = $1
            AND usuario_id = $2
            `,
            [
                pedidoId,
                usuarioId
            ]
        );

    return result.rows[0];

}

async function getOrderItems(
    pedidoId
) {

    const result =
        await db.query(
            `
            SELECT
                variacao_id,
                quantidade
            FROM pedido_itens
            WHERE pedido_id = $1
            `,
            [pedidoId]
        );

    return result.rows;

}

async function increaseStock(
    variacaoId,
    quantidade
) {

    await db.query(
        `
        UPDATE produto_variacoes
        SET estoque =
            estoque + $1
        WHERE id = $2
        `,
        [
            quantidade,
            variacaoId
        ]
    );

}

async function cancelOrder(
    pedidoId
) {

    await db.query(
        `
        UPDATE pedidos
        SET
            status = 'cancelado',
            status_pagamento = 'cancelled'
        WHERE id = $1
        `,
        [pedidoId]
    );

}


module.exports = {
    getCartItems,
    createOrder,
    createOrderItem,
    decreaseStock,
    increaseStock,
    clearCart,
    updatePaymentData,
    updateOrderPaymentId,
    updateOrderPaymentStatus,
    getOrdersByUser,
    getOrderById,
    getOrderItems,
    cancelOrder
};