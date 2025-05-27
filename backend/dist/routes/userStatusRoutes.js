"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const userStatusController_1 = require("../controllers/userStatusController");
const router = express_1.default.Router();
// GET /api/user/status/:type/:mediaId
router.get('/status/:type/:mediaId', authMiddleware_1.verifyToken, userStatusController_1.getMediaStatus);
// POST /api/user/status/toggle
router.post('/status/toggle', authMiddleware_1.verifyToken, userStatusController_1.toggleStatus);
// GET /api/user/favorite
router.get('/favorite', authMiddleware_1.verifyToken, userStatusController_1.getFavorites);
exports.default = router;
//# sourceMappingURL=userStatusRoutes.js.map