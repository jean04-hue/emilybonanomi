function adminMiddleware(
    req,
    res,
    next
) {

    if (
        req.usuario.tipo_usuario !== 'admin'
    ) {

        return res.status(403).json({
            erro: 'Acesso negado'
        });

    }

    next();

}

module.exports = adminMiddleware;