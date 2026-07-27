const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');
const model = require('../models/dashboard.model');

router.use(auth, admin);

router.get('/', async (_req, res) => {
    try { res.json(await model.getStats()); }
    catch (e) { res.status(500).json({ erro: e.message }); }
});

module.exports = router;
