const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const pool = require("./db");
const authRoutes = require("./routes/auth");
require("./firebase-admin");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(cors());

app.use(express.json({ limit: "1mb" }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});

app.use(limiter);

app.get("/", (req, res) => {
    res.json({
        message: "SINTELE API funcionando!",
    });
});

pool.query("SELECT NOW()")
    .then(() => {
        console.log("Conectado ao PostgreSQL/Neon!");
    })
    .catch((error) => {
        console.error("Erro ao conectar ao PostgreSQL:", error.message);
    });

app.use("/api", authRoutes);

const accountRoutes = require("./routes/accounts");

app.use("/api", accountRoutes);

app.listen(PORT, () => {
    console.log(`SINTELE API rodando na porta ${PORT}`);
}); 