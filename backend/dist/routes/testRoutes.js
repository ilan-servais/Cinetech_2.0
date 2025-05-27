"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// POST /api/test/reset
router.post('/reset', async (req, res) => {
    try {
        await prisma.user.deleteMany({});
        res.json({ message: 'Tous les utilisateurs ont été supprimés.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression des utilisateurs.' });
    }
});
exports.default = router;
//# sourceMappingURL=testRoutes.js.map