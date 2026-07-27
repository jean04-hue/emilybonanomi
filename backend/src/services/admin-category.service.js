const model =
    require('../models/admin-category.model');

async function list() {
    return await model.getAllCategories();
}

async function create(data) {
    return await model.createCategory(data);
}

async function update(
    id,
    data
) {
    return await model.updateCategory(
        id,
        data
    );
}

async function remove(id) {
    return await model.deleteCategory(id);
}

module.exports = {
    list,
    create,
    update,
    remove
};