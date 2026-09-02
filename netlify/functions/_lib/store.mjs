// Supabase-backed data store used by all Netlify Functions.
// Talks to PostgREST directly (no SDK needed). Only used server-side;
// the service_role key never reaches any browser.
import crypto from 'node:crypto';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
const TIMEOUT_H = 3;
const RETENTION_D = 90;

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function genCode() {
  let c = '';
  for (let i = 0; i < 6; i++) c += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
  return c;
}

function headers(extra = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function req(path, { method = 'GET', body, prefer } = {}) {
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_KEY are not set');
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: headers(prefer ? { Prefer: prefer } : {}),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${text.slice(0, 300)}`);
  return data;
}

export const store = {
  async create(f) {
    for (let i = 0; i < 3; i++) {
      try {
        const rows = await req('visitors', {
          method: 'POST',
          body: { ...f, code: genCode() },
          prefer: 'return=representation',
        });
        return rows[0];
      } catch (e) {
        if (/duplicate|23505/i.test(String(e))) continue; // code collision, retry
        throw e;
      }
    }
    throw new Error('could not create visitor row');
  },

  async getByCode(code) {
    const rows = await req(
      `visitors?code=eq.${encodeURIComponent(String(code || '').toUpperCase())}&limit=1`
    );
    return rows?.[0] || null;
  },

  async checkout(code, type, geo) {
    const cur = await this.getByCode(code);
    if (!cur) return null;
    if (cur.checked_out_at) return cur;
    const t = ['manual', 'geofence', 'timeout'].includes(type) ? type : 'manual';
    try {
      const rows = await req(
        `visitors?or=(code.eq.${encodeURIComponent(String(code).toUpperCase())})&checked_out_at=is.null`,
        {
          method: 'PATCH',
          body: {
            checked_out_at: new Date().toISOString(),
            checkout_type: t,
            ...(geo && typeof geo.lat === 'number' ? { geo_lat: geo.lat, geo_lng: geo.lng } : {}),
          },
          prefer: 'return=representation',
        }
      );
      return rows?.[0] || cur;
    } catch {
      return cur;
    }
  },

  async list({ status, purpose, q, limit = 1000 }) {
    const p = {};
    if (status === 'in') p.checked_out_at = 'is.null';
    else if (status === 'today') {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      p.checked_in_at = `gte.${d.toISOString()}`;
    }
    if (purpose) p.purpose = `eq.${purpose}`;
    if (q) {
      const s = encodeURIComponent(String(q).trim());
      p.or = `(name.ilike.%${s}%,phone.ilike.%${s}%)`;
    }
    p.order = 'checked_in_at.desc';
    p.limit = String(Math.min(parseInt(limit, 10) || 1000, 2000));
    return req(`visitors?${new URLSearchParams(p).toString()}`);
  },

  async summary() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const gte = `gte.${d.toISOString()}`;
    const [todayRows, inNow] = await Promise.all([
      req(`visitors?checked_in_at=${encodeURIComponent(gte)}&select=checkout_type,checked_out_at,purpose&limit=5000`),
      req(`visitors?checked_out_at=is.null&select=id&limit=5000`),
    ]);
    const today = todayRows || [];
    return {
      in_now: (inNow || []).length,
      today_total: today.length,
      out_today: today.filter((r) => r.checked_out_at).length,
      auto_today: today.filter((r) =>
        ['geofence', 'timeout'].includes(r.checkout_type)
      ).length,
    };
  },

  // Called by the scheduled function every 10 minutes
  async sweep() {
    const t = new Date(Date.now() - TIMEOUT_H * 3600e3).toISOString();
    try {
      await req(`visitors?checked_out_at=is.null&checked_in_at=lt.${t}`, {
        method: 'PATCH',
        body: { checked_out_at: new Date().toISOString(), checkout_type: 'timeout' },
      });
    } catch {}
    const d90 = new Date(Date.now() - RETENTION_D * 86400e3).toISOString();
    const d30 = new Date(Date.now() - 30 * 86400e3).toISOString();
    try {
      await req(`visitors?checked_out_at=lt.${d90}`, { method: 'DELETE' });
    } catch {}
    try {
      // safety net: stale "in-house" rows older than 30 days
      await req(`visitors?or=(checked_out_at.is.null,checked_out_at=lt.${d30})&checked_in_at=lt.${d30}`, {
        method: 'DELETE',
      });
    } catch {}
    return { ok: true };
  },
};
