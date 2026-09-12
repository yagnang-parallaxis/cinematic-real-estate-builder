export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="18.4" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="20" cy="20" r="15.6" stroke="currentColor" strokeWidth="0.35" />
      <path
        d="M20 8.6 28.2 31.2h-3.4l-1.7-5.1h-6.2l-1.7 5.1H12L20 8.6Zm-3.05 14.7h6.1L20 15.2l-3.05 8.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

const RING_TICKS = Array.from({ length: 48 }, (_, index) => {
  const angle = (index / 48) * Math.PI * 2;
  const outer = 58;
  const inner = index % 6 === 0 ? 50 : 53.5;
  const round = (value: number) => Number(value.toFixed(2));
  return {
    x1: round(60 + Math.cos(angle) * inner),
    y1: round(60 + Math.sin(angle) * inner),
    x2: round(60 + Math.cos(angle) * outer),
    y2: round(60 + Math.sin(angle) * outer),
  };
});

export function BrandRing({ className }: { className?: string }) {
  const ticks = RING_TICKS;

  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="46" stroke="currentColor" strokeWidth="0.4" />
      {ticks.map((tick) => (
        <line
          key={`${tick.x1}-${tick.y1}`}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke="currentColor"
          strokeWidth="0.7"
        />
      ))}
    </svg>
  );
}

export function ScrollChevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M0 6h40M34 1l7 5-7 5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
