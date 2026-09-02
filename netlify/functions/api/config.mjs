import { json } from '../_lib/util.mjs';

export default async (req) => {
  if (req.method !== 'GET') return json({ error: 'method not allowed' }, 405);
  return json({
    hospitalName: process.env.HOSPITAL_NAME || 'Your Hospital Name, Ahmedabad',
    lat: parseFloat(process.env.HOSP_LAT || '23.0225'),
    lng: parseFloat(process.env.HOSP_LNG || '72.5714'),
    radiusM: parseInt(process.env.HOSP_RADIUS || '100', 10),
    timeoutHours: 3,
  });
};
