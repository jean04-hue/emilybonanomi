const db = require('../config/db');

async function findById(id) {
    const result = await db.query(
        `
        SELECT
            id,
            nome,
            sobrenome,
            cpf,
            email,
            telefone,
            tipo_usuario,
            created_at
        FROM usuarios
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
}

async function updateProfile(
    id,
    nome,
    sobrenome,
    telefone
) {
    const result = await db.query(
        `
        UPDATE usuarios
        SET
            nome = $1,
            sobrenome = $2,
            telefone = $3,
            updated_at = NOW()
        WHERE id = $4
        RETURNING
            id,
            nome,
            sobrenome,
            cpf,
            email,
            telefone,
            tipo_usuario
        `,
        [
            nome,
            sobrenome,
            telefone,
            id
        ]
    );

    return result.rows[0];
}

async function findPasswordById(id) {
    const result = await db.query(
        `
        SELECT
            id,
            senha_hash
        FROM usuarios
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
}

async function updatePassword(
    id,
    senhaHash
) {
    await db.query(
        `
        UPDATE usuarios
        SET
            senha_hash = $1,
            updated_at = NOW()
        WHERE id = $2
        `,
        [
            senhaHash,
            id
        ]
    );
}

async function resetTempPassword(
    id,
    senhaHash
) {

    await db.query(
        `
        UPDATE usuarios
        SET
            senha_hash = $1,
            senha_temporaria = FALSE,
            senha_alterada_em = NOW(),
            updated_at = NOW()
        WHERE id = $2
        `,
        [
            senhaHash,
            id
        ]
    );

}

module.exports = {
    findById,
    updateProfile,
    findPasswordById,
    updatePassword,
    resetTempPassword
};