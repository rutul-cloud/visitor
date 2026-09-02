import { json, adminPin } from '../_lib/util.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);
  let b;
  try {
    b = await req.json();
  } catch {
    return json({ error: 'bad body' }, 400);
  }
  if (String(b.pin || '') === adminPin()) return json({ ok: true });
  return json({ error: 'bad pin' }, 401);
};
