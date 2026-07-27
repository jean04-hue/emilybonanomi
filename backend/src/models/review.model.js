const pool = require('../config/db');

async function listByProduct(produtoId) {
    const r = await pool.query(`
        SELECT a.id, a.nota, a.comentario, a.created_at,
               u.nome || ' ' || COALESCE(LEFT(u.sobrenome,1)||'.','') AS cliente
        FROM avaliacoes a
        JOIN usuarios u ON u.id = a.usuario_id
        WHERE a.produto_id = $1
        ORDER BY a.created_at DESC
    `, [produtoId]);
    return r.rows;
}

async function summary(produtoId) {
    const r = await pool.query(`
        SELECT COUNT(*)::int AS total, COALESCE(AVG(nota),0)::numeric(3,2) AS media
        FROM avaliacoes WHERE produto_id = $1
    `, [produtoId]);
    return r.rows[0];
}

async function clienteJaComprou(usuarioId, produtoId) {
    const r = await pool.query(`
        SELECT 1 FROM pedidos p
        JOIN pedido_itens pi ON pi.pedido_id = p.id
        WHERE p.usuario_id = $1 AND pi.produto_id = $2
          AND p.status IN ('entregue','enviado','pago','separando')
        LIMIT 1
    `, [usuarioId, produtoId]);
    return r.rowCount > 0;
}

async function create(usuarioId, produtoId, nota, comentario) {

    const existente = await pool.query(
        `
        SELECT id
        FROM avaliacoes
        WHERE usuario_id = $1
        AND produto_id = $2
        `,
        [usuarioId, produtoId]
    );

    if (existente.rowCount > 0) {
        throw new Error(
            'Você já avaliou este produto.'
        );
    }

    const r = await pool.query(
        `
        INSERT INTO avaliacoes
        (
            usuario_id,
            produto_id,
            nota,
            comentario
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4
        )
        RETURNING *
        `,
        [
            usuarioId,
            produtoId,
            nota,
            comentario
        ]
    );

    return r.rows[0];

}

async function usuarioJaAvaliou(usuarioId, produtoId) {

    const r = await pool.query(
        `
        SELECT 1
        FROM avaliacoes
        WHERE usuario_id = $1
        AND produto_id = $2
        LIMIT 1
        `,
        [
            usuarioId,
            produtoId
        ]
    );

    return r.rowCount > 0;

}

async function remove(id) {
    await pool.query(`DELETE FROM avaliacoes WHERE id=$1`, [id]);
    return { ok: true };
}

async function listAll() {
    const r = await pool.query(`
        SELECT a.*, p.nome AS produto, u.nome AS cliente
        FROM avaliacoes a
        JOIN produtos p ON p.id = a.produto_id
        JOIN usuarios u ON u.id = a.usuario_id
        ORDER BY a.created_at DESC LIMIT 200
    `);
    return r.rows;
}

module.exports = {
    listByProduct,
    summary,
    create,
    clienteJaComprou,
    usuarioJaAvaliou,
    remove,
    listAll
};