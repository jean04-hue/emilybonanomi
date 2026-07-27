const db = require('../config/db');

async function list(produtoId) {
    const r = await db.query(
        `SELECT id, produto_id, sku_variacao, cor, tamanho, estoque
         FROM produto_variacoes WHERE produto_id = $1 ORDER BY cor, tamanho`,
        [produtoId]
    );
    return r.rows;
}

async function create(produtoId, { sku_variacao, cor, tamanho, estoque }) {
    const sku = sku_variacao || `P${produtoId}-${cor}-${tamanho}-${Date.now()}`;
    const r = await db.query(
        `INSERT INTO produto_variacoes (produto_id, sku_variacao, cor, tamanho, estoque)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [produtoId, sku, cor, tamanho, estoque || 0]
    );
    return r.rows[0];
}

async function update(id, { cor, tamanho, estoque }) {
    const r = await db.query(
        `UPDATE produto_variacoes
         SET cor=COALESCE($1,cor), tamanho=COALESCE($2,tamanho),
             estoque=COALESCE($3,estoque), updated_at=CURRENT_TIMESTAMP
         WHERE id=$4 RETURNING *`,
        [cor, tamanho, estoque, id]
    );
    return r.rows[0];
}

async function remove(id) {
    await db.query('DELETE FROM produto_variacoes WHERE id=$1', [id]);
}

module.exports = { list, create, update, remove };
