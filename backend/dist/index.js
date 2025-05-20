"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
// Charger les variables d'environnement
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log('CORS configured for origin:', frontendUrl);
app.use('/api', routes_1.default); // ← Ce préfixe est important
// ✅ CORS middleware à mettre en haut
app.use((0, cors_1.default)({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Debug-Cookies'],
}));
// ✅ OPTIONS preflight requests
app.options('*', (0, cors_1.default)());
// ✅ Cookie parser et JSON parser
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// ✅ Debug cookies (optionnel)
app.use((req, res, next) => {
    console.log('🌐 Requête entrante avec cookies :', req.cookies);
    console.log('Auth token cookie:', req.cookies.auth_token || 'undefined');
    next();
});
// ✅ Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
// ✅ Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map