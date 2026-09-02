/**
 * UUID generation utility.
 * Uses the native crypto API when available, falls back to a simple implementation.
 */

import type { UUID } from '@/types/utils';

let IdCounter = 0;

/** Generate a UUID v4-style string */
export function uuid(): UUID {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID() as UUID;
  }
  // Fallback
  const timestamp = Date.now().toString(16);
  const counter = (IdCounter++).toString(16).padStart(4, '0');
  const random = Math.random().toString(16).slice(2, 10);
  return `00000000-0000-4000-8000-${timestamp.slice(-8)}${counter}${random.slice(0, 4)}` as UUID;
}

/** Generate a short ID for temporary use */
export function shortId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Generate a short ID and cast to UUID */
export function shortUUID(): UUID {
  return shortId() as UUID;
}
