import React, { useState } from 'react';
import { Favicon } from '@/components/common/Favicon';
import type { QuickLink } from '@/types/quicklink';
import { getHostname } from '@/utils/url';

interface QuickLinkItemProps {
  link: QuickLink;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CONFIG = {
  sm: { button: 'w-10 h-10', gap: 'gap-1', text: 'text-xs', icon: 'text-lg' },
  md: { button: 'w-14 h-14', gap: 'gap-2', text: 'text-sm', icon: 'text-xl' },
  lg: { button: 'w-16 h-16', gap: 'gap-2', text: 'text-base', icon: 'text-2xl' },
};

/**
 * QuickLinkItem — a single bookmark-style link in the new tab grid.
 * Premium card with subtle hover lift, border accent on hover,
 * and external-link hint.
 */
export const QuickLinkItem: React.FC<QuickLinkItemProps> = ({ link, showLabel = true, size = 'md' }) => {
  const [loaded, setLoaded] = useState(false);
  const config = SIZE_CONFIG[size];
  const domain = getHostname(link.url).replace(/^www\./, '');

  return (
    <a
      href={link.url}
      onClick={e => {
        e.preventDefault();
        chrome.tabs.create({ url: link.url });
      }}
      className={`
        relative flex flex-col items-center justify-center
        ${config.button} ${config.gap}
        rounded-xl
        bg-[hsl(var(--surface))]
        border border-[hsl(var(--border))]
        hover:border-[hsl(var(--accent))]/30
        hover:bg-[hsl(var(--surface-hover))]
        hover:translate-y-[-1px]
        transition-all duration-200 ease-out
        group
        ${showLabel ? 'rounded-b-none' : ''}
      `}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Icon / Favicon */}
      <div className="flex items-center justify-center w-full h-full">
        {link.icon ? (
          <span className={config.icon}>{link.icon}</span>
        ) : (
          <Favicon url={link.url} size={size === 'lg' ? 24 : size === 'sm' ? 16 : 20} />
        )}
      </div>

      {showLabel && (
        <div
          className={`
            w-full text-center
            ${config.text} font-medium
            text-[hsl(var(--text-secondary))]
            group-hover:text-[hsl(var(--text-primary))]
            truncate max-w-full
            pb-1
          `}
          title={link.name || domain}
        >
          {link.name || domain}
        </div>
      )}

      {/* Subtle external-link hint */}
      <kbd
        className={`
          absolute top-1 right-1 opacity-0
          group-hover:opacity-60
          text-[9px]
          text-[hsl(var(--text-tertiary))]
          bg-[hsl(var(--background-tertiary))]
          px-0.5 py-0.25 rounded
          transition-all duration-200
        `}
      >
        ↗
      </kbd>
    </a>
  );
};
