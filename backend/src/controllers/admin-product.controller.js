const service = require('../services/admin-product.service');

async function create(req, res) {
    try { res.status(201).json(await service.create(req.body)); }
    catch (e) { res.status(500).json({ erro: e.message }); }
}
async function update(req, res) {
    try { res.json(await service.update(req.params.id, req.body)); }
    catch (e) { res.status(500).json({ erro: e.message }); }
}
async function setFeatured(req, res) {
    try { res.json(await service.setFeatured(req.params.id, req.body?.destaque !== false)); }
    catch (e) { res.status(500).json({ erro: e.message }); }
}
async function remove(req, res) {
    try { await service.remove(req.params.id); res.json({ mensagem: 'Produto desativado' }); }
    catch (e) { res.status(500).json({ erro: e.message }); }
}
async function list(req, res) {
    try { res.json(await service.list()); }
    catch (e) { res.status(500).json({ erro: e.message }); }
}

module.exports = { create, update, setFeatured, remove, list };
