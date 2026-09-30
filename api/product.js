// Serves the store page for /p/<product-id> with that product's name, price and photo in the
// link-preview tags (what WhatsApp, Facebook, iMessage etc. read). People still get the normal store.
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function rest(base, key, path) {
  const r = await fetch(`${base}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!r.ok) return null;
  return r.json();
}

export default async function handler(req, res) {
  const id = String(req.query.id || '').slice(0, 120);
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${host}`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

  // The normal store page (the built index.html)
  let html = '';
  try {
    const r = await fetch(`${origin}/index.html`);
    if (r.ok) html = await r.text();
  } catch { /* handled below */ }

  if (!html) {
    // Safety net: send the visitor to the store with the product id in the address
    res.status(200).send(`<!doctype html><meta charset="utf-8"><script>location.replace('/?p=${encodeURIComponent(id)}')</script>`);
    return;
  }

  try {
    const base = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (base && key && id) {
      const [products, settings] = await Promise.all([
        rest(base, key, `products?id=eq.${encodeURIComponent(id)}&select=name,description,price,image,media&limit=1`),
        rest(base, key, 'store_settings?id=eq.1&select=store_name,currency&limit=1'),
      ]);
      const p = products && products[0];
      if (p) {
        const storeName = (settings && settings[0] && settings[0].store_name) || 'SHARP SHARP';
        const currency = (settings && settings[0] && settings[0].currency) || '';
        const title = `${p.name} - ${storeName}`;
        const desc = `${currency} ${Number(p.price || 0).toLocaleString('en-US')}${p.description ? ' | ' + String(p.description).slice(0, 140) : ''}`.trim();
        const candidates = [p.image, ...((Array.isArray(p.media) ? p.media : []).map((m) => m && m.url))];
        const image = candidates.find((u) => typeof u === 'string' && /^https:\/\//.test(u));
        const url = `${origin}/p/${encodeURIComponent(id)}`;

        const tags = [
          `<meta property="og:type" content="product" />`,
          `<meta property="og:site_name" content="${esc(storeName)}" />`,
          `<meta property="og:title" content="${esc(title)}" />`,
          `<meta property="og:description" content="${esc(desc)}" />`,
          `<meta property="og:url" content="${esc(url)}" />`,
          image ? `<meta property="og:image" content="${esc(image)}" />` : '',
          `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
          `<meta name="twitter:title" content="${esc(title)}" />`,
          `<meta name="twitter:description" content="${esc(desc)}" />`,
          image ? `<meta name="twitter:image" content="${esc(image)}" />` : '',
        ].filter(Boolean).join('\n    ');

        html = html
          .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
          .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${esc(desc)}" />`)
          .replace('</head>', `    ${tags}\n  </head>`);
      }
    }
  } catch { /* fall back to the plain store page */ }

  res.status(200).send(html);
}
