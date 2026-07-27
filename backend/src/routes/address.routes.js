const express = require('express');

const router = express.Router();

const authMiddleware =
    require('../middlewares/auth.middleware');

const addressController =
    require('../controllers/address.controller');

router.get(
    '/',
    authMiddleware,
    addressController.getAll
);

router.post(
    '/',
    authMiddleware,
    addressController.create
);

router.put(
    '/:id',
    authMiddleware,
    addressController.update
);

router.delete(
    '/:id',
    authMiddleware,
    addressController.remove
);

module.exports = router;