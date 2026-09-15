"use client";

import { useState } from "react";

/**
 * Structured fields exist for identity and theme. The section payloads keep
 * their section-library shapes, which are too varied for a generated form in the
 * MVP, so they are edited as JSON and only pushed once they parse.
 */
export function JsonEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const [text, setText] = useState(() => `${JSON.stringify(value, null, 2)}`);
  const [error, setError] = useState<string | null>(null);

  const edit = (next: string) => {
    setText(next);

    try {
      onChange(JSON.parse(next));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invalid JSON");
    }
  };

  return (
    <div className="bld-field">
      <label className="bld-label" htmlFor={`json-${label}`}>
        {label}
      </label>
      <textarea
        id={`json-${label}`}
        className="bld-textarea"
        spellCheck={false}
        aria-invalid={error !== null}
        value={text}
        onChange={(event) => edit(event.target.value)}
      />
      {error ? <p className="bld-error">{error}</p> : null}
    </div>
  );
}
