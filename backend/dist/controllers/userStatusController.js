"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWatchLaterItems = exports.getWatchedItems = exports.removeWatchLater = exports.removeWatched = exports.removeFavorite = exports.removeStatus = exports.getFavorites = exports.toggleStatus = exports.getMediaStatus = void 0;
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Récupère tous les statuts pour un utilisateur et un média donné
 */
const getMediaStatus = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Utilisateur non authentifié' });
        }
        const { mediaType, mediaId } = req.params;
        // Vérifier que les paramètres sont valides
        if (!mediaType || !mediaId || isNaN(parseInt(mediaId))) {
            return res.status(400).json({ message: 'Paramètres invalides' });
        }
        // Récupérer tous les statuts pour ce média
        const statuses = await prisma.userStatus.findMany({
            where: {
                userId,
                mediaId: parseInt(mediaId),
                mediaType
            }
        });
        // Préparer l'objet de réponse (tous les statuts sont false par défaut)
        const result = {
            favorite: false,
            watched: false,
            watchLater: false
        };
        // Mettre à jour les statuts trouvés
        statuses.forEach((status) => {
            if (status.status === client_2.StatusType.FAVORITE) {
                result.favorite = true;
            }
            else if (status.status === client_2.StatusType.WATCHED) {
                result.watched = true;
            }
            else if (status.status === client_2.StatusType.WATCH_LATER) {
                result.watchLater = true;
            }
        });
        return res.status(200).json({
            success: true,
            ...result
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération du statut:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.getMediaStatus = getMediaStatus;
/**
 * Active ou désactive un statut (toggle)
 */
const toggleStatus = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
        }
        const { mediaId, mediaType, status, title, posterPath } = req.body;
        // Validation des données
        if (!mediaId || !mediaType || !status) {
            return res.status(400).json({ success: false, message: 'Données manquantes' });
        }
        // Convertir le status en enum StatusType
        let statusEnum;
        try {
            statusEnum = status.toUpperCase();
            // Vérifier que le status est valide
            if (!Object.values(client_2.StatusType).includes(status)) {
                return res.status(400).json({ success: false, message: 'Statut invalide' });
            }
        }
        catch (e) {
            return res.status(400).json({ success: false, message: 'Format de statut invalide' });
        }
        // Vérifier si le statut existe déjà
        const existingStatus = await prisma.userStatus.findFirst({
            where: {
                userId,
                mediaId: parseInt(String(mediaId)),
                mediaType,
                status: statusEnum
            }
        });
        let result;
        if (existingStatus) {
            // Si le statut existe, on le supprime (toggle off)
            await prisma.userStatus.delete({
                where: {
                    id: existingStatus.id
                }
            });
            result = false;
        }
        else {
            // Si le statut n'existe pas encore, on le crée (toggle on)
            await prisma.userStatus.create({
                data: {
                    userId,
                    mediaId: parseInt(String(mediaId)),
                    mediaType,
                    status: statusEnum,
                    title,
                    posterPath
                }
            });
            // Si on ajoute WATCHED, on supprime éventuellement WATCH_LATER
            if (statusEnum === client_2.StatusType.WATCHED) {
                await prisma.userStatus.deleteMany({
                    where: {
                        userId,
                        mediaId: parseInt(String(mediaId)),
                        mediaType,
                        status: client_2.StatusType.WATCH_LATER
                    }
                });
            }
            result = true;
        }
        // Récupérer l'état actuel de tous les statuts après modification
        const currentStatuses = await prisma.userStatus.findMany({
            where: {
                userId,
                mediaId: parseInt(String(mediaId)),
                mediaType
            }
        });
        const statusResponse = {
            favorite: currentStatuses.some((s) => s.status === client_2.StatusType.FAVORITE),
            watched: currentStatuses.some((s) => s.status === client_2.StatusType.WATCHED),
            watchLater: currentStatuses.some((s) => s.status === client_2.StatusType.WATCH_LATER)
        };
        return res.status(200).json({
            success: true,
            // Retourne le status spécifique qui a été modifié
            [status.toLowerCase()]: result,
            ...statusResponse
        });
    }
    catch (error) {
        console.error('Erreur lors du toggle de statut:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.toggleStatus = toggleStatus;
/**
 * Récupère tous les favoris d'un utilisateur
 */
const getFavorites = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
        }
        const favorites = await prisma.userStatus.findMany({
            where: {
                userId,
                status: client_2.StatusType.FAVORITE
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        // Transformer les résultats pour le format attendu
        const formattedFavorites = favorites.map((favorite) => ({
            id: favorite.id,
            mediaId: favorite.mediaId,
            mediaType: favorite.mediaType,
            title: favorite.title || '',
            posterPath: favorite.posterPath,
            createdAt: favorite.createdAt
        }));
        return res.status(200).json({
            success: true,
            favorites: formattedFavorites
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des favoris:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.getFavorites = getFavorites;
/**
 * Supprime un statut spécifique
 */
const removeStatus = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
        }
        const { mediaType, mediaId, status } = req.params;
        // Vérifier que les paramètres sont valides
        if (!mediaType || !mediaId || isNaN(parseInt(mediaId)) || !status) {
            return res.status(400).json({ success: false, message: 'Paramètres invalides' });
        }
        // Convertir le status en enum StatusType
        let statusEnum;
        try {
            statusEnum = status.toUpperCase();
            // Vérifier que le status est valide
            if (!Object.values(client_2.StatusType).includes(status)) {
                return res.status(400).json({ success: false, message: 'Statut invalide' });
            }
        }
        catch (e) {
            return res.status(400).json({ success: false, message: 'Format de statut invalide' });
        }
        // Supprimer le statut
        const result = await prisma.userStatus.deleteMany({
            where: {
                userId,
                mediaId: parseInt(mediaId),
                mediaType,
                status: statusEnum
            }
        });
        return res.status(200).json({
            success: true,
            removed: result.count > 0
        });
    }
    catch (error) {
        console.error('Erreur lors de la suppression du statut:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.removeStatus = removeStatus;
// Fonctions compatibles avec d'anciennes API
const removeFavorite = async (req, res) => {
    try {
        req.params.status = 'FAVORITE';
        return (0, exports.removeStatus)(req, res);
    }
    catch (error) {
        console.error('Erreur lors de la suppression du favori:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.removeFavorite = removeFavorite;
const removeWatched = async (req, res) => {
    try {
        req.params.status = 'WATCHED';
        return (0, exports.removeStatus)(req, res);
    }
    catch (error) {
        console.error('Erreur lors de la suppression du statut vu:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.removeWatched = removeWatched;
const removeWatchLater = async (req, res) => {
    try {
        req.params.status = 'WATCH_LATER';
        return (0, exports.removeStatus)(req, res);
    }
    catch (error) {
        console.error('Erreur lors de la suppression du statut à voir plus tard:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.removeWatchLater = removeWatchLater;
/**
 * Récupère tous les médias vus par un utilisateur
 */
const getWatchedItems = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
        }
        const items = await prisma.userStatus.findMany({
            where: {
                userId,
                status: client_2.StatusType.WATCHED
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        const formattedItems = items.map((item) => ({
            id: item.id,
            mediaId: item.mediaId,
            mediaType: item.mediaType,
            title: item.title || '',
            posterPath: item.posterPath,
            createdAt: item.createdAt
        }));
        return res.status(200).json({
            success: true,
            items: formattedItems
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des médias vus:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.getWatchedItems = getWatchedItems;
/**
 * Récupère tous les médias à voir plus tard d'un utilisateur
 */
const getWatchLaterItems = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
        }
        const items = await prisma.userStatus.findMany({
            where: {
                userId,
                status: client_2.StatusType.WATCH_LATER
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        const formattedItems = items.map((item) => ({
            id: item.id,
            mediaId: item.mediaId,
            mediaType: item.mediaType,
            title: item.title || '',
            posterPath: item.posterPath,
            createdAt: item.createdAt
        }));
        return res.status(200).json({
            success: true,
            items: formattedItems
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des médias à voir plus tard:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.getWatchLaterItems = getWatchLaterItems;
//# sourceMappingURL=userStatusController.js.map