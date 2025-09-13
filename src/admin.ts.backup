
import { Hono } from 'hono'
import { toJSON } from 'hono/utils/json'
import { HTTPException } from 'hono/http-exception'

type Bindings = {
  YENSAO_KV?: KVNamespace
  MEDIA?: R2Bucket
  SESSION_SECRET?: string
  ADMIN_PASSWORD?: string
}

type AppEnv = { Bindings: Bindings }

// ---- tiny utils ----
const enc = new TextEncoder()
async function hmacSHA256(key: string, msg: string) {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(msg))
  const b = Array.from(new Uint8Array(sig)).map((x) => x.toString(16).padStart(2, '0')).join('')
  return b
}
function b64url(input: string) {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
async function makeToken(secret: string, ttlSec = 3600 * 24 * 7) {
  const exp = Math.floor(Date.now() / 1000) + ttlSec
  const payload = `admin.${exp}`
  const sig = await hmacSHA256(secret, payload)
  return `${b64url(payload)}.${sig}`
}
async function verifyToken(secret: string, token: string) {
  const [p64, sig] = token.split('.')
  if (!p64 || !sig) return false
  const payload = atob(p64.replace(/-/g, '+').replace(/_/g, '/'))
  const [role, expStr] = payload.split('.')
  const exp = Number(expStr || 0)
  if (role !== 'admin' || !exp || Date.now() / 1000 > exp) return false
  const expect = await hmacSHA256(secret, payload)
  return expect === sig
}

function requireStorage(b: Bindings) {
  if (!b.YENSAO_KV || !b.MEDIA) {
    throw new HTTPException(501, { message: 'Storage not configured: please bind KV (YENSAO_KV) and R2 (MEDIA) in wrangler.jsonc' })
  }
}

// ---- data model in KV ----
type Category = { id: number; name: string; slug: string; description?: string; sort?: number; created_at: string }
type Product = {
  id: number
  name: string
  slug: string
  category_id?: number
  price?: number
  status?: 'active' | 'draft' | 'archived'
  short_desc?: string
  long_desc?: string
  images?: string[] // R2 keys
  created_at: string
  sort?: number
}

async function getSeq(kv: KVNamespace, key: string) {
  const n = Number((await kv.get(`seq:${key}`)) || '0') + 1
  await kv.put(`seq:${key}`, String(n))
  return n
}
async function listJSON<T>(kv: KVNamespace, key: string): Promise<T[]> {
  const raw = await kv.get(key)
  return raw ? (JSON.parse(raw) as T[]) : []
}
async function putJSON<T>(kv: KVNamespace, key: string, val: T) {
  await kv.put(key, JSON.stringify(val))
}

// ---- admin app ----
export const adminApp = new Hono<AppEnv>()

// auth: login
adminApp.post('/login', async (c) => {
  const body = await c.req.parseBody()
  const password = (body['password'] || '').toString()
  const expected = c.env.ADMIN_PASSWORD || 'Calomam@12' // default
  if (password !== expected) return c.json({ ok: false, error: 'Invalid password' }, 401)

  const secret = c.env.SESSION_SECRET || 'dev-secret-change-me'
  const token = await makeToken(secret)
  const cookie = `ADMIN_SESSION=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 3600}`
  c.header('Set-Cookie', cookie)
  return c.json({ ok: true })
})

// auth: guard
adminApp.use('*', async (c, next) => {
  if (c.req.path.endsWith('/login')) return next()
  const cookie = c.req.header('Cookie') || ''
  const m = /ADMIN_SESSION=([^;]+)/.exec(cookie)
  if (!m) return c.json({ ok: false, error: 'Unauthorized' }, 401)
  const secret = c.env.SESSION_SECRET || 'dev-secret-change-me'
  const valid = await verifyToken(secret, m[1])
  if (!valid) return c.json({ ok: false, error: 'Unauthorized' }, 401)
  await next()
})

// me
adminApp.get('/me', (c) => c.json({ ok: true, role: 'admin' }))

// ---- categories CRUD ----
adminApp.get('/categories', async (c) => {
  requireStorage(c.env)
  const list = await listJSON<Category>(c.env.YENSAO_KV!, 'cats')
  return c.json({ ok: true, data: list })
})

adminApp.post('/categories', async (c) => {
  requireStorage(c.env)
  const kv = c.env.YENSAO_KV!
  const body = await c.req.json()
  const list = await listJSON<Category>(kv, 'cats')
  const id = await getSeq(kv, 'cat')
  const item: Category = { id, name: body.name, slug: body.slug, description: body.description || '', sort: body.sort || 0, created_at: new Date().toISOString() }
  list.push(item)
  await putJSON(kv, 'cats', list)
  await kv.put(`cat:${id}`, JSON.stringify(item))
  return c.json({ ok: true, data: item })
})

adminApp.put('/categories/:id', async (c) => {
  requireStorage(c.env)
  const kv = c.env.YENSAO_KV!
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const list = await listJSON<Category>(kv, 'cats')
  const idx = list.findIndex((x) => x.id === id)
  if (idx === -1) return c.json({ ok: false, error: 'Not found' }, 404)
  const item = { ...list[idx], ...body, id }
  list[idx] = item
  await putJSON(kv, 'cats', list)
  await kv.put(`cat:${id}`, JSON.stringify(item))
  return c.json({ ok: true, data: item })
})

adminApp.delete('/categories/:id', async (c) => {
  requireStorage(c.env)
  const kv = c.env.YENSAO_KV!
  const id = Number(c.req.param('id'))
  let list = await listJSON<Category>(kv, 'cats')
  list = list.filter((x) => x.id !== id)
  await putJSON(kv, 'cats', list)
  await kv.delete(`cat:${id}`)
  return c.json({ ok: true })
})

// ---- products CRUD ----
adminApp.get('/products', async (c) => {
  requireStorage(c.env)
  const list = await listJSON<Product>(c.env.YENSAO_KV!, 'prods')
  return c.json({ ok: true, data: list })
})

adminApp.post('/products', async (c) => {
  requireStorage(c.env)
  const kv = c.env.YENSAO_KV!
  const body = await c.req.json()
  const list = await listJSON<Product>(kv, 'prods')
  const id = await getSeq(kv, 'prod')
  const item: Product = {
    id, name: body.name, slug: body.slug, category_id: body.category_id ? Number(body.category_id) : undefined,
    price: body.price ? Number(body.price) : 0, status: (body.status || 'active'),
    short_desc: body.short_desc || '', long_desc: body.long_desc || '', images: body.images || [],
    sort: body.sort || 0, created_at: new Date().toISOString()
  }
  list.push(item)
  await putJSON(kv, 'prods', list)
  await kv.put(`prod:${id}`, JSON.stringify(item))
  return c.json({ ok: true, data: item })
})

adminApp.put('/products/:id', async (c) => {
  requireStorage(c.env)
  const kv = c.env.YENSAO_KV!
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const list = await listJSON<Product>(kv, 'prods')
  const idx = list.findIndex((x) => x.id === id)
  if (idx === -1) return c.json({ ok: false, error: 'Not found' }, 404)
  const item = { ...list[idx], ...body, id }
  list[idx] = item
  await putJSON(kv, 'prods', list)
  await kv.put(`prod:${id}`, JSON.stringify(item))
  return c.json({ ok: true, data: item })
})

adminApp.delete('/products/:id', async (c) => {
  requireStorage(c.env)
  const kv = c.env.YENSAO_KV!
  const id = Number(c.req.param('id'))
  let list = await listJSON<Product>(kv, 'prods')
  list = list.filter((x) => x.id !== id)
  await putJSON(kv, 'prods', list)
  await kv.delete(`prod:${id}`)
  return c.json({ ok: true })
})

// ---- image upload to R2 ----
adminApp.post('/upload', async (c) => {
  requireStorage(c.env)
  const form = await c.req.formData()
  const files = form.getAll('files') as File[]
  if (!files?.length) return c.json({ ok: false, error: 'No files' }, 400)
  const results: { key: string; url: string }[] = []
  for (const file of files) {
    const safe = (file.name || 'image.webp').replace(/[^\w.\-]+/g, '_')
    const key = `products/${Date.now()}-${safe}`
    await c.env.MEDIA!.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || 'image/webp' },
    })
    const url = `/api/admin/proxy/${encodeURIComponent(key)}`
    results.push({ key, url })
  }
  return c.json({ ok: true, files: results })
})

// Optional: serve R2 file via proxy (if bucket private)
adminApp.get('/proxy/*', async (c) => {
  if (!c.env.MEDIA) return c.notFound()
  const key = decodeURIComponent(c.req.path.replace('/proxy/',''))
  const obj = await c.env.MEDIA.get(key)
  if (!obj) return c.notFound()
  return new Response(obj.body, { headers: { 'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream' }})
})
