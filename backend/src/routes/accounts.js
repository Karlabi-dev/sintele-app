const express = require("express");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/accounts", authenticate, (req, res) => {
    res.json({
        message: "Token recebido pela API!",
        user: {
            uid: req.user.uid,
            email: req.user.email,
        },
    });
});

module.exports = router;