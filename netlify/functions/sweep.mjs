// Scheduled function (every 10 min, see netlify.toml):
//  - auto check-out anyone still "in" after 3 hours
//  - delete checked-out records older than 90 days
//  - delete stale in-house rows older than 30 days
import { store } from './_lib/store.mjs';
import { json } from './_lib/util.mjs';

export default async () => {
  try {
    return json(await store.sweep());
  } catch (e) {
    console.error('sweep failed', e);
    return json({ error: String(e) }, 500);
  }
};
