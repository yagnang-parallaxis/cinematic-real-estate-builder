import type { CloneConfig, CloneMeta, PrerequisiteItem } from "@cinematic/schemas";

import { env } from "../env";

export interface CloneSummary {
  meta: CloneMeta;
  prerequisites: { total: number; complete: number; ready: boolean };
}

export interface CloneRecord {
  meta: CloneMeta;
  config: CloneConfig;
}

export interface PrerequisiteReport {
  items: PrerequisiteItem[];
  ready: boolean;
}

export interface CreateCloneBody {
  name: string;
  slug: string;
  template: "aurelia" | "blank";
}

/** The API answers errors as `{ message, issues? }`; surface whichever it sent. */
async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: unknown;
      prerequisites?: unknown;
      issues?: { path?: string; message?: string }[];
    };

    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : typeof body.message === "string"
        ? body.message
        : `Request failed (${response.status})`;

    if (Array.isArray(body.prerequisites) && body.prerequisites.length > 0) {
      return `${message}: ${body.prerequisites.join(", ")}`;
    }
    if (body.issues && body.issues.length > 0) {
      return `${message}: ${body.issues.map((issue) => issue.path).join(", ")}`;
    }
    return message;
  } catch {
    return `Request failed (${response.status})`;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as T;
}

export function listClones(): Promise<CloneSummary[]> {
  return request<CloneSummary[]>("/clones");
}

export function getClone(slug: string): Promise<CloneRecord> {
  return request<CloneRecord>(`/clones/${slug}`);
}

export function createClone(body: CreateCloneBody): Promise<CloneRecord> {
  return request<CloneRecord>("/clones", { method: "POST", body: JSON.stringify(body) });
}

export function putClone(slug: string, config: CloneConfig): Promise<CloneRecord> {
  return request<CloneRecord>(`/clones/${slug}`, { method: "PUT", body: JSON.stringify(config) });
}

export function getPrerequisites(slug: string): Promise<PrerequisiteReport> {
  return request<PrerequisiteReport>(`/clones/${slug}/prerequisites`);
}

/** Streams the zip straight to a download rather than through React state. */
export async function downloadExport(slug: string, format: "next" | "static"): Promise<void> {
  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/clones/${slug}/export?format=${format}`,
    { method: "POST" },
  );

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slug}-site.zip`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function previewUrl(slug: string, path = "/"): string {
  return `${env.NEXT_PUBLIC_WEB_URL}${path}?clone=${slug}&preview=1`;
}
