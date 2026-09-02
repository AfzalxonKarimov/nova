/**
 * React hooks for NOVA's data layer.
 * These hooks subscribe components to storage changes and provide
 * loading/error states with automatic reactivity.
 */

import { useEffect, useState, useCallback } from 'react';
import type { Settings } from '@/types/settings';
import {
  loadSettings,
  saveSettings,
  updateSettings,
  updateNestedSetting,
  initializeSettings,
  onSettingsChange,
  applyTheme,
  applyDensity,
} from '@/services/settings';

/**
 * Hook: current settings + loading state.
 * Subscribes to settings changes across windows.
 */
export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    loadSettings().then(s => {
      if (mounted) {
        setSettings(s);
        setLoading(false);
      }
    });

    const unsubscribe = onSettingsChange(newSettings => {
      if (mounted) {
        setSettings({ ...newSettings });
        applyTheme(newSettings.theme, newSettings.accent);
        applyDensity(newSettings.density);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const update = useCallback(async (patch: Partial<Settings>) => {
    const current = settings ?? (await loadSettings());
    const next = { ...current, ...patch };
    await saveSettings(next);
  }, [settings]);

  const save = useCallback(async (newSettings: Settings) => {
    await saveSettings(newSettings);
  }, []);

  const updateNested = useCallback(
    async <K extends keyof Settings, P extends keyof Settings[K]>(parent: K, key: P, value: Settings[K][P]) => {
      return updateNestedSetting(parent, key, value);
    },
    [],
  );

  return {
    settings,
    loading,
    update,
    save,
    updateNested,
  };
}

/**
 * Hook: initialize settings on app mount (applies theme, density, etc.)
 */
export function useInitializeSettings() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeSettings().then(() => setInitialized(true));
  }, []);

  return initialized;
}
