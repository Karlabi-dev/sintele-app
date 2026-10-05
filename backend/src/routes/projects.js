const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const pool = require("../db");
const router = express.Router();

router.get(
    "/projects/me",
    authenticate,
    async (req, res) => {
        try {
            const { uid } = req.user;

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

            const projectsResult = await pool.query(
                `
                SELECT
                    id,
                    title,
                    description,
                    image_url,
                    project_url,
                    github_url,
                    is_active,
                    created_at,
                    updated_at
                FROM projects
                WHERE professional_profile_id = $1
                ORDER BY created_at ASC
                `,
                [profileId]
            );
            res.json({
                projects:
                    projectsResult.rows,
            });
        } catch (error) {
            console.error(
                "ERRO AO BUSCAR PROJETOS:",
                error
            );
            res.status(500).json({
                error:
                    "Erro ao buscar projetos.",
            });
        }
    }
);

router.post(
    "/projects",
    authenticate,
    async (req, res) => {
        try {
            const { uid } = req.user;
            const {
                title,
                description,
                imageUrl,
                projectUrl,
                githubUrl,
                isActive
            } = req.body;
            if (
                !title ||
                typeof title !== "string" ||
                !title.trim()
            ) {
                return res.status(400).json({
                    error:
                        "O nome do projeto é obrigatório.",
                });
            }
 
            if (
                projectUrl !== undefined &&
                projectUrl !== null &&
                projectUrl !== ""
            ) {
                try {
                    new URL(projectUrl);
                } catch {
                    return res.status(400).json({
                        error:
                            "A URL do projeto é inválida.",
                    });
                }
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
            const shouldBeActive =
                isActive === true;
            if (shouldBeActive) {
                const activeResult = await pool.query(
                    `
                    SELECT
                        COUNT(*)::int AS total
                    FROM projects
                    WHERE
                        professional_profile_id = $1
                        AND is_active = true
                    `,
                    [profileId]
                );
                if (
                    activeResult.rows[0].total >= 2
                ) {
                    return res.status(409).json({
                        error:
                            "Você já possui 2 projetos ativos. Desative um projeto antes de ativar outro.",
                    });
                }
            }

            const result = await pool.query(
                `
                INSERT INTO projects (
                    professional_profile_id,
                    title,
                    description,
                    image_url,
                    project_url,
                    github_url,
                    is_active
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7
                )
                RETURNING
                    id,
                    title,
                    description,
                    image_url,
                    project_url,
                    github_url,
                    is_active,
                    created_at,
                    updated_at
                `,
                [
                    profileId,
                    title.trim(),
                    description?.trim() || null,
                    imageUrl?.trim() || null,
                    projectUrl?.trim() || null,
                    githubUrl?.trim() || null,
                    shouldBeActive
                ]
            );
            res.status(201).json({
                message:
                    "Projeto criado com sucesso.",
                project:
                    result.rows[0],
            });
        } catch (error) {
            console.error(
                "ERRO AO CRIAR PROJETO:",
                error
            );
            res.status(500).json({
                error:
                    "Erro ao criar projeto.",
            });
        }
    }
);

router.put(
    "/projects/:id",
    authenticate,
    async (req, res) => {
        try {
            const { uid } = req.user;
            const { id } = req.params;
            const {
                title,
                description,
                imageUrl,
                projectUrl,
                githubUrl,
                isActive
            } = req.body;
            if (
                !title ||
                typeof title !== "string" ||
                !title.trim()
            ) {
                return res.status(400).json({
                    error:
                        "O nome do projeto é obrigatório.",
                });
            }
            if (
                projectUrl !== undefined &&
                projectUrl !== null &&
                projectUrl !== ""
            ) {
                try {
                    new URL(projectUrl);
                } catch {
                    return res.status(400).json({
                        error:
                            "A URL do projeto é inválida.",
                    });
                }
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
            const projectResult = await pool.query(
                `
                SELECT
                    id,
                    is_active
                FROM projects
                WHERE
                    id = $1
                    AND professional_profile_id = $2
                `,
                [
                    id,
                    profileId
                ]
            );
            if (projectResult.rows.length === 0) {
                return res.status(404).json({
                    error:
                        "Projeto não encontrado.",
                });
            }
            const currentProject =
                projectResult.rows[0];
            const shouldBeActive =
                isActive === true;
            if (
                shouldBeActive &&
                !currentProject.is_active
            ) {
                const activeResult = await pool.query(
                    `
                    SELECT
                        COUNT(*)::int AS total
                    FROM projects
                    WHERE
                        professional_profile_id = $1
                        AND is_active = true
                    `,
                    [profileId]
                );
                if (
                    activeResult.rows[0].total >= 2
                ) {
                    return res.status(409).json({
                        error:
                            "Você já possui 2 projetos ativos. Desative um projeto antes de ativar outro.",
                    });
                }
            }
            const result = await pool.query(
                `
                UPDATE projects
                SET
                    title = $1,
                    description = $2,
                    image_url = $3,
                    project_url = $4,
                    github_url = $5,
                    is_active = $6,
                    updated_at = CURRENT_TIMESTAMP
                WHERE
                    id = $7
                    AND professional_profile_id = $8
                RETURNING
                    id,
                    title,
                    description,
                    image_url,
                    project_url,
                    github_url,
                    is_active,
                    created_at,
                    updated_at
                `,
                [
                    title.trim(),
                    description?.trim() || null,
                    imageUrl?.trim() || null,
                    projectUrl?.trim() || null,
                    githubUrl?.trim() || null,
                    shouldBeActive,
                    id,
                    profileId
                ]
            );
            res.json({
                message:
                    "Projeto atualizado com sucesso.",
                project:
                    result.rows[0],
            });
        } catch (error) {
            console.error(
                "ERRO AO ATUALIZAR PROJETO:",
                error
            );
            res.status(500).json({
                error:
                    "Erro ao atualizar projeto.",
            });
        }
    }
);
router.put(
    "/projects/:id/status",
    authenticate,
    async (req, res) => {
        try {
            const { uid } = req.user;
            const { id } = req.params;
            const { isActive } = req.body;
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

            const projectResult = await pool.query(
                `
                SELECT
                    id,
                    is_active
                FROM projects
                WHERE
                    id = $1
                    AND professional_profile_id = $2
                `,
                [
                    id,
                    profileId
                ]
            );
            if (projectResult.rows.length === 0) {
                return res.status(404).json({
                    error:
                        "Projeto não encontrado.",
                });
            }
            // Se está tentando ativar,
            // verificar limite
            if (
                isActive &&
                !projectResult.rows[0].is_active
            ) {
                const activeResult = await pool.query(
                    `
                    SELECT
                        COUNT(*)::int AS total
                    FROM projects
                    WHERE
                        professional_profile_id = $1
                        AND is_active = true
                    `,
                    [profileId]
                );
                if (
                    activeResult.rows[0].total >= 2
                ) {
                    return res.status(409).json({
                        error:
                            "Você já possui 2 projetos ativos. Desative um projeto antes de ativar outro.",
                    });
                }
            }

            const result = await pool.query(
                `
                UPDATE projects
                SET
                    is_active = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE
                    id = $2
                    AND professional_profile_id = $3
                RETURNING
                    id,
                    is_active
                `,
                [
                    isActive,
                    id,
                    profileId
                ]
            );
            res.json({
                message:
                    isActive
                        ? "Projeto ativado com sucesso."
                        : "Projeto desativado com sucesso.",
                project:
                    result.rows[0],
            });
        } catch (error) {
            console.error(
                "ERRO AO ALTERAR STATUS DO PROJETO:",
                error
            );
            res.status(500).json({
                error:
                    "Erro ao alterar status do projeto.",
            });
        }
    }
);

router.delete(
    "/projects/:id",
    authenticate,
    async (req, res) => {
        try {
            const { uid } = req.user;
            const { id } = req.params;
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
            const result = await pool.query(
                `
                DELETE FROM projects
                WHERE
                    id = $1
                    AND professional_profile_id = $2
                RETURNING id
                `,
                [
                    id,
                    profileId
                ]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({
                    error:
                        "Projeto não encontrado.",
                });
            }
            res.json({
                message:
                    "Projeto excluído com sucesso.",
            });
        } catch (error) {
            console.error(
                "ERRO AO EXCLUIR PROJETO:",
                error
            );
            res.status(500).json({
                error:
                    "Erro ao excluir projeto.",
            });
        }
    }
);

router.get(
    "/projects/me/all-projects-link",
    authenticate,
    async (req, res) => {
        try {
            const { uid } = req.user;
            const result = await pool.query(
                `
                SELECT
                    pp.all_projects_url
                FROM professional_profiles pp
                INNER JOIN accounts a
                    ON a.id = pp.account_id
                WHERE a.firebase_uid = $1
                `,
                [uid]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({
                    error:
                        "Perfil profissional não encontrado.",
                });
            }
            res.json({
                allProjectsUrl:
                    result.rows[0].all_projects_url || null,
            });
        } catch (error) {
            console.error(
                "ERRO AO BUSCAR LINK DE TODOS OS PROJETOS:",
                error
            );
            res.status(500).json({
                error:
                    "Erro ao buscar link de todos os projetos.",
            });
        }
    }
);

router.put(
    "/projects/me/all-projects-link",
    authenticate,
    async (req, res) => {
        try {
            const { uid } = req.user;
            const { allProjectsUrl } = req.body;
            if (
                allProjectsUrl !== null &&
                allProjectsUrl !== undefined &&
                allProjectsUrl !== ""
            ) {
                if (
                    typeof allProjectsUrl !== "string"
                ) {
                    return res.status(400).json({
                        error:
                            "O link de todos os projetos deve ser um texto.",
                    });
                }
                try {
                    new URL(allProjectsUrl);
                } catch {
                    return res.status(400).json({
                        error:
                            "A URL de todos os projetos é inválida.",
                    });
                }
            }
            const result = await pool.query(
                `
                UPDATE professional_profiles pp
                SET
                    all_projects_url = $1,
                    updated_at = CURRENT_TIMESTAMP
                FROM accounts a
                WHERE
                    pp.account_id = a.id
                    AND a.firebase_uid = $2
                RETURNING
                    pp.all_projects_url
                `,
                [
                    allProjectsUrl?.trim() || null,
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
                    "Link de todos os projetos atualizado com sucesso.",
                allProjectsUrl:
                    result.rows[0].all_projects_url,
            });
        } catch (error) {
            console.error(
                "ERRO AO ATUALIZAR LINK DE TODOS OS PROJETOS:",
                error
            );
            res.status(500).json({
                error:
                    "Erro ao atualizar link de todos os projetos.",
            });
        }
    }
);
module.exports = router;