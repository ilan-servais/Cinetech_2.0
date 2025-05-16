import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
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

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    const firstName = name?.split(' ')[0] || '';
    const lastName = name?.split(' ').slice(1).join(' ') || '';

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

    // Générer le code de vérification
    const verificationCode = generateVerificationCode();
    
    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        username: name,
        hashed_password: hashedPassword,
        verification_code: verificationCode,
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

// Ajouter la méthode login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return;
    }

    // Vérifier si l'utilisateur a vérifié son email
    if (!user.is_verified) {
      res.status(401).json({ message: "Veuillez vérifier votre email avant de vous connecter" });
      return;
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return;
    }

    // Générer un token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token: token,
      user: { email: user.email, name: user.username }
    });
    
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: "Une erreur est survenue lors de la connexion" });
  }
};