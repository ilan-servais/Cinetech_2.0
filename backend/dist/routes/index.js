"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const testRoutes_1 = __importDefault(require("./testRoutes"));
const userStatusRoutes_1 = __importDefault(require("./userStatusRoutes"));
const router = express_1.default.Router();
router.use('/auth', authRoutes_1.default);
router.use('/user', userRoutes_1.default);
router.use('/test', testRoutes_1.default);
router.use('/user/status', userStatusRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map