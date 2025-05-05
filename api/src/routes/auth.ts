import express from 'express';
import { hashPassword, verifyPassword, generateToken, generateUsername } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

// Schéma de validation pour l'inscription
const registerSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" })
});

// Schéma de validation pour la connexion
const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(1, { message: "Le mot de passe est requis" })
});

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    // Valider les données d'entrée
    const validation = registerSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        success: false,
        errors: validation.error.errors 
      });
    }
    
    const { email, password, firstName, lastName } = validation.data;
    
    // Vérifier si l'email est déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'Cet email est déjà utilisé' 
      });
    }
    
    // Générer un nom d'utilisateur au format prenomnom#1234
    const username = await generateUsername(firstName, lastName);
    
    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);
    
    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        hashed_password: hashedPassword,
        username,
        firstName,
        lastName,
        displayName: username
      }
    });
    
    // Générer un token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username || ''
    });
    
    // Définir le cookie HTTP-only
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      sameSite: 'strict'
    });
    
    // Renvoyer les informations utilisateur (sans mot de passe)
    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        is_verified: user.is_verified
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ 
      success: false,
      error: 'Une erreur est survenue lors de l\'inscription'
    });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    // Valider les données d'entrée
    const validation = loginSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        success: false,
        errors: validation.error.errors 
      });
    }
    
    const { email, password } = validation.data;
    
    // Récupérer l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Email ou mot de passe incorrect' 
      });
    }
    
    // Vérifier le mot de passe
    const passwordValid = await verifyPassword(password, user.hashed_password);
    
    if (!passwordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Email ou mot de passe incorrect' 
      });
    }
    
    // Générer un token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username || ''
    });
    
    // Définir le cookie HTTP-only
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      sameSite: 'strict'
    });
    
    // Renvoyer les informations utilisateur (sans mot de passe)
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        is_verified: user.is_verified
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      success: false,
      error: 'Une erreur est survenue lors de la connexion' 
    });
  }
});

// Route pour récupérer les informations de l'utilisateur actuel
router.get('/me', authenticate, async (req, res) => {
  try {
    // L'utilisateur est déjà vérifié par le middleware authenticate
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        firstName: true,
        lastName: true,
        is_verified: true,
        created_at: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ 
      success: false,
      error: 'Une erreur est survenue lors de la récupération du profil' 
    });
  }
});

// Route de déconnexion
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ 
    success: true, 
    message: 'Déconnecté avec succès' 
  });
});

export default router;
