import { store } from '../_lib/store.mjs';
import { json, adminPin } from '../_lib/util.mjs';

export default async (req) => {
  if (req.method !== 'GET') return json({ error: 'method not allowed' }, 405);
  if (String(req.headers.get('x-admin-pin') || '') !== adminPin()) {
    return json({ error: 'unauthorized' }, 401);
  }
  try {
    return json(await store.summary());
  } catch (e) {
    console.error('summary failed', e);
    return json({ error: 'server error' }, 500);
  }
};
