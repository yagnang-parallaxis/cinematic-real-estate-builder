import type { PrerequisiteStatus } from "@cinematic/schemas";

const MARKS: Record<PrerequisiteStatus, { glyph: string; label: string }> = {
  complete: { glyph: "✓", label: "Complete" },
  partial: { glyph: "!", label: "Partial" },
  missing: { glyph: "✕", label: "Missing" },
};

export function StatusMark({ status }: { status: PrerequisiteStatus }) {
  const mark = MARKS[status];

  return (
    <span className="bld-status" data-status={status} role="img" aria-label={mark.label}>
      {mark.glyph}
    </span>
  );
}
