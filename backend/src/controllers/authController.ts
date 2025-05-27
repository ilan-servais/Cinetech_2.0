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
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      res.status(400).json({ message: 'Email, mot de passe et nom sont requis' });
      return;
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ message: 'Cet email est déjà utilisé' });
      return;
    }

    // Hacher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Générer le code de vérification et token
    const verificationCode = generateVerificationCode();
    const verificationToken = generateVerificationToken();
    
    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        username: name,
        hashed_password: hashedPassword,
        verification_code: verificationCode,
        verification_token: verificationToken,
        verificationCodeExpires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        is_verified: false,
      },
    });

    // Envoyer l'email de vérification
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      console.error('Failed to send verification email');
      // On continue même si l'email échoue, l'utilisateur peut demander un nouveau code
    }

    res.status(201).json({ 
      message: 'Utilisateur créé avec succès. Veuillez vérifier votre email.',
      success: true,
      userId: user.id 
    });

  } catch (error) {
    console.error('Error in register controller:', error);
    res.status(500).json({ message: 'Erreur lors de la création du compte', error });
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

    // ✅ C’est ça qui manquait : définir le cookie ici
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
