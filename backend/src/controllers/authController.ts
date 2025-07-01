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
  // 1) Sécurité sur le format du body
  if (!req.body || typeof req.body !== 'object') {
    console.error('⛔ register payload invalide:', req.body);
    res.status(400).json({ message: 'Format de requête invalide' });
    return;
  }

  // 2) Déstructuration _après_ avoir vérifié req.body
  const { email = '', password = '', name = '' } = req.body as {
    email?: string;
    password?: string;
    name?: string;
  };

  // 3) Validation des champs
  if (!email.trim() || !password.trim() || !name.trim()) {
    res.status(400).json({ message: 'Email, mot de passe et nom sont requis' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ message: 'Le mot de passe doit faire au moins 6 caractères' });
    return;
  }
  // simple regex email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ message: 'Format d’email invalide' });
    return;
  }

  try {
    // 4) doublon
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: 'Cet email est déjà enregistré' });
      return;
    }

    // 5) hash du mot de passe
    const hashed = await bcrypt.hash(password, 12);

    // 6) création du code + user
    const verificationCode = generateVerificationCode();
    const user = await prisma.user.create({
      data: {
        email,
        username: name,
        hashed_password: hashed,
        verification_code: verificationCode,
        verificationCodeExpires: new Date(Date.now() + 1000 * 60 * 60), // +1h
      },
    });

    // 7) envoi email (on continue même si ça échoue)
    const ok = await sendVerificationEmail(email, verificationCode);
    if (!ok) console.warn(`⚠️ Envoi du mail de vérif à ${email} a échoué`);

    // 8) réponse
    res.status(201).json({
      message: 'Utilisateur créé, vérifiez votre email',
      success: true,
      userId: user.id,
    });
  } catch (err) {
    console.error('Error in register controller:', err);
    res.status(500).json({ message: 'Erreur lors de la création du compte' });
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
  } catch (error) {
    console.error('Error in verify controller:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification', error });
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

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: "Une erreur est survenue lors de la connexion" });
  }
};
