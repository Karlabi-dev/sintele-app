const { getAuth } = require("firebase-admin/auth");

async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Token de autenticação não fornecido.",
            });
        }

        const token = authHeader.split("Bearer ")[1];

        const decodedToken = await getAuth().verifyIdToken(token);

        req.user = decodedToken;

        next();
    } catch (error) {
        console.error("ERRO AO VALIDAR TOKEN:", error);

        return res.status(401).json({
            error: "Token inválido ou expirado.",
        });
    }
}

module.exports = authenticate;