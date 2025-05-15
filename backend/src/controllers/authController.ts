import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sendVerificationEmail } from '../services/emailService';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

// Générer un code de vérification à 6 chiffres
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
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
        password: hashedPassword,
        firstName,
        lastName,
        verificationCode,
        verificationCodeExpires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        isVerified: false,
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
      userId: user.id 
    });

  } catch (error) {
    console.error('Error in register controller:', error);
    res.status(500).json({ message: 'Erreur lors de la création du compte', error });
  }
};

// Les autres méthodes du contrôleur (login, verify, etc.)
// ...existing code...