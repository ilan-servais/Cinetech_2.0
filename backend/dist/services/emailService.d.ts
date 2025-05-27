/**
 * Envoie un email de vérification à l'utilisateur
 * @param email - L'adresse email du destinataire
 * @param code - Le code de vérification à 6 chiffres
 * @returns Promise<boolean> - true si l'email a été envoyé avec succès, false sinon
 */
export declare const sendVerificationEmail: (email: string, code: string) => Promise<boolean>;
/**
 * Envoie un email de réinitialisation de mot de passe
 * @param email - L'adresse email du destinataire
 * @param token - Le token de réinitialisation
 * @returns Promise<boolean> - true si l'email a été envoyé avec succès, false sinon
 */
export declare const sendPasswordResetEmail: (email: string, token: string) => Promise<boolean>;
