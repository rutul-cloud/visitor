// Local dev / preview server.
// Serves the built app (dist/) + the same /api/* endpoints that the
// Netlify Functions expose, backed by a local JSON file instead of Supabase.
// Usage: npm run build && npm start   (port 8787, PIN from ADMIN_PIN or 1234)
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const PORT = process.env.PORT || 8787;

// ---- configuration (same env vars as Netlify) ----
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';
const HOSPITAL_NAME = process.env.HOSPITAL_NAME || 'Your Hospital Name, Ahmedabad';
const LAT = parseFloat(process.env.HOSP_LAT || '23.0225');
const LNG = parseFloat(process.env.HOSP_LNG || '72.5714');
const RADIUS = parseInt(process.env.HOSP_RADIUS || '100', 10);
const TIMEOUT_H = 3;      // auto check-out after 3 hours
const RETENTION_D = 90;   // delete checked-out records after 90 days

// ---- tiny JSON-file store ----
let rows = [];
if (fs.existsSync(DATA_FILE)) {
  try {
    rows = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {}
}
function save() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 1));
  } catch (e) {
    console.error('save failed', e.message);
  }
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function genCode() {
  let c;
  do {
    c = '';
    for (let i = 0; i < 6; i++) c += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
  } while (rows.some((r) => r.code === c));
  return c;
}

const PURPOSES = ['opd', 'ipd', 'office', 'other'];
const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
function normalizeType(t) {
  return ['manual', 'geofence', 'timeout'].includes(t) ? t : 'manual';
}
function filterRows({ status, purpose, q }) {
  let out = rows;
  const ts = todayStart();
  if (status === 'in') out = out.filter((r) => !r.checked_out_at);
  else if (status === 'today') out = out.filter((r) => new Date(r.checked_in_at) >= ts);
  if (purpose) out = out.filter((r) => r.purpose === purpose);
  if (q) {
    const s = String(q).trim().toLowerCase();
    const digits = s.replace(/\D/g, '');
    out = out.filter(
      (r) => r.name.toLowerCase().includes(s) || (digits.length >= 3 && r.phone.includes(digits))
    );
  }
  return out.slice().sort((a, b) => new Date(b.checked_in_at) - new Date(a.checked_in_at));
}
function summaryRows() {
  const ts = todayStart();
  const today = rows.filter((r) => new Date(r.checked_in_at) >= ts);
  return {
    in_now: rows.filter((r) => !r.checked_out_at).length,
    today_total: today.length,
    out_today: today.filter((r) => r.checked_out_at).length,
    auto_today: today.filter(
      (r) => r.checked_out_at && ['geofence', 'timeout'].includes(r.checkout_type)
    ).length,
  };
}
function sweep() {
  const now = Date.now();
  let timedOut = 0;
  for (const r of rows) {
    if (!r.checked_out_at && now - new Date(r.checked_in_at).getTime() > TIMEOUT_H * 3600e3) {
      r.checked_out_at = new Date().toISOString();
      r.checkout_type = 'timeout';
      timedOut++;
    }
  }
  let purged = 0;
  rows = rows.filter((r) => {
    if (r.checked_out_at && now - new Date(r.checked_out_at).getTime() > RETENTION_D * 86400e3) {
      purged++;
      return false;
    }
    if (!r.checked_out_at && now - new Date(r.checked_in_at).getTime() > 30 * 86400e3) {
      purged++;
      return false;
    }
    return true;
  });
  if (timedOut || purged) {
    save();
    console.log(`sweep: timedOut=${timedOut} purged=${purged}`);
  }
}
setInterval(sweep, 60e3);

// ---- app ----
const app = express();
app.use(express.json());

app.get('/api/config', (req, res) =>
  res.json({ hospitalName: HOSPITAL_NAME, lat: LAT, lng: LNG, radiusM: RADIUS, timeoutHours: TIMEOUT_H })
);

app.post('/api/pin-check', (req, res) => {
  const pin = String((req.body || {}).pin || '');
  if (pin === ADMIN_PIN) res.json({ ok: true });
  else res.status(401).json({ error: 'bad pin' });
});

app.post('/api/checkin', (req, res) => {
  const b = req.body || {};
  const name = String(b.name || '').trim();
  let phone = String(b.phone || '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  if (name.length < 2 || name.length > 80) return res.status(400).json({ error: 'bad name' });
  if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ error: 'bad phone' });
  if (!PURPOSES.includes(b.purpose)) return res.status(400).json({ error: 'bad purpose' });
  if (!b.consent) return res.status(400).json({ error: 'consent required' });
  const v = {
    id: crypto.randomUUID(),
    code: genCode(),
    name,
    phone,
    purpose: b.purpose,
    patient_name: String(b.patientName || '').slice(0, 80),
    appointment_no: String(b.appointmentNo || '').slice(0, 40),
    ward_bed: String(b.wardBed || '').slice(0, 40),
    department: String(b.department || '').slice(0, 80),
    consent: true,
    mode: b.mode === 'staff' ? 'staff' : 'self',
    checked_in_at: new Date().toISOString(),
    checked_out_at: null,
    checkout_type: null,
    geo_lat: null,
    geo_lng: null,
  };
  rows.push(v);
  save();
  res.status(201).json(v);
});

app.get('/api/visitor', (req, res) => {
  const v = rows.find((r) => r.code === String(req.query.code || '').toUpperCase());
  if (!v) return res.status(404).json({ error: 'not found' });
  res.json(v);
});

app.post('/api/checkout', (req, res) => {
  const b = req.body || {};
  const v = rows.find((r) => r.code === String(b.code || '').toUpperCase());
  if (!v) return res.status(404).json({ error: 'not found' });
  if (v.checked_out_at) return res.json({ ok: true, visitor: v });
  v.checked_out_at = new Date().toISOString();
  v.checkout_type = normalizeType(b.type);
  if (b.geo && typeof b.geo.lat === 'number') {
    v.geo_lat = b.geo.lat;
    v.geo_lng = b.geo.lng;
  }
  save();
  res.json({ ok: true, visitor: v });
});

function guard(req, res) {
  if (String(req.get('x-admin-pin') || '') !== ADMIN_PIN) {
    res.status(401).json({ error: 'unauthorized' });
    return false;
  }
  return true;
}

app.get('/api/visitors', (req, res) => {
  if (!guard(req, res)) return;
  const { status, purpose, q } = req.query;
  const limit = parseInt(req.query.limit || '1000', 10);
  res.json({ visitors: filterRows({ status, purpose, q }).slice(0, limit) });
});

app.get('/api/summary', (req, res) => {
  if (!guard(req, res)) return;
  res.json(summaryRows());
});

// static app + SPA fallback
app.use('/api', (req, res) => res.status(404).json({ error: 'not found' }));
app.use(express.static(path.join(ROOT, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(ROOT, 'dist', 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Hospital Visitor app: http://0.0.0.0:${PORT}  (admin PIN: ${ADMIN_PIN})`);
});
