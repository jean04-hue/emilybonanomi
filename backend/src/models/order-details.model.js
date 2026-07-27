const db = require('../config/db');

async function getOrderById(
    pedidoId,
    usuarioId
) {

    console.log(">>> ORDER DETAILS MODEL EXECUTADO <<<");

    const result =
        await db.query(
            `
            SELECT

p.id,
p.codigo_pedido,
p.usuario_id,
p.mercadopago_payment_id,
p.status,
p.status_pagamento,
p.subtotal,
p.frete,
p.desconto,
p.total,
p.created_at,

e.id AS endereco_id,
e.apelido,
e.cep,
e.logradouro,
e.numero,
e.complemento,
e.bairro,
e.cidade,
e.estado

FROM pedidos p

LEFT JOIN enderecos e
ON e.id = p.endereco_id

WHERE p.id=$1
AND p.usuario_id=$2
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
                pi.produto_id,
                pi.variacao_id,
                pi.sku,
                pi.nome_produto,
                pi.cor,
                pi.tamanho,
                pi.preco_unitario,
                pi.quantidade,
                pi.subtotal,

                (
                    SELECT url
                    FROM produto_imagens
                    WHERE produto_id = pi.produto_id
                    ORDER BY ordem
                    LIMIT 1
                ) AS imagem

            FROM pedido_itens pi
            WHERE pi.pedido_id = $1
            ORDER BY pi.id
            `,
            [pedidoId]
        );

    return result.rows;

}

async function getOrderByIdAdmin(pedidoId) {

    const result = await db.query(
        `
        SELECT

p.id,
p.codigo_pedido,
p.usuario_id,
p.mercadopago_payment_id,
p.status,
p.status_pagamento,
p.subtotal,
p.frete,
p.desconto,
p.total,
p.created_at,

e.id AS endereco_id,
e.apelido,
e.cep,
e.logradouro,
e.numero,
e.complemento,
e.bairro,
e.cidade,
e.estado

FROM pedidos p

LEFT JOIN enderecos e
ON e.id = p.endereco_id

WHERE p.id=$1
        `,
        [pedidoId]
    );

    return result.rows[0];

}

module.exports = {
    getOrderById,
    getOrderByIdAdmin,
    getOrderItems
};