const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');
const m = require('../models/admin-order.model');

router.use(auth, admin);

router.get('/', async (req, res) => {
    try { res.json(await m.listAll({ status: req.query.status })); }
    catch (e) { res.status(500).json({ erro: e.message }); }
});

router.get('/:id', async (req, res) => {
    try {
        const ped = await m.getById(req.params.id);
        if (!ped) return res.status(404).json({ erro: 'Pedido não encontrado' });
        res.json(ped);
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.patch('/:id/status', async (req, res) => {
    try {
        const { status, observacao } = req.body;
        res.json(await m.updateStatus(req.params.id, status, observacao, req.usuario.id));
    } catch (e) { res.status(400).json({ erro: e.message }); }
});

router.post('/:id/confirmar-pagamento', async (req, res) => {
    try { res.json(await m.confirmarPagamento(req.params.id, req.usuario.id)); }
    catch (e) { res.status(400).json({ erro: e.message }); }
});

router.post('/:id/rastreio', async (req, res) => {
    try {
        const { codigo, transportadora } = req.body;
        res.json(await m.setRastreio(req.params.id, codigo, transportadora));
    } catch (e) { res.status(400).json({ erro: e.message }); }
});

module.exports = router;
