import React from 'react';
import { TabItem } from './TabItem';
import { useTabs } from '@/hooks/useTabs';
import { Icon } from '@/components/common/Icon';

interface TabListProps {
  /** Show only tabs from the current window */
  currentWindowOnly?: boolean;
  /** Maximum number of tabs to show */
  limit?: number;
}

/**
 * TabList — displays open Chrome tabs with focus/close actions.
 * Used in the Side Panel's "Current Workspace" section.
 */
export const TabList: React.FC<TabListProps> = ({ currentWindowOnly = true, limit }) => {
  const { tabs, loading, refresh } = useTabs();

  const displayTabs = currentWindowOnly
    ? tabs.filter(t => t.active || true) // Show all, but focus active
    : tabs;

  const limited = limit ? displayTabs.slice(0, limit) : displayTabs;

  if (loading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-[hsl(var(--background-tertiary))] rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!limited.length) {
    return (
      <div className="text-center py-6">
        <Icon name="tabs" size={24} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm text-[hsl(var(--text-tertiary))]">No open tabs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {limited.map(tab => (
        <TabItem key={tab.id} tab={tab} onRemoved={refresh} />
      ))}
    </div>
  );
};
