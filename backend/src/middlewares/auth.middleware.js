const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

async function authMiddleware(req, res, next) {

    const authHeader =
        req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            erro: 'Token não informado'
        });
    }

    const [, token] =
        authHeader.split(' ');

    try {

        const decoded =
    jwt.verify(
        token,
        process.env.JWT_SECRET
    );

const usuario =
    await userModel.findByEmail(decoded.email);

if (!usuario || !usuario.ativo) {
    return res.status(401).json({
        erro: 'Conta desativada.'
    });
}

req.usuario = decoded;

next();

    } catch (error) {

        return res.status(401).json({
            erro: 'Token inválido'
        });

    }

}

module.exports = authMiddleware;