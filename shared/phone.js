export function normalizeIndianMobile(value) {
  const compact = String(value || '').trim().replace(/[\s()-]/g, '');
  const nationalNumber = compact.startsWith('+91')
    ? compact.slice(3)
    : compact.startsWith('91') && compact.length === 12
      ? compact.slice(2)
      : compact;

  if (!/^[6-9]\d{9}$/.test(nationalNumber)) return null;
  return `+91${nationalNumber}`;
}