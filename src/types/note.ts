/**
 * Note domain type.
 * Lightweight notes accessible from the Side Panel.
 */

import type { UUID, Timestamp } from './utils';

export interface Note {
  id: UUID;
  title: string;
  content: string;
  /** Optional workspace association */
  workspaceId: UUID | null;
  /** Pinned notes appear at the top */
  pinned: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
