const searchModel =
    require('../models/search.model');

async function searchProducts(term) {

    return await searchModel.searchProducts(
        term
    );

}

async function getProductsByCategory(id) {

    return await searchModel.getProductsByCategory(
        id
    );

}

async function getProductBySlug(slug) {

    const produto =
        await searchModel.getProductBySlug(slug);

    if (!produto) {
        throw new Error(
            'Produto não encontrado'
        );
    }

    return produto;
}

module.exports = {
    searchProducts,
    getProductsByCategory,
    getProductBySlug
};