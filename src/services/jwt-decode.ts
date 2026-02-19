/**
 * Lightweight JWT decode (no validation — that's the server's job).
 * Only decodes the payload for extracting user claims.
 */
interface JwtPayload {
  sub?: string;
  preferred_username?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles: string[] };
  resource_access?: Record<string, { roles: string[] }>;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export function jwtDecode(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT token');
  }

  const payload = parts[1];
  const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
  const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(decoded);
}
