const searchService =
    require('../services/search.service');

async function search(req, res) {

    try {

        const q = req.query.q || '';

        const produtos =
            await searchService.searchProducts(q);

        return res.json(produtos);

    } catch (error) {

        return res.status(500).json({
            erro: error.message
        });

    }

}

async function byCategory(req, res) {

    try {

        const produtos =
            await searchService.getProductsByCategory(
                req.params.id
            );

        return res.json(produtos);

    } catch (error) {

        return res.status(500).json({
            erro: error.message
        });

    }

}

async function bySlug(req, res) {

    try {

        const produto =
            await searchService.getProductBySlug(
                req.params.slug
            );

        return res.json(produto);

    } catch (error) {

        return res.status(404).json({
            erro: error.message
        });

    }

}

module.exports = {
    search,
    byCategory,
    bySlug
};