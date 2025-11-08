// src/lib/utils/hashIp.ts
import { createHash } from 'crypto';

export function hashIp(ip: string): string {
  if (!process.env.IP_HASH_PEPPER) {
    throw new Error('IP_HASH_PEPPER missing in environment');
  }

  // Normalize IPv4/IPv6
  const normalized = ip.trim().toLowerCase();
  const pepper = process.env.IP_HASH_PEPPER;

  return createHash('sha256')
    .update(normalized + pepper)
    .digest('hex');
}
