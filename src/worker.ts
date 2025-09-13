import { Hono } from "hono"
import { cors } from "hono/cors"
import { adminApp } from "./admin"

export interface Env {
  ASSETS: Fetcher
  DB: D1Database
  YENSAO_KV?: KVNamespace
  MEDIA?: R2Bucket
  SESSION_SECRET?: string
  ADMIN_PASSWORD?: string
}

const app = new Hono<{ Bindings: Env }>()

// Enable CORS for API routes
app.use("/api/*", cors())

// Admin API routes
app.route("/api/admin", adminApp)

// Handle admin UI specifically before wildcard route
app.get("/admin", async (c) => {
  const adminHtml = await c.env.ASSETS.fetch(new Request(new URL("/admin/index.html", c.req.url).toString()))
  return adminHtml
})

app.get("/admin/", async (c) => {
  const adminHtml = await c.env.ASSETS.fetch(new Request(new URL("/admin/index.html", c.req.url).toString()))
  return adminHtml
})

// Serve static assets (HTML, CSS, JS, images) - this should be last
app.get("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw)
})

export default app
