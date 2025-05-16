import express from 'express';
import { register, verify, login } from '../controllers/authController';

const router = express.Router();

// Route d'inscription
router.post('/register', register);

// Route de vérification d'email
router.post('/verify', verify);

// Route de connexion
router.post('/login', login);

export default router;
