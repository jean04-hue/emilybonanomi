const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const auth   = require('../middlewares/auth.middleware');
const admin  = require('../middlewares/admin.middleware');
const controller = require('../controllers/product-image.controller');

// Público — usado pela loja
router.get('/:id/images', controller.list);

// Admin — aceita qualquer nome de campo (imagem, video, arquivo, midia)
router.post('/:id/images',
    auth, admin,
    upload.any(),
    (req, _res, next) => {
        if (!req.file && req.files?.length) req.file = req.files[0];
        next();
    },
    controller.upload);

router.put('/:id/images/reorder', auth, admin, controller.reorder);
router.delete('/images/:imageId', auth, admin, controller.remove);

module.exports = router;
