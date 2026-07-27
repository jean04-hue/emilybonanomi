const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth.middleware');
const admin   = require('../middlewares/admin.middleware');
const c       = require('../controllers/admin-product.controller');

router.use(auth, admin);

router.get('/',              c.list);
router.post('/',             c.create);
router.put('/:id',           c.update);
router.put('/:id/destaque',  c.setFeatured);
router.delete('/:id',        c.remove);

module.exports = router;
