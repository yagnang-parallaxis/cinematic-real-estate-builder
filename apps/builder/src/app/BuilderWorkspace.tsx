"use client";

import type { CloneConfig, PrerequisiteItem } from "@cinematic/schemas";
import { Button } from "@cinematic/ui";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  createClone,
  downloadExport,
  getClone,
  getPrerequisites,
  listClones,
  putClone,
  type CloneSummary,
  type CreateCloneBody,
} from "../lib/clone-api";
import { CloneRail } from "./CloneRail";
import { editorLabel, type EditorKey } from "./editor-keys";
import { IdentityForm } from "./IdentityForm";
import { JsonEditor } from "./JsonEditor";
import { PreviewFrame } from "./PreviewFrame";
import { ThemeForm } from "./ThemeForm";

const SAVE_DEBOUNCE_MS = 300;
const PREVIEW_MESSAGE = "cinematic:preview";
const PREVIEW_READY_MESSAGE = "cinematic:preview-ready";
const TEMPLATE_SLUG = "aurelia";

type SaveState = "idle" | "saving" | "saved" | "error";

const SAVE_LABELS: Record<SaveState, string> = {
  idle: "No changes",
  saving: "Saving…",
  saved: "Saved",
  error: "Not saved",
};

function reason(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Something went wrong";
}

/**
 * The admin: clones and the brief on the left, one panel of fields in the
 * middle, the live site on the right. An edit is persisted after 300ms and then
 * pushed into the iframe, so the preview and the file on disk never disagree.
 */
export function BuilderWorkspace() {
  const [clones, setClones] = useState<CloneSummary[]>([]);
  const [slug, setSlug] = useState<string | null>(null);
  const [config, setConfig] = useState<CloneConfig | null>(null);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteItem[]>([]);
  const [ready, setReady] = useState(false);
  const [editorKey, setEditorKey] = useState<EditorKey>("identity");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [previewPath, setPreviewPath] = useState("/");
  const [reloadToken, setReloadToken] = useState(0);

  const frame = useRef<HTMLIFrameElement | null>(null);
  const latest = useRef<CloneConfig | null>(null);
  const saveTimer = useRef<number | null>(null);

  const push = useCallback((next: CloneConfig) => {
    frame.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, config: next }, "*");
  }, []);

  useEffect(() => {
    let cancelled = false;

    listClones()
      .then((list) => {
        if (cancelled) {
          return;
        }
        setClones(list);
        setSlug(
          (current) =>
            current ??
            list.find((clone) => clone.meta.slug === TEMPLATE_SLUG)?.meta.slug ??
            list[0]?.meta.slug ??
            null,
        );
      })
      .catch((cause: unknown) => !cancelled && setError(reason(cause)));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!slug) {
      return;
    }
    let cancelled = false;

    Promise.all([getClone(slug), getPrerequisites(slug)])
      .then(([record, report]) => {
        if (cancelled) {
          return;
        }
        setConfig(record.config);
        latest.current = record.config;
        setPrerequisites(report.items);
        setReady(report.ready);
        setSaveState("idle");
        setError(null);
        setReloadToken((token) => token + 1);
      })
      .catch((cause: unknown) => !cancelled && setError(reason(cause)));

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* The iframe finishes loading after a save, so it asks for the current config. */
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const payload = event.data as { type?: unknown } | null;
      if (payload?.type === PREVIEW_READY_MESSAGE && latest.current) {
        push(latest.current);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [push]);

  useEffect(
    () => () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }
    },
    [],
  );

  const save = useCallback(
    async (target: string, next: CloneConfig) => {
      setSaveState("saving");

      try {
        const record = await putClone(target, next);
        setSaveState("saved");
        setError(null);
        push(record.config);

        const report = await getPrerequisites(target);
        setPrerequisites(report.items);
        setReady(report.ready);
        setClones(await listClones());
      } catch (cause) {
        setSaveState("error");
        setError(reason(cause));
      }
    },
    [push],
  );

  const applyConfig = useCallback(
    (next: CloneConfig) => {
      setConfig(next);
      latest.current = next;

      if (!slug) {
        return;
      }
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }
      saveTimer.current = window.setTimeout(() => void save(slug, next), SAVE_DEBOUNCE_MS);
    },
    [save, slug],
  );

  const create = useCallback((body: CreateCloneBody) => {
    createClone(body)
      .then(async (record) => {
        setClones(await listClones());
        setSlug(record.meta.slug);
        setEditorKey("identity");
        setError(null);
      })
      .catch((cause: unknown) => setError(reason(cause)));
  }, []);

  const download = useCallback(() => {
    if (!slug) {
      return;
    }
    downloadExport(slug, "next")
      .then(() => setError(null))
      .catch((cause: unknown) => setError(reason(cause)));
  }, [slug]);

  return (
    <div className="bld">
      <CloneRail
        clones={clones}
        activeSlug={slug}
        onSelect={setSlug}
        onCreate={create}
        prerequisites={prerequisites}
        editorKey={editorKey}
        onEditorKey={setEditorKey}
      />

      <div className="bld-col">
        <div className="bld-head">
          <span className="bld-title">{editorLabel(editorKey)}</span>
          <span className="bld-eyebrow">{SAVE_LABELS[saveState]}</span>
        </div>

        {error ? <p className="bld-error">{error}</p> : null}

        <div className="bld-scroll">
          {config ? (
            <CloneEditor slug={slug} config={config} editorKey={editorKey} onChange={applyConfig} />
          ) : (
            <p className="bld-note">Loading the clone…</p>
          )}
        </div>

        <div className="bld-actions">
          <Button type="button" size="sm" disabled={!ready || !slug} onClick={download}>
            Download Next.js zip
          </Button>
          <Button type="button" size="sm" variant="outline" disabled>
            Static zip — phase 2
          </Button>
          {!ready ? (
            <p className="bld-note">Export unlocks once every prerequisite is complete.</p>
          ) : null}
        </div>
      </div>

      <PreviewFrame
        slug={slug}
        path={previewPath}
        onPath={setPreviewPath}
        frameRef={frame}
        reloadToken={reloadToken}
        onReload={() => setReloadToken((token) => token + 1)}
      />
    </div>
  );
}

function CloneEditor({
  slug,
  config,
  editorKey,
  onChange,
}: {
  slug: string | null;
  config: CloneConfig;
  editorKey: EditorKey;
  onChange: (next: CloneConfig) => void;
}) {
  if (editorKey === "identity") {
    return (
      <IdentityForm
        identity={config.identity}
        onChange={(identity) => onChange({ ...config, identity })}
      />
    );
  }

  if (editorKey === "theme") {
    return <ThemeForm theme={config.theme} onChange={(theme) => onChange({ ...config, theme })} />;
  }

  if (editorKey === "residences") {
    return (
      <div className="bld-form">
        <JsonEditor
          key={`${slug}-listing`}
          label="Listing page"
          value={config.residences.listing}
          onChange={(listing) =>
            onChange({ ...config, residences: { ...config.residences, listing } })
          }
        />
        <JsonEditor
          key={`${slug}-items`}
          label="Inventory"
          value={config.residences.items}
          onChange={(items) =>
            onChange({
              ...config,
              residences: { ...config.residences, items: items as unknown[] },
            })
          }
        />
      </div>
    );
  }

  return (
    <div className="bld-form">
      <label className="bld-checkbox">
        <input
          type="checkbox"
          checked={config.sectionVisibility?.[editorKey] !== false}
          onChange={(event) =>
            onChange({
              ...config,
              sectionVisibility: {
                ...config.sectionVisibility,
                [editorKey]: event.target.checked,
              },
            })
          }
        />
        Show this section
      </label>
      <JsonEditor
        key={`${slug}-${editorKey}`}
        label={editorLabel(editorKey)}
        value={config.sections[editorKey]}
        onChange={(value) =>
          onChange({ ...config, sections: { ...config.sections, [editorKey]: value } })
        }
      />
    </div>
  );
}
