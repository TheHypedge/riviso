import * as crypto from 'crypto';

const SEP = '|';
const TTL_MS = 10 * 60 * 1000; // 10 minutes

function b64uEnc(s: string): string {
  return Buffer.from(s, 'utf8').toString('base64url');
}

function b64uDec(s: string): string {
  return Buffer.from(s, 'base64url').toString('utf8');
}

/**
 * Sign OAuth state: userId|websiteUrl|ts|hmac.
 * Verify on callback to prevent CSRF; state is short-lived.
 */
export function signGscState(
  userId: string,
  websiteUrl: string,
  secret: string,
): string {
  const ts = Date.now().toString(10);
  const payload = [userId, websiteUrl, ts].join(SEP);
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return [b64uEnc(userId), b64uEnc(websiteUrl), b64uEnc(ts), hmac].join(SEP);
}

export interface VerifiedGscState {
  userId: string;
  websiteUrl: string;
}

export function verifyGscState(state: string, secret: string): VerifiedGscState | null {
  try {
    const parts = state.split(SEP);
    if (parts.length !== 4) return null;
    const [userIdB, websiteUrlB, tsB, hmac] = parts;
    const userId = b64uDec(userIdB);
    const websiteUrl = b64uDec(websiteUrlB);
    const tsStr = b64uDec(tsB);
    const payload = [userId, websiteUrl, tsStr].join(SEP);
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const a = Buffer.from(hmac, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const ts = parseInt(tsStr, 10);
    if (Number.isNaN(ts) || Date.now() - ts > TTL_MS) return null;
    return { userId, websiteUrl };
  } catch {
    return null;
  }
}
