const service = require('../services/product-image.service');

async function upload(req, res) {
    try {
        if (!req.file) return res.status(400).json({ erro: 'Arquivo não enviado' });
        const cor = req.body?.cor ?? req.query?.cor ?? null;
        const midia = await service.uploadMedia(req.params.id, req.file, { cor });
        return res.status(201).json(midia);
    } catch (error) {
        return res.status(500).json({ erro: error.message });
    }
}

async function list(req, res) {
    try {
        const midias = await service.getImages(req.params.id);
        return res.json(midias);
    } catch (error) {
        return res.status(500).json({ erro: error.message });
    }
}

async function remove(req, res) {
    try {
        await service.deleteImage(req.params.imageId);
        return res.json({ mensagem: 'Mídia removida' });
    } catch (error) {
        return res.status(500).json({ erro: error.message });
    }
}

async function reorder(req, res) {
    try {
        const items = Array.isArray(req.body?.items) ? req.body.items : [];
        await service.reorderImages(items);
        return res.json({ mensagem: 'Ordem atualizada' });
    } catch (error) {
        return res.status(500).json({ erro: error.message });
    }
}

module.exports = { upload, list, remove, reorder };
