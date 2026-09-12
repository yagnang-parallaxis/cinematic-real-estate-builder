export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <path
        d="M20 4L23 16L35 12L26 20L35 28L23 24L20 36L17 24L5 28L14 20L5 12L17 16L20 4Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="20" r="4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function BrandRing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className={className}>
      <circle
        cx="60"
        cy="60"
        r="56"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeDasharray="1 5"
      />
    </svg>
  );
}

export function ScrollChevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 24" fill="none" aria-hidden="true" className={className}>
      <path d="M2 2L8 8L14 2" stroke="currentColor" strokeWidth="1" />
      <path d="M2 14L8 20L14 14" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
