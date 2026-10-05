const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const pool = require("../db");
const router = express.Router();
router.post("/accounts", authenticate, async (req, res) => {
    const client = await pool.connect();
    try {
        const { uid, email } = req.user;
        const { fullName, type } = req.body;
        if (!fullName || !fullName.trim()) {
            return res.status(400).json({
                error: "Nome é obrigatório.",
            });
        }
        if (!type || !["professional", "company"].includes(type)) {
            return res.status(400).json({
                error: "Tipo de conta inválido. Escolha profissional ou empresa.",
            });
        }
        await client.query("BEGIN");
        const accountResult = await client.query(
            `
            INSERT INTO accounts (
                firebase_uid,
                type,
                email
            )
            VALUES ($1, $2, $3)
            RETURNING
                id,
                firebase_uid,
                type,
                email,
                created_at
            `,
            [uid, type, email]
        );
        const account = accountResult.rows[0];
        let profile;
        if (type === "professional") {
            const profileResult = await client.query(
                `
                INSERT INTO professional_profiles (
                    account_id,
                    full_name
                )
                VALUES ($1, $2)
                RETURNING
                    id,
                    account_id,
                    full_name
                `,
                [
                    account.id,
                    fullName.trim()
                ]
            );
            profile = profileResult.rows[0];
        }
        if (type === "company") {
            const profileResult = await client.query(
                `
                INSERT INTO company_profiles (
                    account_id,
                    company_name
                )
                VALUES ($1, $2)
                RETURNING
                    id,
                    account_id,
                    company_name
                `,
                [
                    account.id,
                    fullName.trim()
                ]
            );
            profile = profileResult.rows[0];
        }
        await client.query("COMMIT");
        res.status(201).json({
            message: "Conta e perfil criados com sucesso!",
            account,
            profile,
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(
            "ERRO AO CRIAR CONTA E PERFIL:",
            error
        );
        res.status(500).json({
            error: "Erro ao criar conta e perfil.",
        });
    } finally {
        client.release();
    }
});
router.get("/accounts/me", authenticate, async (req, res) => {
    try {
        const { uid } = req.user;
        const result = await pool.query(
            `
            SELECT
                id,
                firebase_uid,
                type,
                email,
                created_at
            FROM accounts
            WHERE firebase_uid = $1
            `,
            [uid]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Conta não encontrada.",
            });
        }
        res.json({
            account: result.rows[0],
        });
    } catch (error) {
        console.error(
            "ERRO AO BUSCAR CONTA:",
            error
        );
        res.status(500).json({
            error: "Erro ao buscar conta.",
        });
    }
});
module.exports = router;