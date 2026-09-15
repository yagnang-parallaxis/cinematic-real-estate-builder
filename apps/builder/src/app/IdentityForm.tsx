"use client";

import type { IdentityConfig } from "@cinematic/schemas";

const FIELDS: { key: keyof IdentityConfig; label: string; placeholder: string }[] = [
  { key: "projectName", label: "Project name", placeholder: "Aurelia Residences" },
  { key: "brand", label: "Brand / wordmark", placeholder: "Aurelia" },
  { key: "place", label: "Place (script accent)", placeholder: "Harbor" },
  { key: "tagline", label: "Tagline", placeholder: "Eighteen residences above a quiet harbor." },
];

export function IdentityForm({
  identity,
  onChange,
}: {
  identity: IdentityConfig;
  onChange: (next: IdentityConfig) => void;
}) {
  return (
    <div className="bld-form">
      {FIELDS.map((field) => (
        <div className="bld-field" key={field.key}>
          <label className="bld-label" htmlFor={`identity-${field.key}`}>
            {field.label}
          </label>
          <input
            id={`identity-${field.key}`}
            className="bld-input"
            type="text"
            placeholder={field.placeholder}
            value={identity[field.key] ?? ""}
            onChange={(event) => onChange({ ...identity, [field.key]: event.target.value })}
          />
        </div>
      ))}
    </div>
  );
}
