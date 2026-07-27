const db = require('../config/db');

async function createProduct(data) {
    const result = await db.query(
        `INSERT INTO produtos (sku, nome, slug, descricao, preco, categoria_id, destaque, ativo)
         VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING *`,
        [data.sku, data.nome, data.slug, data.descricao,
         data.preco, data.categoria_id, !!data.destaque]);
    return result.rows[0];
}

async function updateProduct(id, data) {
    const result = await db.query(
        `UPDATE produtos SET
            nome = $1, descricao = $2, preco = $3,
            categoria_id = $4, destaque = COALESCE($5, destaque),
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 RETURNING *`,
        [data.nome, data.descricao, data.preco,
         data.categoria_id,
         (typeof data.destaque === 'boolean') ? data.destaque : null,
         id]);
    return result.rows[0];
}

async function setFeatured(id, destaque) {
    // Exclusivo: se marcar destaque, desmarca os demais.
    if (destaque) {
        await db.query(`UPDATE produtos SET destaque = false WHERE destaque = true AND id <> $1`, [id]);
    }
    const r = await db.query(
        `UPDATE produtos SET destaque = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 RETURNING *`, [!!destaque, id]);
    return r.rows[0];
}

async function deleteProduct(id) {
    await db.query(`UPDATE produtos SET ativo = false WHERE id = $1`, [id]);
}

async function getAllAdmin() {
    const result = await db.query(
        `SELECT p.*, c.nome AS categoria_nome
         FROM produtos p LEFT JOIN categorias c ON c.id = p.categoria_id
         ORDER BY p.id DESC`);
    return result.rows;
}

module.exports = { createProduct, updateProduct, setFeatured, deleteProduct, getAllAdmin };
