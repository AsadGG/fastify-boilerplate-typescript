export function randomUuidV7() {
  const unixMs = BigInt(Date.now());

  const bytes = new Uint8Array(16);

  crypto.getRandomValues(bytes.subarray(6));

  bytes[0] = Number((unixMs >> 40n) & 0xFFn);
  bytes[1] = Number((unixMs >> 32n) & 0xFFn);
  bytes[2] = Number((unixMs >> 24n) & 0xFFn);
  bytes[3] = Number((unixMs >> 16n) & 0xFFn);
  bytes[4] = Number((unixMs >> 8n) & 0xFFn);
  bytes[5] = Number(unixMs & 0xFFn);
  bytes[6] = (bytes[6] & 0x0F) | 0x70;
  bytes[8] = (bytes[8] & 0x3F) | 0x80;

  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
