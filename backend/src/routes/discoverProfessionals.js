const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/public/professionals", async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();

        const result = await pool.query(
            `
            SELECT
                full_name,
                username,
                photo_url,
                bio
            FROM professional_profiles
            WHERE
                is_public = TRUE
                AND username IS NOT NULL
                AND username <> ''
                AND (
                    $1 = ''
                    OR full_name ILIKE '%' || $1 || '%'
                    OR username ILIKE '%' || $1 || '%'
                )
            ORDER BY full_name ASC
            LIMIT 100
            `,
            [search]
        );

        res.json({
            professionals: result.rows.map((professional) => ({
                fullName: professional.full_name,
                username: professional.username,
                photoUrl: professional.photo_url,
                bio: professional.bio,
            })),
        });
    } catch (error) {
        console.error("ERRO AO BUSCAR PROFISSIONAIS:", error);
        res.status(500).json({
            error: "Não foi possível carregar os profissionais do SINTELE.",
        });
    }
});

module.exports = router;
