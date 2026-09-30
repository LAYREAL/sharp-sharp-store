// Product links: <site>/p/<product-id>. Set VITE_SITE_URL in Vercel to force the main address.
const site = () => (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');

export const productLink = (productId) => `${site()}/p/${encodeURIComponent(productId)}`;

// Returns 'shared' (phone share sheet), 'copied' (link copied) or 'failed'.
export async function shareProduct(product, currency = '') {
  const url = productLink(product.id);
  const text = `${product.name} - ${currency} ${Number(product.price || 0).toLocaleString()}`.trim();
  try {
    if (navigator.share) {
      await navigator.share({ title: product.name, text, url });
      return 'shared';
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return 'failed'; // customer closed the share sheet
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    window.prompt('Copy this link:', url);
    return 'copied';
  }
}

// Reads a product id from /p/<id> or ?p=<id> in the address bar.
export function productIdFromLocation() {
  const m = window.location.pathname.match(/^\/p\/([^/]+)/);
  if (m) return decodeURIComponent(m[1]);
  return new URLSearchParams(window.location.search).get('p');
}
