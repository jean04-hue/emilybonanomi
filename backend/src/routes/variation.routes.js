const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');
const model = require('../models/variation.model');

// Público: listar variações de um produto
router.get('/:produtoId/variations', async (req, res) => {
    try { res.json(await model.list(req.params.produtoId)); }
    catch (e) { res.status(500).json({ erro: e.message }); }
});

// Admin CRUD
router.post('/:produtoId/variations', auth, admin, async (req, res) => {
    try { res.status(201).json(await model.create(req.params.produtoId, req.body)); }
    catch (e) { res.status(500).json({ erro: e.message }); }
});

router.put('/variations/:id', auth, admin, async (req, res) => {
    try { res.json(await model.update(req.params.id, req.body)); }
    catch (e) { res.status(500).json({ erro: e.message }); }
});

router.delete('/variations/:id', auth, admin, async (req, res) => {
    try { await model.remove(req.params.id); res.json({ mensagem: 'Removida' }); }
    catch (e) { res.status(500).json({ erro: e.message }); }
});

module.exports = router;
