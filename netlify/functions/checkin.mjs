import { store } from './_lib/store.mjs';
import { json, PURPOSES, normalizedPhone } from './_lib/util.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);
  let b;
  try {
    b = await req.json();
  } catch {
    return json({ error: 'bad body' }, 400);
  }
  const name = String(b.name || '').trim();
  const phone = normalizedPhone(b.phone);
  if (name.length < 2 || name.length > 80) return json({ error: 'bad name' }, 400);
  if (!/^[6-9]\d{9}$/.test(phone)) return json({ error: 'bad phone' }, 400);
  if (!PURPOSES.includes(b.purpose)) return json({ error: 'bad purpose' }, 400);
  if (!b.consent) return json({ error: 'consent required' }, 400);

  try {
    const v = await store.create({
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
    });
    return json(v, 201);
  } catch (e) {
    console.error('checkin failed', e);
    return json({ error: 'server error' }, 500);
  }
};
