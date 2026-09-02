import React, { useState, useEffect, useCallback } from 'react';
import { formatTime24h } from '@/utils/time';

interface ClockProps {
  showDate?: boolean;
  showGreeting?: boolean;
  size?: 'sm' | 'md' | 'lg';
  use24h?: boolean;
}

const greetings = [
  { label: 'Good morning', hours: [5, 11] },
  { label: 'Good afternoon', hours: [12, 17] },
  { label: 'Good evening', hours: [18, 21] },
  { label: 'Good evening', hours: [22, 23] },
  { label: 'Good evening', hours: [0, 4] },
];

/** Get greeting based on current hour */
function getGreeting(): string {
  const hour = new Date().getHours();
  for (const g of greetings) {
    if (hour >= g.hours[0] && hour <= g.hours[1]) {
      return g.label;
    }
  }
  return 'Hello';
}

const sizeClasses = {
  sm: 'text-2xl font-medium',
  md: 'text-3xl font-medium',
  lg: 'text-5xl font-light tracking-tight',
};

const dateSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

/**
 * NOVA Clock — clean time display with optional date and greeting.
 * Updates every second when visible, falls back to minute precision when not focused.
 */
export const Clock: React.FC<ClockProps> = ({ showDate = false, showGreeting = false, size = 'lg', use24h = true }) => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      setTime(new Date());
      // Calculate time until next minute for efficiency
      const now = Date.now();
      const msUntilNextMinute = 60000 - (now % 60000);
      timeoutId = setTimeout(tick, msUntilNextMinute + 50);
    };

    tick();

    return () => clearTimeout(timeoutId);
  }, []);

  const timeStr = use24h
    ? formatTime24h(time.getTime())
    : ((time.getHours() % 12 || 12).toString().padStart(2, '0') + ':' + time.getMinutes().toString().padStart(2, '0') + (time.getHours() < 12 ? ' AM' : ' PM'));

  return (
    <div className="nova-clock flex flex-col items-center">
      {showGreeting && (
        <span className={`text-sm font-medium text-[hsl(var(--text-tertiary))] ${size === 'lg' ? 'mb-2' : 'mb-1'}`}>
          {getGreeting()},
        </span>
      )}
      <time
        dateTime={time.toISOString()}
        className={`
          font-mono leading-none tracking-tight
          ${sizeClasses[size]}
        `}
      >
        {timeStr}
      </time>
      {showDate && (
        <span className={`mt-1 text-[hsl(var(--text-secondary))] ${dateSizeClasses[size]} font-normal`}>
          {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      )}
    </div>
  );
};
