import request from 'supertest';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const app = next({ dev: true });
const handle = app.getRequestHandler();

let server: any;

beforeAll(async () => {
  await app.prepare();
  server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(3001);
});

afterAll(() => {
  server.close();
});

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should not allow duplicate registration', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/déjà utilisé/i);
  });

  it('should fail login if not verified', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(403);
  });
});
