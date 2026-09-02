import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'nova_focus_mode';

/**
 * Hook: Focus Mode state.
 * Persists to storage and broadcasts changes across windows via storage events.
 */
export function useFocusMode() {
  const [active, setActive] = useState(false);

  // Load on mount
  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY]).then(result => {
      setActive(result[STORAGE_KEY] ?? false);
    });

    // Listen for changes from other windows
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes[STORAGE_KEY]) {
        setActive(changes[STORAGE_KEY].newValue ?? false);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const toggle = useCallback(async () => {
    const next = !active;
    await chrome.storage.local.set({ [STORAGE_KEY]: next });
    setActive(next);
  }, [active]);

  const enter = useCallback(async () => {
    await chrome.storage.local.set({ [STORAGE_KEY]: true });
    setActive(true);
  }, []);

  const exit = useCallback(async () => {
    await chrome.storage.local.set({ [STORAGE_KEY]: false });
    setActive(false);
  }, []);

  return { active, toggle, enter, exit };
}
