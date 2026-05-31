import crypto from 'crypto';

const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let cachedCerts: Record<string, string> | null = null;
let certsExpiry = 0;

async function getGoogleCerts(): Promise<Record<string, string>> {
  if (cachedCerts && Date.now() < certsExpiry) {
    return cachedCerts;
  }

  const res = await fetch(GOOGLE_CERTS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch Google certs: ${res.status}`);
  }

  const certs = await res.json();

  const cacheControl = res.headers.get('cache-control');
  const maxAgeMatch = cacheControl?.match(/max-age=(\d+)/);
  certsExpiry =
    Date.now() + (maxAgeMatch ? parseInt(maxAgeMatch[1]) * 1000 : 3600000);
  cachedCerts = certs;

  return certs;
}

function base64UrlDecode(str: string): Buffer {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(padded, 'base64');
}

function decodeJwtPart(part: string): any {
  return JSON.parse(base64UrlDecode(part).toString('utf-8'));
}

/**
 * Verifies a Firebase ID token using Google's public certificates.
 * Uses Node.js built-in crypto — no external dependencies required.
 */
export async function verifyFirebaseToken(
  token: string,
  projectId: string
): Promise<{ uid: string; email?: string } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const header = decodeJwtPart(parts[0]);
    const payload = decodeJwtPart(parts[1]);

    // Verify algorithm
    if (header.alg !== 'RS256') return null;

    // Verify claims
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) return null;
    if (!payload.iat || payload.iat > now + 300) return null;
    if (payload.iss !== `https://securetoken.google.com/${projectId}`)
      return null;
    if (payload.aud !== projectId) return null;
    if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.length === 0)
      return null;

    // Verify signature using Google's public certificates
    const certs = await getGoogleCerts();
    const cert = certs[header.kid];
    if (!cert) return null;

    const signatureInput = `${parts[0]}.${parts[1]}`;
    const signature = base64UrlDecode(parts[2]);

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(signatureInput);
    const isValid = verifier.verify(cert, signature);

    if (!isValid) return null;

    return { uid: payload.sub, email: payload.email };
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return null;
  }
}
