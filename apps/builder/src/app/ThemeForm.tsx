"use client";

import type { ThemeConfig } from "@cinematic/schemas";

import { cssColorToHex } from "../lib/color";

const FIELDS: { key: keyof ThemeConfig; label: string; required: boolean }[] = [
  { key: "paper", label: "Paper (background)", required: true },
  { key: "paperDeep", label: "Paper deep", required: false },
  { key: "ink", label: "Ink (foreground)", required: true },
  { key: "inkDeep", label: "Ink deep", required: false },
  { key: "primary", label: "Primary", required: true },
  { key: "primaryForeground", label: "Primary foreground", required: true },
  { key: "tide", label: "Tide accent", required: false },
  { key: "shell", label: "Shell accent", required: false },
];

/**
 * Colours are written as CSS, so the template's `oklch()` palette survives a
 * round-trip; the picker is a convenience that writes hex.
 */
export function ThemeForm({
  theme,
  onChange,
}: {
  theme: ThemeConfig;
  onChange: (next: ThemeConfig) => void;
}) {
  const set = (key: keyof ThemeConfig, value: string, required: boolean) => {
    const next = { ...theme };

    if (!required && value.trim().length === 0) {
      delete next[key];
    } else {
      next[key] = value;
    }

    onChange(next);
  };

  return (
    <div className="bld-form">
      {FIELDS.map((field) => {
        const value = theme[field.key] ?? "";

        return (
          <div className="bld-field" key={field.key}>
            <label className="bld-label" htmlFor={`theme-${field.key}`}>
              {field.label}
              {field.required ? "" : " (optional)"}
            </label>
            <div className="bld-colour">
              <input
                className="bld-swatch"
                type="color"
                aria-label={`${field.label} colour picker`}
                value={cssColorToHex(value)}
                onChange={(event) => set(field.key, event.target.value, field.required)}
              />
              <input
                id={`theme-${field.key}`}
                className="bld-input"
                type="text"
                spellCheck={false}
                placeholder="oklch(0.945 0.016 88)"
                value={value}
                onChange={(event) => set(field.key, event.target.value, field.required)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
