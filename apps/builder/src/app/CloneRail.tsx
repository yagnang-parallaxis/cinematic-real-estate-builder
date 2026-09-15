"use client";

import type { PrerequisiteItem, PrerequisiteStatus } from "@cinematic/schemas";
import { Button } from "@cinematic/ui";
import { useState } from "react";

import type { CloneSummary, CreateCloneBody } from "../lib/clone-api";
import { EDITOR_KEYS, editorLabel, type EditorKey } from "./editor-keys";
import { PrerequisitesPanel } from "./PrerequisitesPanel";
import { StatusMark } from "./StatusMark";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function NewCloneForm({ onCreate }: { onCreate: (body: CreateCloneBody) => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [template, setTemplate] = useState<CreateCloneBody["template"]>("aurelia");

  const effectiveSlug = slug.trim().length > 0 ? slug.trim() : slugify(name);

  return (
    <form
      className="bld-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (name.trim().length === 0 || effectiveSlug.length === 0) {
          return;
        }
        onCreate({ name: name.trim(), slug: effectiveSlug, template });
        setName("");
        setSlug("");
      }}
    >
      <div className="bld-field">
        <label className="bld-label" htmlFor="new-clone-name">
          New clone
        </label>
        <input
          id="new-clone-name"
          className="bld-input"
          type="text"
          placeholder="Project name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="bld-field">
        <label className="bld-label" htmlFor="new-clone-slug">
          Slug
        </label>
        <input
          id="new-clone-slug"
          className="bld-input"
          type="text"
          placeholder={effectiveSlug || "kebab-case"}
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        />
      </div>
      <div className="bld-field">
        <label className="bld-label" htmlFor="new-clone-template">
          Seed from
        </label>
        <select
          id="new-clone-template"
          className="bld-select"
          value={template}
          onChange={(event) => setTemplate(event.target.value as CreateCloneBody["template"])}
        >
          <option value="aurelia">Aurelia (full content)</option>
          <option value="blank">Blank (required fields empty)</option>
        </select>
      </div>
      <Button type="submit" size="sm" disabled={name.trim().length === 0}>
        Create clone
      </Button>
    </form>
  );
}

export function CloneRail({
  clones,
  activeSlug,
  onSelect,
  onCreate,
  prerequisites,
  editorKey,
  onEditorKey,
}: {
  clones: CloneSummary[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
  onCreate: (body: CreateCloneBody) => void;
  prerequisites: PrerequisiteItem[];
  editorKey: EditorKey;
  onEditorKey: (key: EditorKey) => void;
}) {
  /* One status per panel, so the section navigator carries the same marks. */
  const statusByKey = new Map<EditorKey, PrerequisiteStatus>(
    prerequisites
      .filter((item) => item.section)
      .map((item) => [item.section as EditorKey, item.status]),
  );

  return (
    <div className="bld-col">
      <div className="bld-head">
        <span className="bld-title">Clone suite</span>
        <span className="bld-eyebrow">{clones.length} clones</span>
      </div>

      <div className="bld-scroll">
        <div className="bld-group">
          <p className="bld-eyebrow bld-group-title">Clones</p>
          <div className="bld-list">
            {clones.map((clone) => (
              <button
                type="button"
                className="bld-nav-item"
                key={clone.meta.slug}
                aria-current={clone.meta.slug === activeSlug ? "true" : undefined}
                onClick={() => onSelect(clone.meta.slug)}
              >
                <span className="bld-prereq-label">{clone.meta.name}</span>
                <span className="bld-nav-meta">
                  {clone.prerequisites.complete}/{clone.prerequisites.total}
                </span>
              </button>
            ))}
            {clones.length === 0 ? (
              <p className="bld-note">No clones yet — run `pnpm seed:clone`.</p>
            ) : null}
          </div>
        </div>

        <NewCloneForm onCreate={onCreate} />

        <PrerequisitesPanel items={prerequisites} onJump={onEditorKey} />

        <div className="bld-group">
          <p className="bld-eyebrow bld-group-title">Sections</p>
          <div className="bld-list">
            {EDITOR_KEYS.map((key) => {
              const status = statusByKey.get(key);

              return (
                <button
                  type="button"
                  className="bld-nav-item"
                  key={key}
                  aria-current={key === editorKey ? "true" : undefined}
                  onClick={() => onEditorKey(key)}
                >
                  <span className="bld-prereq-label">{editorLabel(key)}</span>
                  {status ? <StatusMark status={status} /> : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
