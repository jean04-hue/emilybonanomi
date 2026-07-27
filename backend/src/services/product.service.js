const model = require('../models/product.model');

module.exports = {
    getAllProducts:      (cat) => model.getAllProducts(cat),
    getProductById:      (id)  => model.getProductById(id),
    getAllCategories:    ()    => model.getAllCategories(),
    getFeaturedProduct:  ()    => model.getFeaturedProduct()
};
