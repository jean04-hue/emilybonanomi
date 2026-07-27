const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const c = require('../controllers/favorite.controller');

router.use(auth);

router.get('/',                     c.list);
router.get('/:produtoId/check',     c.check);
router.post('/:produtoId',          c.add);
router.delete('/:produtoId',        c.remove);

module.exports = router;
