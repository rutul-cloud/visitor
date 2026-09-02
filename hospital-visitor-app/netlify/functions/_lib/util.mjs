export const json = (x, s = 200) =>
  new Response(JSON.stringify(x), {
    status: s,
    headers: { 'Content-Type': 'application/json' },
  });

export const PURPOSES = ['opd', 'ipd', 'office', 'other'];

export function adminPin() {
  return process.env.ADMIN_PIN || '1234';
}

export function normalizedPhone(raw) {
  return String(raw || '')
    .replace(/\D/g, '')
    .replace(/^(91|0)(?=\d{10}$)/, '');
}
