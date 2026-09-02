/**
 * TabGroup — a Chrome tab group that NOVA can manage.
 * Used for grouping tabs within workspaces.
 */

import type { UUID, Timestamp } from './utils';

export interface TabGroup {
  id: UUID;
  /** Chrome tab group ID */
  groupId: number;
  /** Display name */
  name: string;
  /** Color of the group */
  color: string;
  /** Tab IDs in this group */
  tabIds: number[];
  /** Associated workspace */
  workspaceId: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
