/**
 * QuickLink domain type.
 * User-defined links that appear in the side panel.
 */

import type { UUID, Timestamp } from './utils';

export interface QuickLink {
  id: UUID;
  name: string;
  url: string;
  /** Optional icon (emoji or URL) */
  icon?: string;
  /** Order index */
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
