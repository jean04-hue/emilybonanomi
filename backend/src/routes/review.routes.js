const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const c = require('../controllers/review.controller');

// pública: listar avaliações de um produto
router.get('/:id/reviews', c.list);
router.get(
    '/:id/can-review',
    auth,
    c.canReview
);

// autenticada: criar avaliação
router.post('/:id/reviews', auth, c.create);

module.exports = router;
