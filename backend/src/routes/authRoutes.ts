import express from "express";
import cors from "cors";
import { register, verify, login, me, logout } from "../controllers/authController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const corsOptions = {
  origin: frontendUrl,
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  optionsSuccessStatus: 204,
};

// Appliquer CORS à toutes les routes d"authentification
router.use(cors(corsOptions));
// Gérer explicitement les requêtes OPTIONS
router.options('*', cors(corsOptions));

// Routes publiques
router.post("/register", register);
router.post("/verify", verify);
router.post("/login", login);

// Routes protégées par token
router.get("/me", verifyToken, me);
router.post("/logout", verifyToken, logout);

export default router;
