"use client";

import type { PrerequisiteItem } from "@cinematic/schemas";

import type { EditorKey } from "./editor-keys";
import { StatusMark } from "./StatusMark";

/**
 * The full-site brief, derived from the config rather than hand-maintained.
 * Every row jumps to the panel that can close the gap.
 */
export function PrerequisitesPanel({
  items,
  onJump,
}: {
  items: PrerequisiteItem[];
  onJump: (key: EditorKey) => void;
}) {
  const groups = [...new Set(items.map((item) => item.group))];

  return (
    <>
      {groups.map((group) => (
        <div className="bld-group" key={group}>
          <p className="bld-eyebrow bld-group-title">{group}</p>
          <div className="bld-prereq">
            {items
              .filter((item) => item.group === group)
              .map((item) => (
                <button
                  type="button"
                  className="bld-nav-item"
                  key={item.id}
                  disabled={!item.section}
                  onClick={() => item.section && onJump(item.section)}
                >
                  <span className="bld-prereq-label">
                    {item.label}
                    {item.detail ? <span className="bld-prereq-detail">{item.detail}</span> : null}
                  </span>
                  <StatusMark status={item.status} />
                </button>
              ))}
          </div>
        </div>
      ))}
    </>
  );
}
