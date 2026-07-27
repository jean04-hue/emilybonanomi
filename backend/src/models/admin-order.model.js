const pool = require('../config/db');

const STATUS_VALIDOS = [
    'aguardando_pagamento','pago','separando','enviado','entregue','cancelado','devolvido'
];

async function listAll(filtro = {}) {
    const where = [];
    const params = [];
    if (filtro.status) { params.push(filtro.status); where.push(`p.status = $${params.length}`); }
    const sql = `
        SELECT p.id, p.codigo_pedido, p.status, p.status_pagamento, p.total,
               p.created_at, u.nome AS cliente, u.email
        FROM pedidos p JOIN usuarios u ON u.id = p.usuario_id
        ${where.length ? 'WHERE '+where.join(' AND ') : ''}
        ORDER BY p.created_at DESC LIMIT 200
    `;
    return (await pool.query(sql, params)).rows;
}

async function getById(id) {
    const ped = (await pool.query(`
        SELECT p.*, u.nome AS cliente_nome, u.email AS cliente_email, u.telefone,
               e.cep, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.estado
        FROM pedidos p
        JOIN usuarios u ON u.id = p.usuario_id
        LEFT JOIN enderecos e ON e.id = p.endereco_id
        WHERE p.id = $1
    `, [id])).rows[0];
    if (!ped) return null;
    ped.itens = (await pool.query(
        `SELECT * FROM pedido_itens WHERE pedido_id=$1`, [id]
    )).rows;
    ped.historico = (await pool.query(
        `SELECT * FROM historico_status_pedido WHERE pedido_id=$1 ORDER BY created_at DESC`, [id]
    )).rows;
    return ped;
}

async function updateStatus(id, status, observacao, adminId) {
    if (!STATUS_VALIDOS.includes(status)) {
        throw new Error('Status inválido');
    }
    await pool.query(
        `UPDATE pedidos SET status=$1, updated_at=NOW() WHERE id=$2`, [status, id]
    );
    await pool.query(`
        INSERT INTO historico_status_pedido (pedido_id, usuario_responsavel_id, status, observacao)
        VALUES ($1,$2,$3,$4)
    `, [id, adminId, status, observacao || null]);
    return { ok: true };
}

async function confirmarPagamento(id, adminId) {

    const pedido = await pool.query(
        `
        SELECT mercadopago_payment_id
        FROM pedidos
        WHERE id = $1
        `,
        [id]
    );

    const paymentId = pedido.rows[0]?.mercadopago_payment_id;

    await pool.query(
        `
        UPDATE pedidos
        SET
            status = 'pago',
            status_pagamento = 'approved',
            data_pagamento = NOW(),
            updated_at = NOW()
        WHERE id = $1
        `,
        [id]
    );

    if (paymentId) {
        await pool.query(
            `
            UPDATE pagamentos
            SET
                status = 'approved',
                updated_at = NOW()
            WHERE payment_id = $1
            `,
            [paymentId]
        );
    }

    await pool.query(
        `
        INSERT INTO historico_status_pedido
        (
            pedido_id,
            usuario_responsavel_id,
            status,
            observacao
        )
        VALUES
        (
            $1,
            $2,
            'pago',
            'Pagamento confirmado manualmente'
        )
        `,
        [id, adminId]
    );

    return { ok: true };
}

async function setRastreio(id, codigo, transportadora) {
    await pool.query(`
        UPDATE pedidos SET codigo_rastreio=$1, transportadora=$2, status='enviado', updated_at=NOW()
        WHERE id=$3
    `, [codigo, transportadora || null, id]);
    return { ok: true };
}

module.exports = { listAll, getById, updateStatus, confirmarPagamento, setRastreio, STATUS_VALIDOS };
