export function generateVerificationToken(): string {
  // Génère une chaîne aléatoire ou un JWT pour la vérification par e-mail
  return Math.random().toString(36).substring(2);
}

export function generateVerificationCode(): string {
  // Code numérique à usage unique
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  // TODO : insérez ici votre logique pour envoyer un e-mail
  console.log(`Envoyer un e-mail de vérification à ${email} avec token = ${token}`);
}
