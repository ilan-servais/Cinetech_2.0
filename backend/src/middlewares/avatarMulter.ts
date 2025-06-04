import multer from 'multer';
import path from 'path';
import fs from 'fs';

// S'assurer que le répertoire existe
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Récupérer l'id utilisateur depuis la requête (ajouté par le middleware verifyToken)
    const userId = req.user?.id || 'unknown';
    
    // Générer un nom de fichier unique avec userId + timestamp + extension originale
    const timestamp = Date.now();
    const fileExt = path.extname(file.originalname);
    const fileName = `user-${userId}-${timestamp}${fileExt}`;
    
    cb(null, fileName);
  }
});

// Filtrer les fichiers pour accepter seulement les images
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accepter seulement les types d'images courants
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté. Seuls les formats JPEG, PNG, GIF et WebP sont acceptés.'));
  }
};

// Configuration de multer
export const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB max
  },
  fileFilter: fileFilter
});
