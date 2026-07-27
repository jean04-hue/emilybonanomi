const express = require('express');

const router = express.Router();

const searchController =
    require('../controllers/search.controller');

router.get(
    '/search',
    searchController.search
);

router.get(
    '/category/:id',
    searchController.byCategory
);

router.get(
    '/slug/:slug',
    searchController.bySlug
);

module.exports = router;