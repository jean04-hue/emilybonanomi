const model = require('../models/admin-product.model');
module.exports = {
    create: (d)          => model.createProduct(d),
    update: (id, d)      => model.updateProduct(id, d),
    setFeatured: (id, v) => model.setFeatured(id, v),
    remove: (id)         => model.deleteProduct(id),
    list:   ()           => model.getAllAdmin()
};
