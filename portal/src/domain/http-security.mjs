/** Environment-aware security attributes for the operations portal session cookie. */
export function sessionCookie(token, maxAge = 12 * 60 * 60, { production = false } = {}) {
  const attributes = ['HttpOnly', 'SameSite=Lax', 'Path=/', `Max-Age=${maxAge}`];
  if (production) attributes.push('Secure');
  return `ua_portal=${token}; ${attributes.join('; ')}`;
}

/**
 * Response headers for every portal response. Production is strict: nothing but this origin,
 * no framing, no inline script. Development keeps framing open so the preview host can embed it.
 * `style-src 'unsafe-inline'` is deliberate: the views use style attributes, and no script is inline.
 */
export function securityHeaders({ production = false } = {}) {
  const base = {
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
  };
  if (!production) return base;
  return {
    ...base,
    'x-frame-options': 'DENY',
    'strict-transport-security': 'max-age=31536000',
    'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  };
}
