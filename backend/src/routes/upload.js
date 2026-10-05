const express = require("express");
const multer = require("multer");
const authenticate = require("../middlewares/authMiddleware");
const cloudinary = require("../cloudinary");
const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

async function uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        stream.end(buffer);
    });
}

router.post(
    "/upload/profile-photo",
    authenticate,
    upload.single("photo"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: "Nenhuma foto foi enviada.",
                });
            }
            if (!req.file.mimetype.startsWith("image/")) {
                return res.status(400).json({
                    error: "O arquivo enviado não é uma imagem.",
                });
            }
            const result = await uploadToCloudinary(
                req.file.buffer,
                "sintele/profile-photos"
            );
            res.status(201).json({
                message: "Foto enviada com sucesso!",
                url: result.secure_url,
                public_id: result.public_id,
            });
        } catch (error) {
            console.error(
                "ERRO AO FAZER UPLOAD DA FOTO PROFISSIONAL:",
                error
            );
            res.status(500).json({
                error: "Erro ao enviar foto.",
            });
        }
    }
);

router.post(
    "/upload/company-photo",
    authenticate,
    upload.single("photo"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: "Nenhuma foto foi enviada.",
                });
            }
            if (!req.file.mimetype.startsWith("image/")) {
                return res.status(400).json({
                    error: "O arquivo enviado não é uma imagem.",
                });
            }
            const result = await uploadToCloudinary(
                req.file.buffer,
                "sintele/company-photos"
            );
            res.status(201).json({
                message: "Foto da empresa enviada com sucesso!",
                url: result.secure_url,
                public_id: result.public_id,
            });
        } catch (error) {
            console.error(
                "ERRO AO FAZER UPLOAD DA FOTO DA EMPRESA:",
                error
            );
            res.status(500).json({
                error: "Erro ao enviar foto da empresa.",
            });
        }
    }
);

router.post(
    "/upload/company-cover",
    authenticate,
    upload.single("cover"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: "Nenhuma imagem de fundo foi enviada.",
                });
            }
            if (!req.file.mimetype.startsWith("image/")) {
                return res.status(400).json({
                    error: "O arquivo enviado não é uma imagem.",
                });
            }
            const result = await uploadToCloudinary(
                req.file.buffer,
                "sintele/company-covers"
            );
            res.status(201).json({
                message: "Foto de fundo da empresa enviada com sucesso!",
                url: result.secure_url,
                public_id: result.public_id,
            });
        } catch (error) {
            console.error(
                "ERRO AO FAZER UPLOAD DA FOTO DE FUNDO:",
                error
            );
            res.status(500).json({
                error: "Erro ao enviar foto de fundo da empresa.",
            });
        }
    }
);
router.post(
    "/upload/project-image",
    authenticate,
    upload.single("image"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: "Nenhuma imagem foi enviada.",
                });
            }
            if (!req.file.mimetype.startsWith("image/")) {
                return res.status(400).json({
                    error: "O arquivo enviado não é uma imagem.",
                });
            }
            const result = await uploadToCloudinary(
                req.file.buffer,
                "sintele/project-images"
            );
            res.status(201).json({
                message: "Imagem do projeto enviada com sucesso!",
                url: result.secure_url,
                public_id: result.public_id,
            });
        } catch (error) {
            console.error(
                "ERRO AO FAZER UPLOAD DA IMAGEM DO PROJETO:",
                error
            );
            res.status(500).json({
                error: "Erro ao enviar imagem do projeto.",
            });
        }
    }
);
module.exports = router;