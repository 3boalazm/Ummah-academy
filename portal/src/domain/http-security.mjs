/** Environment-aware security attributes for the operations portal session cookie. */
export function sessionCookie(token, maxAge = 12 * 60 * 60, { production = false } = {}) {
  const attributes = ['HttpOnly', 'SameSite=Lax', 'Path=/', `Max-Age=${maxAge}`];
  if (production) attributes.push('Secure');
  return `ua_portal=${token}; ${attributes.join('; ')}`;
}
