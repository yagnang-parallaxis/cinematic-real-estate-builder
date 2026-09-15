"use client";

import { Button } from "@cinematic/ui";
import type { RefObject } from "react";

import { previewUrl } from "../lib/clone-api";

const PATHS = [
  { value: "/", label: "Home" },
  { value: "/residences", label: "Residences" },
];

export function PreviewFrame({
  slug,
  path,
  onPath,
  frameRef,
  reloadToken,
  onReload,
}: {
  slug: string | null;
  path: string;
  onPath: (path: string) => void;
  frameRef: RefObject<HTMLIFrameElement | null>;
  reloadToken: number;
  onReload: () => void;
}) {
  const src = slug ? previewUrl(slug, path) : null;

  return (
    <div className="bld-col">
      <div className="bld-preview-bar">
        <select
          className="bld-select"
          style={{ width: "auto" }}
          aria-label="Preview route"
          value={path}
          onChange={(event) => onPath(event.target.value)}
        >
          {PATHS.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="bld-preview-url">{src ?? "No clone selected"}</span>
        <Button type="button" variant="outline" size="sm" onClick={onReload} disabled={!src}>
          Reload
        </Button>
      </div>
      {src ? (
        /* Remounting on the token is the soft reload: the bridge re-announces itself. */
        <iframe
          key={`${src}-${reloadToken}`}
          ref={frameRef}
          className="bld-preview"
          src={src}
          title="Site preview"
        />
      ) : (
        <p className="bld-note">Select a clone to preview it.</p>
      )}
    </div>
  );
}
