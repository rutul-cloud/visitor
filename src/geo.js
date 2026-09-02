// Distance between two GPS points, in metres
export function haversineM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toR = (x) => (x * Math.PI) / 180;
  const dLat = toR(lat2 - lat1);
  const dLng = toR(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}
