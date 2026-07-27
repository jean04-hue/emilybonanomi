const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Categorias públicas (loja)
router.get('/', async (_req, res) => {
    try {
        const r = await pool.query(`
            SELECT id, nome, slug FROM categorias
            WHERE ativo = TRUE AND deleted_at IS NULL
            ORDER BY nome
        `);
        res.json(r.rows);
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

module.exports = router;
