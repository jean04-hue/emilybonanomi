const pool = require('../config/db');

async function findByEmail(email) {
    const resultado = await pool.query(
        `
        SELECT *
        FROM usuarios
        WHERE email = $1
        `,
        [email]
    );

    return resultado.rows[0];
}

async function create(userData) {
    const {
        nome,
        sobrenome,
        cpf,
        email,
        telefone,
        senhaHash
    } = userData;

    const resultado = await pool.query(
        `
        INSERT INTO usuarios
        (
            nome,
            sobrenome,
            cpf,
            email,
            telefone,
            senha_hash
        )
        VALUES
        ($1,$2,$3,$4,$5,$6)
        RETURNING id,nome,email
        `,
        [
            nome,
            sobrenome,
            cpf,
            email,
            telefone,
            senhaHash
        ]
    );

    return resultado.rows[0];
}

async function updatePassword(
    id,
    senhaHash
) {

    await pool.query(
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

async function findById(id) {

    const r =
        await pool.query(
            `
            SELECT
                id,
                nome,
                email
            FROM usuarios
            WHERE id=$1
            `,
            [id]
        );

    return r.rows[0];

}

module.exports = {

    findByEmail,
    create,
    updatePassword,
    findById

};