import {
  evaluatePrerequisites,
  type CloneConfig,
  type PrerequisiteItem,
  type PrerequisiteStatus,
} from "@cinematic/schemas";

import { SECTION_GUIDE } from "./schema-guide.js";

export function statusIcon(status: PrerequisiteStatus): string {
  switch (status) {
    case "complete":
      return "✅";
    case "partial":
      return "⚠️";
    case "missing":
      return "❌";
    default: {
      const unhandled: never = status;
      throw new Error(`Unhandled prerequisite status: ${String(unhandled)}`);
    }
  }
}

export interface BlockingItem {
  id: string;
  label: string;
  status: PrerequisiteStatus;
  icon: string;
  target?: string;
  detail?: string;
  hint?: string;
}

export interface PrerequisiteSummary {
  ready: boolean;
  total: number;
  complete: number;
  blocking: BlockingItem[];
}

function hintFor(item: PrerequisiteItem): string | undefined {
  if (item.section === "identity") {
    return "Set brief.identity (projectName, brand, place).";
  }
  if (item.section === "theme") {
    return "Set brief.colors (paper, ink, primary, primaryForeground).";
  }
  if (item.section === "residences") {
    return "Add residences via brief.residences or upsert_residence (name, slug, status required).";
  }
  if (item.section === undefined) {
    return undefined;
  }

  const guide = SECTION_GUIDE[item.section];
  return guide.briefGroup
    ? `Set brief.${guide.briefGroup}, or call set_section_content for sections.${item.section}.`
    : `Call set_section_content for sections.${item.section}.`;
}

export function summarize(items: readonly PrerequisiteItem[]): PrerequisiteSummary {
  const blocking = items
    .filter((item) => item.status !== "complete")
    .map<BlockingItem>((item) => ({
      id: item.id,
      label: item.label,
      status: item.status,
      icon: statusIcon(item.status),
      target: item.section,
      detail: item.detail,
      hint: hintFor(item),
    }));

  return {
    ready: blocking.length === 0,
    total: items.length,
    complete: items.length - blocking.length,
    blocking,
  };
}

/** Local evaluation, used for dry runs where nothing has been written yet. */
export function summarizeConfig(config: CloneConfig): PrerequisiteSummary {
  return summarize(evaluatePrerequisites(config));
}

export function checklist(items: readonly PrerequisiteItem[]): string[] {
  return items.map((item) => `${statusIcon(item.status)} ${item.id} — ${item.label}`);
}
