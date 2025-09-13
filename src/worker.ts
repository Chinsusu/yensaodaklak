import { Hono } from 'hono';

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  ADMIN_USER?: string;
  ADMIN_PASS?: string;
}

const app = new Hono<{ Bindings: Env }>();

app.get('/api/echo', (c) => c.json({ ok: true, time: new Date().toISOString() }));

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
