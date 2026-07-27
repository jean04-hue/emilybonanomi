const db = require('../config/db');

// Cria uma mídia (imagem ou vídeo). "cor" pode ser NULL (mídia geral).
async function createImage(produtoId, url, { cor = null, tipo = 'imagem' } = {}) {
    const result = await db.query(
        `INSERT INTO produto_imagens (produto_id, url, cor, tipo, ordem)
         VALUES ($1, $2, $3, $4,
            (SELECT COALESCE(MAX(ordem),0)+1 FROM produto_imagens WHERE produto_id = $1))
         RETURNING *`,
        [produtoId, url, cor, tipo]
    );
    return result.rows[0];
}

// Lista todas as mídias do produto (ordem asc). Loja/admin usam este endpoint.
async function getImagesByProduct(produtoId) {
    const result = await db.query(
        `SELECT id, produto_id, url, cor, tipo, ordem, created_at
         FROM produto_imagens
         WHERE produto_id = $1
         ORDER BY ordem ASC, id ASC`,
        [produtoId]
    );
    return result.rows;
}

async function getImageById(id) {
    const result = await db.query(
        `SELECT * FROM produto_imagens WHERE id = $1`, [id]
    );
    return result.rows[0];
}

async function deleteImage(id) {
    await db.query(`DELETE FROM produto_imagens WHERE id = $1`, [id]);
}

async function updateOrder(id, ordem) {
    await db.query(`UPDATE produto_imagens SET ordem = $1 WHERE id = $2`, [ordem, id]);
}

module.exports = { createImage, getImagesByProduct, getImageById, deleteImage, updateOrder };
