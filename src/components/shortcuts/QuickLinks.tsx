import React from 'react';
import { QuickLinkItem } from './QuickLinkItem';
import { useQuickLinks } from '@/hooks/useQuickLinks';

interface QuickLinksProps {
  limit?: number;
  columns?: number;
  showLabel?: boolean;
}

/**
 * QuickLinks — a grid of user-defined bookmark-style links.
 * Falls back to default links (GitHub, YouTube, Gmail, etc.) on first run.
 */
export const QuickLinks: React.FC<QuickLinksProps> = ({ limit, columns = 4, showLabel = true }) => {
  const { links, loading } = useQuickLinks();

  const displayLinks = limit ? links.slice(0, limit) : links;

  if (loading) {
    return <QuickLinksSkeleton columns={columns} />;
  }

  if (!displayLinks.length) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-[hsl(var(--text-tertiary))]">No quick links yet.</p>
      </div>
    );
  }

  const gridCols = `grid-cols-${columns}`;

  return (
    <div className={`grid ${gridCols} gap-2 sm:gap-3 max-w-2xl mx-auto`}>
      {displayLinks.map(link => (
        <QuickLinkItem
          key={link.id}
          link={link}
          showLabel={showLabel}
        />
      ))}
    </div>
  );
};

function QuickLinksSkeleton({ columns }: { columns: number }) {
  return (
    <div className={`grid grid-cols-${columns} gap-2 sm:gap-3 max-w-2xl mx-auto`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-12 bg-[hsl(var(--background-tertiary))] rounded-xl animate-pulse" />
      ))}
    </div>
  );
}
