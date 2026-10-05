const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const pool = require("../db");
const router = express.Router();

router.get(
    "/social-contacts/me",
    authenticate,
    async (req, res) => {
        try {
            const { uid } = req.user;
            const profileResult = await pool.query(
                `
                SELECT
                    pp.id,
                    pp.phone,
                    pp.whatsapp,
                    pp.whatsapp_active,
                    pp.phone_active,
                    pp.email_active,
                    a.email
                FROM professional_profiles pp
                INNER JOIN accounts a
                    ON a.id = pp.account_id
                WHERE a.firebase_uid = $1
                `,
                [uid]
            );
            if (profileResult.rows.length === 0) {
                return res.status(404).json({
                    error:
                        "Perfil profissional não encontrado.",
                });
            }
            const profile = profileResult.rows[0];
            const socialResult = await pool.query(
                `
                SELECT
                    id,
                    platform,
                    url,
                    is_active
                FROM social_links
                WHERE professional_profile_id = $1
                ORDER BY created_at ASC
                `,
                [profile.id]
            );
            res.json({
                contacts: {
                    whatsapp: {
                        value: profile.whatsapp || "",
                        isActive:
                            profile.whatsapp_active,
                    },
                    phone: {
                        value: profile.phone || "",
                        isActive:
                            profile.phone_active,
                    },
                    email: {
                        value: profile.email || "",
                        isActive:
                            profile.email_active,
                    },
                },
                socialLinks:
                    socialResult.rows,
            });
        } catch (error) {
            console.error(
                "ERRO AO BUSCAR CONTATOS E REDES SOCIAIS:",
                error
            );
            res.status(500).json({
                error:
                    "Erro ao buscar contatos e redes sociais.",
            });
        }
    }
);

router.put(
    "/social-contacts/me/whatsapp",
    authenticate,
    async (req, res) => {
        try {
            const { uid } = req.user;
            const {
                value,
                isActive
            } = req.body;

            if (typeof isActive !== "boolean") {
                return res.status(400).json({
                    error:
                        "isActive deve ser true ou false.",
                });
            }

            if (
                value !== undefined &&
                typeof value !== "string"
            ) {
                return res.status(400).json({
                    error:
                        "O WhatsApp deve ser um texto.",
                });
            }
            const result = await pool.query(
                `
                UPDATE professional_profiles pp
                SET
                    whatsapp = $1,
                    whatsapp_active = $2,
                    updated_at = CURRENT_TIMESTAMP
                FROM accounts a
                WHERE
                    pp.account_id = a.id
                    AND a.firebase_uid = $3
                RETURNING
                    pp.whatsapp,
                    pp.whatsapp_active
                `,
                [
                    value?.trim() || "",
                    isActive,
                    uid
                ]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({
                    error:
                        "Perfil profissional não encontrado.",
                });
            }
            res.json({
                message:
                    "WhatsApp atualizado com sucesso.",
                value:
                    result.rows[0].whatsapp,
                isActive:
                    result.rows[0].whatsapp_active,
            });
        } catch (error) {
            console.error(
                "ERRO AO ATUALIZAR WHATSAPP:",
                error
            );
            res.status(500).json({
                error:
                    "Erro ao atualizar WhatsApp.",
            });
        }
    }
);

router.put(
    "/social-contacts/me/phone",
    authenticate,
    async (req, res) => {
        try {
            const { uid } = req.user;
            const {
                value,
                isActive
            } = req.body;
            // Validar status
            if (typeof isActive !== "boolean") {
                return res.status(400).json({
                    error:
                        "isActive deve ser true ou false.",
                });
            }

            if (
                value !== undefined &&
                typeof value !== "string"
            ) {
                return res.status(400).json({
                    error:
                        "O telefone deve ser um texto.",
                });
            }
            const result = await pool.query(
                `
                UPDATE professional_profiles pp
                SET
                    phone = $1,
                    phone_active = $2,
                    updated_at = CURRENT_TIMESTAMP
                FROM accounts a
                WHERE
                    pp.account_id = a.id
                    AND a.firebase_uid = $3
                RETURNING
                    pp.phone,
                    pp.phone_active
                `,
                [
                    value?.trim() || "",
                    isActive,
                    uid
                ]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({
                    error:
                        "Perfil profissional não encontrado.",
                });
            }
            res.json({
                message:
                    "Telefone atualizado com sucesso.",
                value:
                    result.rows[0].phone,
                isActive:
                    result.rows[0].phone_active,
            });
        } catch (error) {
            console.error(
                "ERRO AO ATUALIZAR TELEFONE:",
                error
            );
            res.status(500).json({
                error:
                    "Erro ao atualizar telefone.",
            });
        }
    }
);

router.put(
    "/social-contacts/me/email",
    authenticate,
    async (req, res) => {
        try {
            const { uid } = req.user;
            const { isActive } = req.body;
            if (typeof isActive !== "boolean") {
                return res.status(400).json({
                    error:
                        "isActive deve ser true ou false.",
                });
            }
            const result = await pool.query(
                `
                UPDATE professional_profiles pp
                SET
                    email_active = $1,
                    updated_at = CURRENT_TIMESTAMP
                FROM accounts a
                WHERE
                    pp.account_id = a.id
                    AND a.firebase_uid = $2
                RETURNING
                    pp.email_active
                `,
                [
                    isActive,
                    uid
                ]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({
                    error:
                        "Perfil profissional não encontrado.",
                });
            }
            res.json({
                message:
                    "Status do e-mail atualizado com sucesso.",
                isActive:
                    result.rows[0].email_active,
            });
        } catch (error) {
            console.error(
                "ERRO AO ATUALIZAR E-MAIL:",
                error
            );
            res.status(500).json({
                error:
                    "Erro ao atualizar e-mail.",
            });
        }
    }
);
router.put(
    "/social-contacts/me/social/:platform",
    authenticate,
    async (req, res) => {
        try {
            const { uid } = req.user;
            const { platform } = req.params;
            const {
                url,
                isActive
            } = req.body;
            const allowedPlatforms = [
                "linkedin",
                "instagram",
                "github",
                "youtube",
            ];
            if (!allowedPlatforms.includes(platform)) {
                return res.status(400).json({
                    error:
                        "Rede social não permitida.",
                });
            }
            if (
                url !== undefined &&
                typeof url !== "string"
            ) {
                return res.status(400).json({
                    error:
                        "A URL deve ser um texto.",
                });
            }
            if (typeof isActive !== "boolean") {
                return res.status(400).json({
                    error:
                        "isActive deve ser true ou false.",
                });
            }
            const profileResult = await pool.query(
                `
                SELECT
                    pp.id
                FROM professional_profiles pp
                INNER JOIN accounts a
                    ON a.id = pp.account_id
                WHERE a.firebase_uid = $1
                `,
                [uid]
            );
            if (profileResult.rows.length === 0) {
                return res.status(404).json({
                    error:
                        "Perfil profissional não encontrado.",
                });
            }
            const profileId =
                profileResult.rows[0].id;
            const existingResult = await pool.query(
                `
                SELECT
                    id
                FROM social_links
                WHERE
                    professional_profile_id = $1
                    AND platform = $2
                `,
                [
                    profileId,
                    platform
                ]
            );
            let result;
            if (existingResult.rows.length > 0) {
                result = await pool.query(
                    `
                    UPDATE social_links
                    SET
                        url = $1,
                        is_active = $2
                    WHERE
                        id = $3
                    RETURNING
                        id,
                        platform,
                        url,
                        is_active
                    `,
                    [
                        url?.trim() || "",
                        isActive,
                        existingResult.rows[0].id
                    ]
                );
            }
            // Criar
            else {
                result = await pool.query(
                    `
                    INSERT INTO social_links (
                        professional_profile_id,
                        platform,
                        url,
                        is_active
                    )
                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4
                    )
                    RETURNING
                        id,
                        platform,
                        url,
                        is_active
                    `,
                    [
                        profileId,
                        platform,
                        url?.trim() || "",
                        isActive
                    ]
                );
            }
            res.json({
                message:
                    "Rede social atualizada com sucesso.",
                socialLink:
                    result.rows[0],
            });
        } catch (error) {
            console.error(
                "ERRO AO ATUALIZAR REDE SOCIAL:",
                error
            );
            res.status(500).json({
                error:
                    "Erro ao atualizar rede social.",
            });
        }
    }
);
module.exports = router;