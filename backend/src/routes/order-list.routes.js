const express = require('express');

const router =
    express.Router();

const authMiddleware =
    require('../middlewares/auth.middleware');

const orderListController =
    require('../controllers/order-list.controller');

router.get(
    '/',
    authMiddleware,
    orderListController.getOrders
);

module.exports = router;