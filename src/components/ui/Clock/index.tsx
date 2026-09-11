import React from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const hours = pad(time.getHours());
  const minutes = pad(time.getMinutes());
  const seconds = pad(time.getSeconds());
  const date = time.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-5 lg:gap-6 select-none">
      <span className="text-[clamp(2.4rem,4.4vw,6.5rem)] font-mono font-bold text-[#003B71] drop-shadow-sm tracking-wider">
        {hours}:{minutes}:{seconds}
      </span>
      <span className="text-[clamp(1.1rem,1.8vw,2.4rem)] text-slate-600 capitalize">
        {date}
      </span>
    </div>
  );
};

export default Clock;
