const PIN_KEY = 'hv_pin';

export const getPin = () => {
  try {
    return localStorage.getItem(PIN_KEY) || '';
  } catch {
    return '';
  }
};
export const setPin = (p) => {
  try {
    localStorage.setItem(PIN_KEY, p);
  } catch {}
};
export const clearPin = () => {
  try {
    localStorage.removeItem(PIN_KEY);
  } catch {}
};

async function req(path, { method = 'GET', body, pinNeeded = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (pinNeeded) headers['X-Admin-Pin'] = getPin();
  const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 401) throw Object.assign(new Error('unauthorized'), { status: 401 });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'server error'), { status: res.status });
  return data;
}

export const getConfig = () => req('/api/config');
export const checkin = (d) => req('/api/checkin', { method: 'POST', body: d });
export const getVisitor = (code) => req(`/api/visitor?code=${encodeURIComponent(code)}`);
export const checkout = (code, type, geo) =>
  req('/api/checkout', { method: 'POST', body: { code, type, geo } });
export const listVisitors = (q = {}) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) if (v !== undefined && v !== null && v !== '') p.set(k, v);
  const s = p.toString();
  return req(`/api/visitors${s ? '?' + s : ''}`, { pinNeeded: true });
};
export const summary = () => req('/api/summary', { pinNeeded: true });

export function normalizePhone(raw) {
  return String(raw || '')
    .replace(/\D/g, '')
    .replace(/^(91|0)(?=\d{10}$)/, '');
}
