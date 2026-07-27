const express = require('express');

const router =
    express.Router();

const auth =
    require('../middlewares/auth.middleware');

const admin =
    require('../middlewares/admin.middleware');

const controller =
    require('../controllers/admin-category.controller');

router.use(auth);

router.use(admin);

router.get(
    '/',
    controller.list
);

router.post(
    '/',
    controller.create
);

router.put(
    '/:id',
    controller.update
);

router.delete(
    '/:id',
    controller.remove
);

module.exports = router;