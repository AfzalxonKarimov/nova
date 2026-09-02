/**
 * SavedPage domain type.
 * Represents a page the user has explicitly saved for later return,
 * independent of (but optionally associated with) a workspace.
 */

import type { UUID, Timestamp } from './utils';

export interface SavedPage {
  /** Unique identifier */
  id: UUID;
  /** Page URL */
  url: string;
  /** Page title */
  title: string;
  /** Favicon URL, if available */
  favicon?: string;
  /** Associated workspace (null = global saved) */
  workspaceId: UUID | null;
  /** Optional user note */
  note?: string;
  /** Tags for organization */
  tags: string[];
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last updated timestamp */
  updatedAt: Timestamp;
}
