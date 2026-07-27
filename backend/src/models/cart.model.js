const db = require('../config/db');

async function getOrCreateCart(usuarioId) {

    const carrinhoExistente =
        await db.query(
            `
            SELECT *
            FROM carrinhos
            WHERE usuario_id = $1
            `,
            [usuarioId]
        );

    if (carrinhoExistente.rows.length > 0) {
        return carrinhoExistente.rows[0];
    }

    const novoCarrinho =
        await db.query(
            `
            INSERT INTO carrinhos
            (
                usuario_id
            )
            VALUES
            (
                $1
            )
            RETURNING *
            `,
            [usuarioId]
        );

    return novoCarrinho.rows[0];

}

async function addItem(
    carrinhoId,
    variacaoId,
    quantidade
) {

    const itemExistente =
        await db.query(
            `
            SELECT *
            FROM carrinho_itens
            WHERE carrinho_id = $1
            AND variacao_id = $2
            `,
            [
                carrinhoId,
                variacaoId
            ]
        );

    if (itemExistente.rows.length > 0) {

        const item =
            await db.query(
                `
                UPDATE carrinho_itens
                SET quantidade =
                    quantidade + $1
                WHERE carrinho_id = $2
                AND variacao_id = $3
                RETURNING *
                `,
                [
                    quantidade,
                    carrinhoId,
                    variacaoId
                ]
            );

        return item.rows[0];

    }

    const result =
        await db.query(
            `
            INSERT INTO carrinho_itens
            (
                carrinho_id,
                variacao_id,
                quantidade
            )
            VALUES
            (
                $1,
                $2,
                $3
            )
            RETURNING *
            `,
            [
                carrinhoId,
                variacaoId,
                quantidade
            ]
        );

    return result.rows[0];

}

async function getCart(usuarioId) {

    const result =
        await db.query(
            `
            SELECT

                ci.id,
                ci.quantidade,

                pv.id AS variacao_id,
                pv.cor,
                pv.tamanho,

                p.id AS produto_id,
                p.nome,
                p.preco,
                p.sku

            FROM carrinhos c

            INNER JOIN carrinho_itens ci
                ON ci.carrinho_id = c.id

            INNER JOIN produto_variacoes pv
                ON pv.id = ci.variacao_id

            INNER JOIN produtos p
                ON p.id = pv.produto_id

            WHERE c.usuario_id = $1

            ORDER BY ci.id DESC
            `,
            [usuarioId]
        );

    return result.rows;

}

async function updateItem(
    itemId,
    quantidade
) {

    const result =
        await db.query(
            `
            UPDATE carrinho_itens
            SET quantidade = $1
            WHERE id = $2
            RETURNING *
            `,
            [
                quantidade,
                itemId
            ]
        );

    return result.rows[0];

}

async function removeItem(
    itemId
) {

    await db.query(
        `
        DELETE FROM carrinho_itens
        WHERE id = $1
        `,
        [itemId]
    );

}
module.exports = {
    getOrCreateCart,
    addItem,
    getCart,
    updateItem,
    removeItem
};