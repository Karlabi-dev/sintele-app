const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const pool = require("../db");
const router = express.Router();
router.get(
    "/profiles/professional/me",
    authenticate,
    async (req, res) => {
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
                    pp.job_title,
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
    }
);
router.put(
    "/profiles/professional/me",
    authenticate,
    async (req, res) => {
        try {
            const { uid } = req.user;
            const {
                fullName,
                username,
                jobTitle,
                profession,
                companyName,
                bio,
                city,
                state,
                phone,
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
                        error:
                            "Username deve conter apenas letras, números e hífen.",
                    });
                }
                if (
                    normalizedUsername.length < 3 ||
                    normalizedUsername.length > 50
                ) {
                    return res.status(400).json({
                        error:
                            "Username deve ter entre 3 e 50 caracteres.",
                    });
                }
            }
            const result = await pool.query(
                `
                UPDATE professional_profiles pp
                SET
                    full_name = $1,
                    username = $2,
                    job_title = $3,
                    profession = $4,
                    company_name = $5,
                    bio = $6,
                    city = $7,
                    state = $8,
                    phone = $9,
                    updated_at = CURRENT_TIMESTAMP
                FROM accounts a
                WHERE pp.account_id = a.id
                  AND a.firebase_uid = $10
                RETURNING
                    pp.id,
                    pp.account_id,
                    pp.full_name,
                    pp.username,
                    pp.photo_url,
                    pp.job_title,
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
                    jobTitle?.trim() || null,
                    profession?.trim() || null,
                    companyName?.trim() || null,
                    bio?.trim() || null,
                    city?.trim() || null,
                    state?.trim() || null,
                    phone?.trim() || null,
                    uid,
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
                    "Perfil profissional atualizado com sucesso!",
                profile: result.rows[0],
            });
        } catch (error) {
            console.error(
                "ERRO AO ATUALIZAR PERFIL PROFISSIONAL:",
                error
            );
            if (error.code === "23505") {
                return res.status(409).json({
                    error:
                        "Este username já está em uso.",
                });
            }
            res.status(500).json({
                error:
                    "Erro ao atualizar perfil profissional.",
            });
        }
    }
);
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
                    pp.job_title,
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
                    error:
                        "Perfil profissional não encontrado.",
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
                error:
                    "Erro ao buscar perfil público.",
            });
        }
    }
);
router.put(
    "/profiles/professional/me/photo",
    authenticate,
    async (req, res) => {
        try {
            const { uid } = req.user;
            const { photoUrl } = req.body;
            if (!photoUrl || !photoUrl.trim()) {
                return res.status(400).json({
                    error:
                        "URL da foto é obrigatória.",
                });
            }
            const result = await pool.query(
                `
                UPDATE professional_profiles pp
                SET
                    photo_url = $1,
                    updated_at = CURRENT_TIMESTAMP
                FROM accounts a
                WHERE
                    pp.account_id = a.id
                    AND a.firebase_uid = $2
                RETURNING
                    pp.id,
                    pp.photo_url,
                    pp.updated_at
                `,
                [
                    photoUrl.trim(),
                    uid,
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
                    "Foto de perfil atualizada com sucesso!",
                profile: result.rows[0],
            });
        } catch (error) {
            console.error(
                "ERRO AO ATUALIZAR FOTO DO PERFIL:",
                error
            );
            res.status(500).json({
                error:
                    "Erro ao atualizar foto do perfil.",
            });
        }
    }
);
router.get(
    "/public/professional/:username",
    async (req, res) => {
        try {
            const { username } = req.params;
            const normalizedUsername = username
                .trim()
                .toLowerCase();
            const profileResult = await pool.query(
                `
                SELECT
                    pp.id,
                    pp.full_name,
                    pp.username,
                    pp.photo_url,
                    pp.job_title,
                    pp.profession,
                    pp.company_name,
                    pp.bio,
                    pp.city,
                    pp.state,
                    pp.all_projects_url
                FROM professional_profiles pp
                WHERE pp.username = $1
                `,
                [normalizedUsername]
            );
            if (profileResult.rows.length === 0) {
                return res.status(404).json({
                    error:
                        "Perfil profissional não encontrado.",
                });
            }
            const profile = profileResult.rows[0];
            const contactResult = await pool.query(
                `
                SELECT
                    pp.phone,
                    pp.whatsapp_active,
                    pp.phone_active,
                    pp.email_active,
                    a.email
                FROM professional_profiles pp
                INNER JOIN accounts a
                    ON a.id = pp.account_id
                WHERE pp.id = $1
                `,
                [profile.id]
            );
            const contact = contactResult.rows[0];
            const socialResult = await pool.query(
                `
                SELECT
                    platform,
                    url
                FROM social_links
                WHERE
                    professional_profile_id = $1
                    AND is_active = true
                ORDER BY created_at ASC
                `,
                [profile.id]
            );
            const projectsResult = await pool.query(
                `
                SELECT
                    id,
                    title,
                    description,
                    image_url,
                    project_url,
                    github_url
                FROM projects
                WHERE
                    professional_profile_id = $1
                    AND is_active = true
                ORDER BY created_at ASC
                LIMIT 2
                `,
                [profile.id]
            );
            const contacts = {};
            if (contact?.whatsapp_active) {
                contacts.whatsapp =
                    contact.phone;
            }
            if (contact?.phone_active) {
                contacts.phone =
                    contact.phone;
            }
            if (contact?.email_active) {
                contacts.email =
                    contact.email;
            }
            res.json({
                profile: {
                    id: profile.id,
                    fullName:
                        profile.full_name,
                    username:
                        profile.username,
                    photoUrl:
                        profile.photo_url,
                    jobTitle:
                        profile.job_title,
                    profession:
                        profile.profession,
                    companyName:
                        profile.company_name,
                    bio:
                        profile.bio,
                    city:
                        profile.city,
                    state:
                        profile.state,
                    allProjectsUrl:
                        profile.all_projects_url,
                },
                contacts,
                socialLinks:
                    socialResult.rows,
                projects:
                    projectsResult.rows,
            });
        } catch (error) {
            console.error(
                "ERRO AO BUSCAR PERFIL PÚBLICO:",
                error
            );
            res.status(500).json({
                error:
                    "Erro ao buscar perfil público.",
            });
        }
    }
);
module.exports = router;