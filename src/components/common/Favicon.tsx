import React, { useState } from 'react';
import { getGoogleFavicon } from '@/utils/url';

interface FaviconProps {
  url?: string;
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Favicon component.
 * Tries the URL's own favicon, falls back to Google's favicon service,
 * and finally to a generic icon.
 */
export const Favicon: React.FC<FaviconProps> = ({ url, size = 16, className, fallback }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!url) {
    return fallback ?? <DefaultFavicon size={size} className={className} />;
  }

  // Try to extract favicon from the page URL itself (chrome://favicon)
  let faviconUrl: string;
  try {
    const parsed = new URL(url);
    faviconUrl = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=${size}`;
  } catch {
    faviconUrl = getGoogleFavicon(url) ?? '';
  }

  if (error || !faviconUrl) {
    return fallback ?? <DefaultFavicon size={size} className={className} />;
  }

  return (
    <img
      src={faviconUrl}
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0 }}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
};

function DefaultFavicon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '4px',
        background: 'hsl(var(--background-tertiary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="currentColor" opacity={0.4}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
      </svg>
    </div>
  );
}
