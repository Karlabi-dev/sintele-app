const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const pool = require("../db");

const router = express.Router();

router.post("/accounts", authenticate, async (req, res) => {
    try {
        const { uid, email } = req.user;
        const { type } = req.body;

        if (!type || !["professional", "company"].includes(type)) {
            return res.status(400).json({
                error: "Tipo de conta inválido. Escolha profissional ou empresa.",
            });
        }

        const result = await pool.query(
            `
            INSERT INTO accounts (
                firebase_uid,
                type,
                email
            )
            VALUES ($1, $2, $3)
            RETURNING id, firebase_uid, type, email, created_at
            `,
            [uid, type, email]
        );

        res.status(201).json({
            message: "Conta criada com sucesso!",
            account: result.rows[0],
        });

    } catch (error) {
        console.error("ERRO AO CRIAR CONTA:", error);

        res.status(500).json({
            error: "Erro ao criar conta.",
        });
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
        console.error("ERRO AO BUSCAR CONTA:", error);

        res.status(500).json({
            error: "Erro ao buscar conta.",
        });
    }
});

module.exports = router;