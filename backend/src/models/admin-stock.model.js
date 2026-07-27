const db = require('../config/db');

async function getAllStock() {

    const result = await db.query(
        `
        SELECT
            e.id,
            e.produto_id,
            p.nome,
            p.sku,
            e.quantidade,
            e.atualizado_em
        FROM estoque e
        INNER JOIN produtos p
            ON p.id = e.produto_id
        ORDER BY p.nome
        `
    );

    return result.rows;

}

async function updateStock(
    produtoId,
    quantidade
) {

    const result = await db.query(
        `
        UPDATE estoque
        SET
            quantidade = $1,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE produto_id = $2
        RETURNING *
        `,
        [
            quantidade,
            produtoId
        ]
    );

    return result.rows[0];

}

async function createStock(produtoId) {

    const result = await db.query(
        `
        INSERT INTO estoque (
            produto_id,
            quantidade
        )
        VALUES (
            $1,
            0
        )
        RETURNING *
        `,
        [produtoId]
    );

    return result.rows[0];

}

module.exports = {
    getAllStock,
    updateStock,
    createStock
};