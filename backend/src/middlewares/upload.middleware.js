const multer = require('multer');

const storage = multer.memoryStorage();

// Aceita imagens (até 8MB) e vídeos (até 50MB).
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (/^image\//.test(file.mimetype) || /^video\//.test(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error('Formato não suportado. Envie imagem ou vídeo.'));
    }
});

module.exports = upload;
