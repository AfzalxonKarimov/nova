/**
 * History entry type for the NOVA search/history interface.
 */

import type { Timestamp } from './utils';

export interface HistoryEntry {
  /** Chrome history URL */
  url: string;
  /** Page title */
  title: string;
  /** Last visited timestamp */
  lastVisitTime: Timestamp;
  /** Favicon if available */
  favicons?: string[];
}
