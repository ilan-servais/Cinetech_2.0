import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sendVerificationEmail } from '../services/emailService';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Générer un code de vérification à 6 chiffres
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Générer un token unique pour la vérification
const generateVerificationToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  // 1) S’assurer qu’on a bien un JSON
  if (!req.body || typeof req.body !== 'object') {
    console.error('❌ register payload invalid:', req.body);
    res.status(400).json({ message: 'Format de requête invalide' });
    return;
  }
  console.log('📥 register payload:', req.body);

  // 2) Déstructuration « safe »
  const {
    email  = '',
    password = '',
    name     = ''
  } = req.body as { email?: string; password?: string; name?: string };

  // 3) Validation
  if (!email.trim()) {
    res.status(400).json({ message: 'Email requis' });
    return;
  }
  if (!password.trim() || password.length < 6) {
    res.status(400).json({ message: 'Mot de passe requis (min 6 car.)' });
    return;
  }
  if (!name.trim()) {
    res.status(400).json({ message: 'Nom requis' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Format d’email invalide' });
    return;
  }

  try {
    // 4) Pas de doublon
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: 'Email déjà utilisé' });
      return;
    }

    // 5) Création utilisateur
    const hashed = await bcrypt.hash(password, 12);
    const code = generateVerificationCode();
    const token = generateVerificationToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        username: name,
        hashed_password: hashed,
        verification_code: code,
        verification_token: token,
        verificationCodeExpires: expires
      }
    });

    // 6) Email de vérif
    const sent = await sendVerificationEmail(email, code);
    if (!sent) console.warn(`⚠️ Email not sent to ${email}`);

    res.status(201).json({
      message: 'Inscription réussie. Vérifiez vos emails !',
      success: true,
      userId: user.id
    });
    return;
  } catch (err) {
    console.error('❌ Error in register controller:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la création du compte', 
      error: process.env.NODE_ENV === 'production' ? {} : err
    });
    return;
  }
};

export const verify = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ message: 'Email et code requis' });
      return;
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
      return;
    }

    // Vérifier si l'utilisateur est déjà vérifié
    if (user.is_verified) {
      res.status(400).json({ message: 'Compte déjà vérifié' });
      return;
    }

    // Vérifier si le code est correct
    if (user.verification_code !== code) {
      res.status(400).json({ message: 'Code de vérification invalide' });
      return;
    }

    // Vérifier si le code a expiré
    if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
      res.status(400).json({ message: 'Code de vérification expiré' });
      return;
    }

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { email },
      data: {
        is_verified: true,
        verification_code: null,
        verificationCodeExpires: null,
      },
    });

    res.status(200).json({ 
      message: 'Email vérifié avec succès', 
      success: true 
    });
    return;
  } catch (error) {
    console.error('Error in verify controller:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification', error });
    return;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email et mot de passe requis" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return;
    }

    if (!user.is_verified) {
      res.status(401).json({ message: "Veuillez vérifier votre email avant de vous connecter" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Définir le cookie ici
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false, // en local on garde false
      sameSite: 'lax',
      path: '/',
    });

    res
      .cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // ou 'strict' ou 'none' selon ton setup
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      })
      .status(200)
      .json({
        message: "Connexion réussie",
        user: { email: user.email, name: user.username }
      });
    return;

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: "Une erreur est survenue lors de la connexion" });
    return;
  }
};
