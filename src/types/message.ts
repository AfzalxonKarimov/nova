/**
 * Message types for communication between the background script,
 * new tab page, side panel, popup, and options page.
 */

export type MessageAction =
  | 'open-command-palette'
  | 'execute-command'
  | 'get-active-tab'
  | 'get-all-tabs'
  | 'save-current-page'
  | 'toggle-side-panel'
  | 'toggle-focus-mode'
  | 'workspace-changed'
  | 'saved-changed'
  | 'settings-changed'
  | 'navigate'
  | 'search'
  | 'get-recent-tabs';

export interface NovaMessage {
  action: MessageAction;
  payload?: unknown;
}

export interface MessageResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}
