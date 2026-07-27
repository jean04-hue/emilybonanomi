const cloudinary = require('../config/cloudinary');
const model = require('../models/product-image.model');

function uploadBuffer(buffer, resourceType) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'emily_bonanomi', resource_type: resourceType },
            (err, result) => err ? reject(err) : resolve(result)
        );
        stream.end(buffer);
    });
}

async function uploadMedia(produtoId, file, { cor = null } = {}) {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        throw new Error('Cloudinary não configurado. Preencha CLOUDINARY_* no .env');
    }
    const isVideo = /^video\//.test(file.mimetype);
    const resourceType = isVideo ? 'video' : 'image';
    const tipo = isVideo ? 'video' : 'imagem';

    try {
        const result = await uploadBuffer(file.buffer, resourceType);
        const corNorm = cor && String(cor).trim() ? String(cor).trim() : null;
        return await model.createImage(produtoId, result.secure_url, { cor: corNorm, tipo });
    } catch (err) {
        console.error('[Cloudinary upload error]', err);
        throw new Error('Falha no upload: ' + (err.message || err));
    }
}

async function getImages(produtoId) {
    return model.getImagesByProduct(produtoId);
}

async function deleteImage(id) {
    const midia = await model.getImageById(id);
    if (!midia) throw new Error('Mídia não encontrada');
    await model.deleteImage(id);
    return true;
}

async function reorderImages(items) {
    // items: [{ id, ordem }, ...]
    for (const it of items) await model.updateOrder(it.id, it.ordem);
    return true;
}

module.exports = { uploadMedia, uploadImage: uploadMedia, getImages, deleteImage, reorderImages };
