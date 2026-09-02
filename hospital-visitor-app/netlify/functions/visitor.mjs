import { store } from './_lib/store.mjs';
import { json } from './_lib/util.mjs';

export default async (req) => {
  if (req.method !== 'GET') return json({ error: 'method not allowed' }, 405);
  const url = new URL(req.url);
  const code = url.searchParams.get('code') || '';
  try {
    const v = await store.getByCode(code);
    if (!v) return json({ error: 'not found' }, 404);
    return json(v);
  } catch (e) {
    console.error('visitor failed', e);
    return json({ error: 'server error' }, 500);
  }
};
