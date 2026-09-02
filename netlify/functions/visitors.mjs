import { store } from './_lib/store.mjs';
import { json, adminPin, PURPOSES } from './_lib/util.mjs';

export default async (req) => {
  if (req.method !== 'GET') return json({ error: 'method not allowed' }, 405);
  if (String(req.headers.get('x-admin-pin') || '') !== adminPin()) {
    return json({ error: 'unauthorized' }, 401);
  }
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || 'in';
  const purpose = url.searchParams.get('purpose');
  const q = url.searchParams.get('q');
  if (purpose && !PURPOSES.includes(purpose)) return json({ error: 'bad purpose' }, 400);
  try {
    const visitors = await store.list({
      status: ['in', 'today', 'all'].includes(status) ? status : 'in',
      purpose,
      q,
      limit: url.searchParams.get('limit'),
    });
    return json({ visitors: visitors || [] });
  } catch (e) {
    console.error('visitors failed', e);
    return json({ error: 'server error' }, 500);
  }
};
