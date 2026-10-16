import { randomBytes } from 'node:crypto';

export function id(prefix) {
  return `${prefix}_${randomBytes(4).toString('hex')}`;
}
