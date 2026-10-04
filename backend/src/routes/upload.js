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


// ==========================================
// UPLOAD DE FOTO
// ==========================================

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

            const result = await new Promise(
                (resolve, reject) => {

                    const stream =
                        cloudinary.uploader.upload_stream(
                            {
                                folder: "sintele/profile-photos",
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

                    stream.end(req.file.buffer);
                }
            );

            res.status(201).json({
                message: "Foto enviada com sucesso!",
                url: result.secure_url,
                public_id: result.public_id,
            });

        } catch (error) {

            console.error(
                "ERRO AO FAZER UPLOAD DA FOTO:",
                error
            );

            res.status(500).json({
                error: "Erro ao enviar foto.",
            });
        }
    }
);


module.exports = router;