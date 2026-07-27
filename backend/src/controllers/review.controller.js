const model = require('../models/review.model');

async function list(req, res) {
    try {
        const [itens, resumo] = await Promise.all([
            model.listByProduct(req.params.id),
            model.summary(req.params.id)
        ]);
        res.json({ resumo, itens });
    } catch (e) { 
        res.status(500).json({ erro: e.message }); 
    }
}

async function create(req, res) {
    try {
        const { nota, comentario } = req.body;
        if (!nota || nota < 1 || nota > 5) {
            return res.status(400).json({ erro: 'Nota deve ser de 1 a 5' });
        }
        
        const comprou = await model.clienteJaComprou(req.usuario.id, req.params.id);
        if (!comprou) {
            return res.status(403).json({ erro: 'Você precisa ter comprado o produto para avaliá-lo' });
        }

        const jaAvaliou = await model.usuarioJaAvaliou(req.usuario.id, req.params.id);
        if (jaAvaliou) {
            return res.status(400).json({ erro: 'Você já avaliou este produto' });
        }

        const avaliacao = await model.create(req.usuario.id, req.params.id, nota, comentario || '');
        res.status(201).json(avaliacao);
    } catch (e) { 
        res.status(400).json({ erro: e.message }); 
    }
}

async function adminList(_req, res) {
    try { 
        res.json(await model.listAll()); 
    } catch (e) { 
        res.status(500).json({ erro: e.message }); 
    }
}

async function adminRemove(req, res) {
    try { 
        res.json(await model.remove(req.params.id)); 
    } catch (e) { 
        res.status(400).json({ erro: e.message }); 
    }
}

async function canReview(req, res) {
    try {
        const comprou = await model.clienteJaComprou(req.usuario.id, req.params.id);
        const jaAvaliou = await model.usuarioJaAvaliou(req.usuario.id, req.params.id);

        res.json({
            podeAvaliar: comprou && !jaAvaliou,
            jaAvaliou
        });
    } catch (e) {
        res.status(500).json({ erro: e.message });
    }
}

module.exports = {
    list,
    create,
    canReview,
    adminList,
    adminRemove
};