const ENCRYPTION_KEY_RAW = 'LendSwift-AES256-GCM-Key-2026!!';

async function getKey() {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(ENCRYPTION_KEY_RAW), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode('lendswift-salt'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

export async function encryptData(data) {
  try {
    const key = await getKey();
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(data))
    );
    const buf = new Uint8Array(iv.length + encrypted.byteLength);
    buf.set(iv, 0);
    buf.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...buf));
  } catch {
    return btoa(JSON.stringify(data)); // fallback
  }
}

export async function decryptData(ciphertext) {
  try {
    const key = await getKey();
    const buf = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const iv = buf.slice(0, 12);
    const data = buf.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch {
    try { return JSON.parse(atob(ciphertext)); } catch { return null; }
  }
}
