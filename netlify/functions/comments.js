// GET    /api/comments?slug=xyz
// POST   /api/comments           body: { slug, author, text, ownerToken }
// DELETE /api/comments           body: { slug, id, ownerToken }

const { getStore } = require("@netlify/blobs");

/* store that works on Netlify prod, local with creds, and pure local (in-mem) */
function makeStore() {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token  = process.env.NETLIFY_API_TOKEN;

  if (process.env.NETLIFY === "true") return getStore({ name: "comments" });         // prod
  if (siteID && token)               return getStore({ name: "comments", siteID, token }); // local w/ creds

  // local w/out creds → ephemeral in-memory store
  const mem = new Map();
  return { async get(k){ return mem.get(k) ?? null; }, async set(k,v){ mem.set(k,v); } };
}

const store = makeStore();

/* compatibility wrappers (old/new blobs + in-mem store) */
const readJSON = async (key) => {
  if (typeof store.getJSON === "function") return store.getJSON(key);
  if (typeof store.get === "function") {
    const txt = await store.get(key); if (!txt) return null;
    try { return JSON.parse(txt); } catch { return null; }
  }
  return null;
};
const writeJSON = async (key, val) => {
  if (typeof store.setJSON === "function") return store.setJSON(key, val);
  if (typeof store.set === "function")   return store.set(key, JSON.stringify(val));
  throw new Error("No set method available on store");
};

/* CORS */
const CORS = {
  "Access-Control-Allow-Origin": "*", // tighten to your domain(s) for production
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
};

 export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS };

  try {
    if (event.httpMethod === "GET") {
      const slug = (event.queryStringParameters?.slug || "").trim();
      if (!slug) return res(400, { error: "Missing slug" });
      const arr = (await readJSON(`${slug}.json`)) || [];
      const cleaned = arr.map(({ ownerToken, ...rest }) => rest); // do not leak tokens
      return res(200, cleaned);
    }

    const body = event.body ? JSON.parse(event.body) : null;

    if (event.httpMethod === "POST") {
      const { slug, author, text, ownerToken } = body || {};
      if (!slug || !author || !text || !ownerToken) return res(400, { error: "Missing required fields" });
      const arr = (await readJSON(`${slug}.json`)) || [];
      const item = {
        id: randomId(),
        author: String(author).trim().slice(0, 80),
        text: String(text).trim().slice(0, 2000),
        createdAt: Date.now(),
        ownerToken: String(ownerToken),
      };
      arr.unshift(item);
      await writeJSON(`${slug}.json`, arr);
      const { ownerToken: _omit, ...clean } = item;
      return res(201, clean);
    }

    if (event.httpMethod === "DELETE") {
      const { slug, id, ownerToken } = body || {};
      if (!slug || !id || !ownerToken) return res(400, { error: "Missing slug/id/ownerToken" });
      const arr = (await readJSON(`${slug}.json`)) || [];
      const idx = arr.findIndex(x => x.id === id && x.ownerToken === ownerToken);
      if (idx === -1) return res(403, { error: "Not allowed" });
      arr.splice(idx, 1);
      await writeJSON(`${slug}.json`, arr);
      return { statusCode: 204, headers: CORS, body: "" };
    }

    return res(405, { error: "Method not allowed" });
  } catch (e) {
    return res(500, { error: String(e) });
  }
};

function res(code, data) {
  return { statusCode: code, headers: { "content-type": "application/json", ...CORS }, body: data == null ? "" : JSON.stringify(data) };
}
function randomId() { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2, 8); }
