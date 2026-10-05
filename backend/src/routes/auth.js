const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const router = express.Router();
router.get("/me", authenticate, (req, res) => {
    res.json({
        message: "Usuário autenticado com sucesso!",
        user: {
            uid: req.user.uid,
            email: req.user.email,
        },
    });
});
module.exports = router;