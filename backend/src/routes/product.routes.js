const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');

router.get('/',           controller.getAll);
router.get('/categories', controller.getCategories);
router.get('/destaque',   controller.getFeatured);
router.get('/:id',        controller.getById);

module.exports = router;
