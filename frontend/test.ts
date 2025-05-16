import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api/auth';
const MAILHOG_API = 'http://localhost:8025/api/v2/messages';
const RESET_URL = 'http://localhost:3001/api/test/reset';

const testEmail = `test${Date.now()}@example.com`;
const password = 'Test123!';
const name = 'Test User';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

// 🧹 Supprime tous les utilisateurs existants
async function resetDatabase(): Promise<void> {
  const response = await fetch(RESET_URL, {
    method: 'POST',
    headers: defaultHeaders,
  });

  const result = await (response.json() as Promise<{ message: string }>);
  console.log('🧹 Reset DB:', result);
}

async function registerUser(): Promise<boolean> {
  console.log('➡️ Tentative d’inscription...');
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ email: testEmail, name, password }),
    credentials: 'include',
  } as any);

  const data = await (response.json() as Promise<{ success: boolean; message?: string; error?: any }>);
  console.log('📥 Réponse register:', data);
  return data.success;
}

async function waitAndGetVerificationCode(email: string): Promise<string> {
  console.log('⏳ Attente du code de vérification dans Mailhog...');
  let tries = 10;

  while (tries-- > 0) {
    const res = await fetch(MAILHOG_API);
    const data = await (res.json() as Promise<{ items: any[] }>);

    const message = data.items.find((msg: any) =>
      msg.Content.Headers.To.includes(email)
    );

    if (message) {
      const body = message.Content.Body;
      const match = body.match(/code[\s:]+(\d{6})/i);
      if (match) {
        const code = match[1];
        console.log('✅ Code trouvé :', code);
        return code;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('❌ Code de vérification introuvable');
}

async function verifyCode(code: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/verify`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ email: testEmail, code }),
  });

  const data = await (response.json() as Promise<{ success: boolean; message?: string }>);
  console.log('📥 Réponse verify:', data);
  return data.success;
}

async function loginUser(): Promise<void> {
  console.log('➡️ Tentative de connexion...');
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ email: testEmail, password }),
    credentials: 'include',
  } as any);

  const data = await response.json();
  console.log('📥 Réponse login:', data);
}

async function run(): Promise<void> {
  await resetDatabase();

  const registered = await registerUser();
  if (!registered) return;

  const code = await waitAndGetVerificationCode(testEmail);
  const verified = await verifyCode(code);
  if (!verified) return;

  await loginUser();
}

run().catch(console.error);
