const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');
const c = require('../controllers/review.controller');

router.use(auth, admin);

router.get('/', c.adminList);
router.delete('/:id', c.adminRemove);

module.exports = router;
