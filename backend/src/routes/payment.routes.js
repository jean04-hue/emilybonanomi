const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth.middleware');
const controller = require('../controllers/payment.controller');

router.use(auth);

router.post('/pix',              controller.createPix);
router.get('/:pedidoId/status',  controller.getStatus);

module.exports = router;
