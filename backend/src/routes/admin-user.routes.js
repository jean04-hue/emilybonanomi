const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const emailService = require('../services/email.service');

router.use(auth, admin);

// LISTAR TODOS OS USUÁRIOS
router.get('/', async (_req, res) => {
    try {
        const r = await pool.query(`
            SELECT id, nome, sobrenome, email, telefone, tipo_usuario, ativo, created_at
            FROM usuarios
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
        `);
        res.json(r.rows);
    } catch (e) { 
        res.status(500).json({ erro: e.message }); 
    }
});

// DETALHES DO USUÁRIO (COM ENDEREÇO E PEDIDOS)
router.get('/:id', async (req, res) => {
    try {
        const u = (await pool.query(`
            SELECT id, nome, sobrenome, email, telefone, tipo_usuario, ativo, 
                   senha_temporaria, senha_alterada_em, created_at
            FROM usuarios 
            WHERE id = $1
        `, [req.params.id])).rows[0];

        if (!u) return res.status(404).json({ erro: 'Usuário não encontrado' });

        // Busca o endereço principal do usuário
        const endereco = (await pool.query(`
            SELECT id, cep, logradouro, numero, complemento, bairro, cidade, estado
            FROM enderecos 
            WHERE usuario_id = $1 
            LIMIT 1
        `, [req.params.id])).rows[0] || null;

        // Busca os pedidos
        const pedidos = (await pool.query(`
            SELECT id, codigo_pedido, status, total, created_at 
            FROM pedidos 
            WHERE usuario_id = $1 
            ORDER BY created_at DESC
        `, [req.params.id])).rows;

        res.json({ ...u, endereco, pedidos });
    } catch (e) { 
        res.status(500).json({ erro: e.message }); 
    }
});

// EDITAR DADOS DO USUÁRIO E ENDEREÇO
router.put('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { nome, sobrenome, telefone, endereco } = req.body;

        // 1. Atualiza dados do usuário
        const u = (await client.query(`
            UPDATE usuarios 
            SET nome = $1, sobrenome = $2, telefone = $3, updated_at = NOW()
            WHERE id = $4
            RETURNING id, nome, sobrenome, email, telefone
        `, [nome, sobrenome, telefone, req.params.id])).rows[0];

        // 2. Atualiza ou insere o endereço se enviado
        if (endereco) {
            const endExistente = (await client.query(
                `SELECT id FROM enderecos WHERE usuario_id = $1 LIMIT 1`,
                [req.params.id]
            )).rows[0];

            if (endExistente) {
                await client.query(`
                    UPDATE enderecos
                    SET cep = $1, logradouro = $2, numero = $3, complemento = $4, bairro = $5, cidade = $6, estado = $7, updated_at = NOW()
                    WHERE usuario_id = $8
                `, [
                    endereco.cep, endereco.logradouro, endereco.numero, 
                    endereco.complemento, endereco.bairro, endereco.cidade, 
                    endereco.estado, req.params.id
                ]);
            } else {
                await client.query(`
                    INSERT INTO enderecos (usuario_id, cep, logradouro, numero, complemento, bairro, cidade, estado)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [
                    req.params.id, endereco.cep, endereco.logradouro, endereco.numero, 
                    endereco.complemento, endereco.bairro, endereco.cidade, endereco.estado
                ]);
            }
        }

        await client.query('COMMIT');
        res.json({ sucesso: true, usuario: u });
    } catch (e) {
        await client.query('ROLLBACK');
        res.status(500).json({ erro: e.message });
    } finally {
        client.release();
    }
});

// DESATIVAR / ATIVAR CLIENTE
router.patch('/:id/toggle', async (req, res) => {
    try {
        await pool.query('UPDATE usuarios SET ativo = NOT ativo WHERE id=$1', [req.params.id]);
        res.json({ ok: true });
    } catch (e) { 
        res.status(500).json({ erro: e.message }); 
    }
});

// REDEFINIR SENHA TEMPORÁRIA
router.post('/:id/reset-password', async (req, res) => {

    try {

        const usuarioResult =
            await pool.query(
                `
                SELECT
                    id,
                    nome,
                    email
                FROM usuarios
                WHERE id = $1
                `,
                [req.params.id]
            );

        const usuario =
            usuarioResult.rows[0];

        if (!usuario) {

            return res.status(404).json({
                erro: 'Usuário não encontrado'
            });

        }

        // gera senha

        const caracteres =
            'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';

        let senha = '';

        for (let i = 0; i < 10; i++) {

            senha +=
                caracteres[
                    Math.floor(
                        Math.random() *
                        caracteres.length
                    )
                ];

        }

        const hash =
            await bcrypt.hash(
                senha,
                10
            );

        await pool.query(
            `
            UPDATE usuarios
            SET
                senha_hash = $1,
                senha_temporaria = TRUE,
                senha_alterada_em = NOW(),
                updated_at = NOW()
            WHERE id = $2
            `,
            [
                hash,
                usuario.id
            ]
        );

        //---------------------------------------------------
        // ENVIO DO EMAIL
        //---------------------------------------------------

        let emailEnviado = true;

        try {

            const linkLoja = process.env.FRONTEND_LOJA_URL;

await emailService.enviarEmailRedefinicaoSenha({
    to: usuario.email,
    nome: usuario.nome,
    senhaTemporaria: senha,
    linkLoja: process.env.FRONTEND_LOGIN_URL
});

        }

        catch (emailErr) {

            console.error('==========================');
            console.error('ERRO AO ENVIAR EMAIL');
            console.error(emailErr);
            console.error(emailErr.message);
            console.error(emailErr.code);
            console.error(emailErr.response);
            console.error(emailErr.responseCode);
            console.error('==========================');

            emailEnviado = false;

        }

        return res.json({

            sucesso: true,

            senha_temporaria: senha,

            emailEnviado,

            mensagem:

                emailEnviado

                    ?

                    'Senha redefinida e enviada por e-mail.'

                    :

                    'Senha redefinida, porém ocorreu falha ao enviar o e-mail.'

        });

    }

    catch (erro) {

        console.error(erro);

        return res.status(500).json({

            erro: erro.message

        });

    }

});

module.exports = router;