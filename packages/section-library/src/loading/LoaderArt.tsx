export function LoaderFrame({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <path d="M1 12V1H12" stroke="currentColor" strokeWidth="0.75" />
      <path d="M39 12V1H28" stroke="currentColor" strokeWidth="0.75" />
      <path d="M1 28V39H12" stroke="currentColor" strokeWidth="0.75" />
      <path d="M39 28V39H28" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}

export function LoaderArch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMax slice" aria-hidden="true" className={className}>
      <path
        d="M0 100V60C0 26.8629 26.8629 0 60 0H140C173.137 0 200 26.8629 200 60V100"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
      />
    </svg>
  );
}
