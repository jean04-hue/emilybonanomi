const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const profileController = require('../controllers/profile.controller');

router.get('/', authMiddleware, profileController.getProfile);
router.put('/', authMiddleware, profileController.updateProfile);
router.put('/password', authMiddleware, profileController.updatePassword);


router.post('/reset-temp-password', authMiddleware, profileController.resetTempPassword);

module.exports = router;