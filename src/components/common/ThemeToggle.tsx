import React from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Icon } from '@/components/common/Icon';
import type { Theme } from '@/types/theme';

const THEME_ORDER: Theme[] = ['light', 'dark', 'amoled', 'midnight', 'minimal'];

const THEME_LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  amoled: 'AMOLED',
  midnight: 'Midnight',
  minimal: 'Minimal',
};

/** Simple theme toggle cycle button */
export const ThemeToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { settings, update } = useSettings();
  const theme = settings?.theme ?? 'dark';

  const cycleTheme = () => {
    const currentIdx = THEME_ORDER.indexOf(theme);
    const nextIdx = (currentIdx + 1) % THEME_ORDER.length;
    update({ theme: THEME_ORDER[nextIdx] });
  };

  const iconName =
    theme === 'light' ? 'sun' :
    theme === 'dark' ? 'moon' :
    theme === 'amoled' ? 'display' :
    theme === 'midnight' ? 'star' : 'filter';

  if (compact) {
    return (
      <button
        type="button"
        onClick={cycleTheme}
        className="nova-btn nova-btn-ghost nova-btn-square hover:bg-[hsl(var(--background-secondary))] transition-colors"
        title={`Theme: ${THEME_LABELS[theme]}. Click to cycle.`}
        aria-label="Cycle theme"
      >
        <Icon name={iconName} size={16} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="nova-btn nova-btn-ghost nova-btn-md"
      title={`Theme: ${THEME_LABELS[theme]}. Click to cycle.`}
      aria-label="Cycle theme"
    >
      <Icon name={iconName} size={14} />
      <span className="ml-1.5 text-sm">{THEME_LABELS[theme]}</span>
      <Icon name="chevron-down" size={12} className="ml-1 opacity-40" />
    </button>
  );
};
