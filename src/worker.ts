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

// Serve static assets (HTML, CSS, JS, images)
app.get("*", async (c) => {
  const url = new URL(c.req.url)
  
  // Handle admin UI
  if (url.pathname === "/admin" || url.pathname === "/admin/") {
    return c.env.ASSETS.fetch(new URL("/admin/index.html", url.origin))
  }
  
  // Handle other static assets
  return c.env.ASSETS.fetch(c.req.raw)
})

export default app
