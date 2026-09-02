import React from 'react';

interface GreetingProps {
  customGreeting?: string;
  showDate?: boolean;
}

const greetings = [
  { label: 'Good morning', hours: [5, 11] },
  { label: 'Good afternoon', hours: [12, 17] },
  { label: 'Good evening', hours: [18, 21] },
  { label: 'Good night', hours: [22, 23] },
  { label: 'Good night', hours: [0, 4] },
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

/** NOVA Greeting — time-of-day based welcome message */
export const Greeting: React.FC<GreetingProps> = ({ customGreeting, showDate = false }) => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const greeting = customGreeting ?? getGreeting();

  if (showDate) {
    return (
      <div className="nova-greeting">
        <span className="text-sm font-medium text-[hsl(var(--text-secondary))]">
          {greeting}, {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>
    );
  }

  return (
    <span className="text-sm font-medium text-[hsl(var(--text-secondary))]">
      {greeting}
    </span>
  );
};
