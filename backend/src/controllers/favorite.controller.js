const model = require('../models/favorite.model');

async function list(req, res) {
    try { res.json(await model.list(req.usuario.id)); }
    catch (e) { res.status(500).json({ erro: e.message }); }
}
async function add(req, res) {
    try { res.json(await model.add(req.usuario.id, req.params.produtoId)); }
    catch (e) { res.status(400).json({ erro: e.message }); }
}
async function remove(req, res) {
    try { res.json(await model.remove(req.usuario.id, req.params.produtoId)); }
    catch (e) { res.status(400).json({ erro: e.message }); }
}
async function check(req, res) {
    try { res.json({ favorito: await model.isFavorite(req.usuario.id, req.params.produtoId) }); }
    catch (e) { res.status(400).json({ erro: e.message }); }
}

module.exports = { list, add, remove, check };
