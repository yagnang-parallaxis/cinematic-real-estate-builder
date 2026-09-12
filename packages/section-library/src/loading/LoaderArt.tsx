export function LoaderArch({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 560 720"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M80 720 V280 C80 140 190 40 280 40 S480 140 480 280 V720"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M150 720 V320 C150 200 210 110 280 110 S410 200 410 320 V720"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path d="M80 280 H480 M150 320 H410 M280 40 V720" stroke="currentColor" strokeWidth="1" />
      <path d="M215 720 V380 C215 300 245 250 280 250 S345 300 345 380 V720" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function LoaderFrame({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <span className="loader-frame-edge loader-frame-l" />
      <span className="loader-frame-edge loader-frame-r" />
      <span className="loader-frame-edge loader-frame-t" />
      <span className="loader-frame-edge loader-frame-b" />
    </div>
  );
}
