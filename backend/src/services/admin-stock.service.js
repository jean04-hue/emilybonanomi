const model =
    require('../models/admin-stock.model');

async function list() {
    return await model.getAllStock();
}

async function update(
    produtoId,
    quantidade
) {
    return await model.updateStock(
        produtoId,
        quantidade
    );
}

module.exports = {
    list,
    update
};