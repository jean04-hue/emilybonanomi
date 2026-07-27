const db = require('../config/db');

async function searchProducts(term) {

    const result = await db.query(
        `
        SELECT
            id,
            nome,
            slug,
            descricao,
            preco
        FROM produtos
        WHERE ativo = true
        AND (
            LOWER(nome) LIKE LOWER($1)
            OR LOWER(descricao) LIKE LOWER($1)
        )
        ORDER BY nome
        `,
        [`%${term}%`]
    );

    return result.rows;
}

async function getProductsByCategory(categoryId) {

    const result = await db.query(
        `
        SELECT
            p.id,
            p.nome,
            p.slug,
            p.descricao,
            p.preco
        FROM produtos p
        INNER JOIN produto_categorias pc
            ON pc.produto_id = p.id
        WHERE pc.categoria_id = $1
        AND p.ativo = true
        ORDER BY p.nome
        `,
        [categoryId]
    );

    return result.rows;
}

async function getProductBySlug(slug) {

    const result = await db.query(
        `
        SELECT *
        FROM produtos
        WHERE slug = $1
        AND ativo = true
        `,
        [slug]
    );

    return result.rows[0];
}

module.exports = {
    searchProducts,
    getProductsByCategory,
    getProductBySlug
};