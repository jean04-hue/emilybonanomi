const db = require('../config/db');

async function findAllByUser(userId) {
    const result = await db.query(
        `
        SELECT
            id,
            apelido,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            principal,
            created_at
        FROM enderecos
        WHERE usuario_id = $1
        ORDER BY principal DESC, id DESC
        `,
        [userId]
    );

    return result.rows;
}

async function findById(id, userId) {
    const result = await db.query(
        `
        SELECT *
        FROM enderecos
        WHERE id = $1
        AND usuario_id = $2
        `,
        [id, userId]
    );

    return result.rows[0];
}

async function create(
    userId,
    apelido,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    principal
) {
    const result = await db.query(
        `
        INSERT INTO enderecos (
            usuario_id,
            apelido,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            principal
        )
        VALUES (
            $1,$2,$3,$4,$5,
            $6,$7,$8,$9,$10
        )
        RETURNING *
        `,
        [
            userId,
            apelido,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            principal
        ]
    );

    return result.rows[0];
}

async function update(
    id,
    userId,
    apelido,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    principal
) {
    const result = await db.query(
        `
        UPDATE enderecos
        SET
            apelido = $1,
            cep = $2,
            logradouro = $3,
            numero = $4,
            complemento = $5,
            bairro = $6,
            cidade = $7,
            estado = $8,
            principal = $9
        WHERE id = $10
        AND usuario_id = $11
        RETURNING *
        `,
        [
            apelido,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            principal,
            id,
            userId
        ]
    );

    return result.rows[0];
}

async function remove(id, userId) {
    await db.query(
        `
        DELETE FROM enderecos
        WHERE id = $1
        AND usuario_id = $2
        `,
        [id, userId]
    );
}

async function clearPrincipal(userId) {
    await db.query(
        `
        UPDATE enderecos
        SET principal = false
        WHERE usuario_id = $1
        `,
        [userId]
    );
}

module.exports = {
    findAllByUser,
    findById,
    create,
    update,
    remove,
    clearPrincipal
};