const pool = require('../config/db');

async function getStats() {
    const q = async (sql, params = []) => (await pool.query(sql, params)).rows[0];

    const [
        produtos, clientes, pedidos, aguardando, semEstoque, faturamento
    ] = await Promise.all([
        q(`SELECT COUNT(*)::int AS total FROM produtos WHERE deleted_at IS NULL`),
        q(`SELECT COUNT(*)::int AS total FROM usuarios WHERE tipo_usuario='cliente' AND deleted_at IS NULL`),
        q(`SELECT COUNT(*)::int AS total FROM pedidos`),
        q(`SELECT COUNT(*)::int AS total FROM pedidos WHERE status='aguardando_pagamento'`),
        q(`SELECT COUNT(DISTINCT p.id)::int AS total
           FROM produtos p
           LEFT JOIN produto_variacoes v ON v.produto_id = p.id
           WHERE p.deleted_at IS NULL
           GROUP BY p.id HAVING COALESCE(SUM(v.estoque),0)=0`),
        q(`SELECT COALESCE(SUM(total),0)::numeric(10,2) AS total
           FROM pedidos WHERE status IN ('pago','separando','enviado','entregue')`)
    ]);

    const ultimosPedidos = (await pool.query(`
        SELECT p.id, p.codigo_pedido, p.status, p.total, p.created_at,
               u.nome AS cliente
        FROM pedidos p JOIN usuarios u ON u.id = p.usuario_id
        ORDER BY p.created_at DESC LIMIT 10
    `)).rows;

    return {
        totalProdutos: produtos.total,
        totalClientes: clientes.total,
        totalPedidos: pedidos.total,
        pedidosAguardando: aguardando.total,
        produtosSemEstoque: semEstoque ? semEstoque.total : 0,
        faturamento: faturamento.total,
        ultimosPedidos
    };
}

module.exports = { getStats };
