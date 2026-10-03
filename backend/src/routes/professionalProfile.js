const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const pool = require("../db");

const router = express.Router();


router.get("/profiles/professional/me", authenticate, async (req, res) => {
    try {
        const { uid } = req.user;

        const result = await pool.query(
            `
            SELECT
                pp.id,
                pp.account_id,
                pp.full_name,
                pp.username,
                pp.photo_url,
                pp.profession,
                pp.company_name,
                pp.bio,
                pp.city,
                pp.state,
                pp.phone,
                pp.created_at,
                pp.updated_at
            FROM professional_profiles pp
            INNER JOIN accounts a
                ON a.id = pp.account_id
            WHERE a.firebase_uid = $1
            `,
            [uid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Perfil profissional não encontrado.",
            });
        }

        res.json({
            profile: result.rows[0],
        });

    } catch (error) {
        console.error(
            "ERRO AO BUSCAR PERFIL PROFISSIONAL:",
            error
        );

        res.status(500).json({
            error: "Erro ao buscar perfil profissional.",
        });
    }
});


router.put("/profiles/professional/me", authenticate, async (req, res) => {
    try {
        const { uid } = req.user;

        const {
            fullName,
            username,
            profession,
            companyName,
            bio,
            city,
            state,
            phone
        } = req.body;

        if (!fullName || !fullName.trim()) {
            return res.status(400).json({
                error: "Nome completo é obrigatório.",
            });
        }

        const normalizedUsername = username
            ?.trim()
            .toLowerCase();

        if (normalizedUsername) {
            if (!/^[a-z0-9-]+$/.test(normalizedUsername)) {
                return res.status(400).json({
                    error: "Username deve conter apenas letras, números e hífen.",
                });
            }

            if (
                normalizedUsername.length < 3 ||
                normalizedUsername.length > 50
            ) {
                return res.status(400).json({
                    error: "Username deve ter entre 3 e 50 caracteres.",
                });
            }
        }

        const result = await pool.query(
            `
            UPDATE professional_profiles pp
            SET
                full_name = $1,
                username = $2,
                profession = $3,
                company_name = $4,
                bio = $5,
                city = $6,
                state = $7,
                phone = $8,
                updated_at = CURRENT_TIMESTAMP
            FROM accounts a
            WHERE pp.account_id = a.id
              AND a.firebase_uid = $9
            RETURNING
                pp.id,
                pp.account_id,
                pp.full_name,
                pp.username,
                pp.photo_url,
                pp.profession,
                pp.company_name,
                pp.bio,
                pp.city,
                pp.state,
                pp.phone,
                pp.created_at,
                pp.updated_at
            `,
            [
                fullName.trim(),
                normalizedUsername || null,
                profession?.trim() || null,
                companyName?.trim() || null,
                bio?.trim() || null,
                city?.trim() || null,
                state?.trim() || null,
                phone?.trim() || null,
                uid
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Perfil profissional não encontrado.",
            });
        }

        res.json({
            message: "Perfil profissional atualizado com sucesso!",
            profile: result.rows[0],
        });

    } catch (error) {
        console.error(
            "ERRO AO ATUALIZAR PERFIL PROFISSIONAL:",
            error
        );

        if (error.code === "23505") {
            return res.status(409).json({
                error: "Este username já está em uso.",
            });
        }

        res.status(500).json({
            error: "Erro ao atualizar perfil profissional.",
        });
    }
});

router.get(
    "/profiles/professional/:username",
    async (req, res) => {
        try {
            const { username } = req.params;

            const normalizedUsername = username
                .trim()
                .toLowerCase();

            const result = await pool.query(
                `
                SELECT
                    pp.id,
                    pp.full_name,
                    pp.username,
                    pp.photo_url,
                    pp.profession,
                    pp.company_name,
                    pp.bio,
                    pp.city,
                    pp.state
                FROM professional_profiles pp
                WHERE pp.username = $1
                `,
                [normalizedUsername]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: "Perfil profissional não encontrado.",
                });
            }

            res.json({
                profile: result.rows[0],
            });

        } catch (error) {
            console.error(
                "ERRO AO BUSCAR PERFIL PÚBLICO:",
                error
            );

            res.status(500).json({
                error: "Erro ao buscar perfil público.",
            });
        }
    }
);


module.exports = router;