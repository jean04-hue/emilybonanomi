const express = require('express');

const router =
    express.Router();

const auth =
    require('../middlewares/auth.middleware');

const admin =
    require('../middlewares/admin.middleware');

const controller =
    require('../controllers/admin-stock.controller');

router.use(auth);

router.use(admin);

router.get(
    '/',
    controller.list
);

router.put(
    '/:produtoId',
    controller.update
);

module.exports = router;