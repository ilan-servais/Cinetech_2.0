"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const userStatusController_1 = require("../controllers/userStatusController");
const router = express_1.default.Router();
// Middleware d'authentification pour toutes les routes
router.use(authMiddleware_1.verifyToken);
// Routes pour récupérer le statut d'un média
router.get('/status/:mediaType/:mediaId', userStatusController_1.getMediaStatus);
// Routes pour les favoris
router.get('/favorites', userStatusController_1.getFavorites);
router.delete('/favorites/:mediaType/:mediaId', userStatusController_1.removeFavorite);
// Routes pour les médias déjà vus
router.get('/watched', userStatusController_1.getWatchedItems);
router.delete('/watched/:mediaType/:mediaId', userStatusController_1.removeWatched);
// Routes pour les médias à voir plus tard
router.get('/watchlater', userStatusController_1.getWatchLaterItems);
router.delete('/watchlater/:mediaType/:mediaId', userStatusController_1.removeWatchLater);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map