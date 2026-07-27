const express =
    require('express');

const router =
    express.Router();

const auth =
    require('../middlewares/auth.middleware');

const controller =
    require('../controllers/order.controller');

const orderDetailsController =
    require('../controllers/order-details.controller');

const orderListController =
    require('../controllers/order-list.controller');

router.use(auth);

router.post(
    '/',
    controller.createOrder
);

router.get(
    '/',
    orderListController.getOrders
);

router.get(
    '/:id',
    orderDetailsController.getOrderDetails
);

router.patch(
    '/:id/cancel',
    controller.cancelOrder
);



module.exports = router;