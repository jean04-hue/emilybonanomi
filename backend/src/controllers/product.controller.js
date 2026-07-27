const service = require('../services/product.service');

async function getAll(req, res) {
    try {
        const produtos = await service.getAllProducts(req.query.categoria || null);
        return res.json(produtos);
    } catch (error) { return res.status(500).json({ erro: error.message }); }
}

async function getById(req, res) {
    try {
        const produto = await service.getProductById(req.params.id);
        if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
        return res.json(produto);
    } catch (error) { return res.status(404).json({ erro: error.message }); }
}

async function getCategories(req, res) {
    try { return res.json(await service.getAllCategories()); }
    catch (error) { return res.status(500).json({ erro: error.message }); }
}

async function getFeatured(req, res) {
    try {
        const produto = await service.getFeaturedProduct();
        return res.json(produto || null);
    } catch (error) { return res.status(500).json({ erro: error.message }); }
}

module.exports = { getAll, getById, getCategories, getFeatured };
