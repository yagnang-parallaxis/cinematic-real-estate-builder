import type { CloneConfig, CloneMeta, PrerequisiteItem } from "@cinematic/schemas";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

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
  brand?: string;
  place?: string;
}

/** Carries the API's structured detail so a tool can hand the agent something actionable. */
export class CloneApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "CloneApiError";
  }
}

interface ApiErrorBody {
  message?: unknown;
  issues?: { path?: string; message?: string }[];
  prerequisites?: unknown;
}

async function readError(response: Response): Promise<CloneApiError> {
  let body: ApiErrorBody = {};
  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    return new CloneApiError(`Request failed (${response.status})`, response.status);
  }

  const message = Array.isArray(body.message)
    ? body.message.join(", ")
    : typeof body.message === "string"
      ? body.message
      : `Request failed (${response.status})`;

  return new CloneApiError(message, response.status, {
    issues: body.issues,
    prerequisites: body.prerequisites,
  });
}

/**
 * Thin HTTP client over the Nest API. The MCP server deliberately owns no
 * storage: `apps/api` stays the single writer of `data/clones`.
 */
export class CloneApiClient {
  constructor(private readonly baseUrl: string) {}

  private async fetchApi(path: string, init?: RequestInit): Promise<Response> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: init?.body
          ? { "Content-Type": "application/json", ...init.headers }
          : init?.headers,
      });
    } catch (cause) {
      throw new CloneApiError(
        `Cannot reach the clone API at ${this.baseUrl} — start it with "pnpm dev" (apps/api listens on :4000)`,
        0,
        { cause: cause instanceof Error ? cause.message : String(cause) },
      );
    }

    if (!response.ok) {
      throw await readError(response);
    }

    return response;
  }

  private async requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetchApi(path, init);
    return (await response.json()) as T;
  }

  health(): Promise<{ status: string }> {
    return this.requestJson<{ status: string }>("/health");
  }

  list(): Promise<CloneSummary[]> {
    return this.requestJson<CloneSummary[]>("/clones");
  }

  get(slug: string): Promise<CloneRecord> {
    return this.requestJson<CloneRecord>(`/clones/${slug}`);
  }

  create(body: CreateCloneBody): Promise<CloneRecord> {
    return this.requestJson<CloneRecord>("/clones", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  put(slug: string, config: CloneConfig): Promise<CloneRecord> {
    return this.requestJson<CloneRecord>(`/clones/${slug}`, {
      method: "PUT",
      body: JSON.stringify(config),
    });
  }

  prerequisites(slug: string): Promise<PrerequisiteReport> {
    return this.requestJson<PrerequisiteReport>(`/clones/${slug}/prerequisites`);
  }

  /** MCP transports are text-only, so the zip lands on disk and the tool returns its path. */
  async exportToFile(slug: string, format: string, destination: string): Promise<number> {
    const response = await this.fetchApi(`/clones/${slug}/export?format=${format}`, {
      method: "POST",
    });

    const bytes = Buffer.from(await response.arrayBuffer());
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
    return bytes.byteLength;
  }
}
