const db = require('../config/db');

async function getAllProducts(categoria = null) {
    let query = `
        SELECT
            p.id, p.nome, p.descricao, p.preco, p.ativo, p.destaque,
            p.created_at, p.categoria_id,
            c.nome AS categoria_nome,
            c.slug AS categoria_slug,
            (SELECT url FROM produto_imagens pi
                WHERE pi.produto_id = p.id AND pi.tipo = 'imagem'
                ORDER BY pi.ordem, pi.id LIMIT 1) AS imagem
        FROM produtos p
        LEFT JOIN categorias c ON c.id = p.categoria_id
        WHERE p.ativo = true
    `;
    const params = [];
    if (categoria) { query += ` AND c.slug = $1`; params.push(categoria); }
    query += ` ORDER BY p.id DESC`;
    const result = await db.query(query, params);
    return result.rows;
}

async function getProductById(id) {
    const produtoResult = await db.query(
        `SELECT p.*, c.nome AS categoria_nome, c.slug AS categoria_slug
         FROM produtos p LEFT JOIN categorias c ON c.id = p.categoria_id
         WHERE p.id = $1`, [id]);
    const produto = produtoResult.rows[0];
    if (!produto) return null;

    const midias = await db.query(
        `SELECT id, url, cor, tipo, ordem
         FROM produto_imagens WHERE produto_id = $1
         ORDER BY ordem ASC, id ASC`, [id]);

    const variacoes = await db.query(
        `SELECT id, sku_variacao, cor, tamanho, estoque
         FROM produto_variacoes WHERE produto_id = $1
         ORDER BY cor, tamanho`, [id]);

    produto.imagens = midias.rows;        // legado — mantém compatibilidade
    produto.midias  = midias.rows;        // novo nome
    produto.variacoes = variacoes.rows;
    return produto;
}

async function getFeaturedProduct() {
    // 1) produto marcado como destaque; 2) fallback: mais recente com imagem
    const r = await db.query(
        `SELECT p.id, p.nome, p.slug, p.descricao, p.preco, p.categoria_id,
            c.nome AS categoria_nome, c.slug AS categoria_slug,
            (SELECT url FROM produto_imagens pi
                WHERE pi.produto_id = p.id AND pi.tipo = 'imagem'
                ORDER BY pi.ordem, pi.id LIMIT 1) AS imagem
         FROM produtos p LEFT JOIN categorias c ON c.id = p.categoria_id
         WHERE p.ativo = true AND p.destaque = true
         ORDER BY p.updated_at DESC LIMIT 1`);
    if (r.rows[0]) return r.rows[0];

    const fb = await db.query(
        `SELECT p.id, p.nome, p.slug, p.descricao, p.preco, p.categoria_id,
            c.nome AS categoria_nome, c.slug AS categoria_slug,
            (SELECT url FROM produto_imagens pi
                WHERE pi.produto_id = p.id AND pi.tipo = 'imagem'
                ORDER BY pi.ordem, pi.id LIMIT 1) AS imagem
         FROM produtos p LEFT JOIN categorias c ON c.id = p.categoria_id
         WHERE p.ativo = true
         ORDER BY p.id DESC LIMIT 1`);
    return fb.rows[0] || null;
}

async function getAllCategories() {
    const result = await db.query(`SELECT * FROM categorias ORDER BY nome`);
    return result.rows;
}

module.exports = { getAllProducts, getProductById, getFeaturedProduct, getAllCategories };
