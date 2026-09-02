import { store } from '../_lib/store.mjs';
import { json } from '../_lib/util.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);
  let b;
  try {
    b = await req.json();
  } catch {
    return json({ error: 'bad body' }, 400);
  }
  try {
    const v = await store.checkout(b.code, b.type, b.geo);
    if (!v) return json({ error: 'not found' }, 404);
    return json({ ok: true, visitor: v });
  } catch (e) {
    console.error('checkout failed', e);
    return json({ error: 'server error' }, 500);
  }
};
