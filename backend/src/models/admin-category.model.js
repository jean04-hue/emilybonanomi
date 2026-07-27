const db = require('../config/db');

async function getAllCategories() {

    const result = await db.query(
        `
        SELECT *
        FROM categorias
        ORDER BY id DESC
        `
    );

    return result.rows;

}

async function createCategory(data) {

    const result = await db.query(
        `
        INSERT INTO categorias (
            nome,
            slug,
            ativo
        )
        VALUES (
            $1,
            $2,
            true
        )
        RETURNING *
        `,
        [
            data.nome,
            data.slug
        ]
    );

    return result.rows[0];

}

async function updateCategory(
    id,
    data
) {

    const result = await db.query(
        `
        UPDATE categorias
        SET
            nome = $1,
            slug = $2
        WHERE id = $3
        RETURNING *
        `,
        [
            data.nome,
            data.slug,
            id
        ]
    );

    return result.rows[0];

}

async function deleteCategory(id) {

    await db.query(
        `
        UPDATE categorias
        SET ativo = false
        WHERE id = $1
        `,
        [id]
    );

}

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};