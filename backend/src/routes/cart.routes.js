const express =
    require('express');

const router =
    express.Router();

const auth =
    require('../middlewares/auth.middleware');

const controller =
    require('../controllers/cart.controller');

router.use(auth);

router.get(
    '/',
    controller.getCart
);

router.post(
    '/add',
    controller.addItem
);

router.put(
    '/item/:id',
    controller.updateItem
);

router.delete(
    '/item/:id',
    controller.removeItem
);

module.exports = router;