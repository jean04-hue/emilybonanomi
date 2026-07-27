const pool = require('../config/db');

async function list(usuarioId) {
    const r = await pool.query(`
        SELECT f.id, f.produto_id, p.nome, p.slug, p.preco, p.preco_promocional,
               (SELECT url FROM produto_imagens WHERE produto_id = p.id ORDER BY ordem LIMIT 1) AS imagem
        FROM favoritos f
        JOIN produtos p ON p.id = f.produto_id
        WHERE f.usuario_id = $1 AND p.deleted_at IS NULL
        ORDER BY f.created_at DESC
    `, [usuarioId]);
    return r.rows;
}

async function add(usuarioId, produtoId) {
    const r = await pool.query(`
        INSERT INTO favoritos (usuario_id, produto_id)
        VALUES ($1, $2)
        ON CONFLICT (usuario_id, produto_id) DO NOTHING
        RETURNING *
    `, [usuarioId, produtoId]);
    return r.rows[0] || { ja_favoritado: true };
}

async function remove(usuarioId, produtoId) {
    await pool.query(
        `DELETE FROM favoritos WHERE usuario_id = $1 AND produto_id = $2`,
        [usuarioId, produtoId]
    );
    return { ok: true };
}

async function isFavorite(usuarioId, produtoId) {
    const r = await pool.query(
        `SELECT 1 FROM favoritos WHERE usuario_id=$1 AND produto_id=$2`,
        [usuarioId, produtoId]
    );
    return r.rowCount > 0;
}

module.exports = { list, add, remove, isFavorite };
