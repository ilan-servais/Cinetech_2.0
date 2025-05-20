import { Request, Response } from 'express';
import { StatusType } from '@prisma/client';
export interface UserStatus {
    id: string;
    userId: string;
    mediaId: number;
    mediaType: string;
    status: StatusType;
    title?: string | null;
    posterPath?: string | null;
    createdAt: Date;
}
interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}
/**
 * Récupère tous les statuts pour un utilisateur et un média donné
 */
export declare const getMediaStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Active ou désactive un statut (toggle)
 */
export declare const toggleStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Récupère tous les favoris d'un utilisateur
 */
export declare const getFavorites: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Supprime un statut spécifique
 */
export declare const removeStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const removeFavorite: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const removeWatched: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const removeWatchLater: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Récupère tous les médias vus par un utilisateur
 */
export declare const getWatchedItems: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Récupère tous les médias à voir plus tard d'un utilisateur
 */
export declare const getWatchLaterItems: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
