import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import routes from './routes';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

const corsOptions = {
  origin: frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

// Appliquer CORS globalement AVANT tout autre middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

// Monter les routes API
app.use('/api', routes);

// Servir les fichiers statiques depuis le dossier public
app.use(express.static(path.join(__dirname, '../public')));

// Gérer les routes non trouvées
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gérer les erreurs globales
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Erreur interne du serveur :', err);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

// Démarrer le serveur
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Exporter l'application pour les tests ou autres usages
export default app;