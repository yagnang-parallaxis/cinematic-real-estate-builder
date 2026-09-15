# Clone Suite MVP Implementation Plan

> **For agentic workers:** Execute task-by-task. User requested immediate implementation.

**Goal:** File-backed clone suite: edit full brief → live preview → Next.js zip export.

**Architecture:** `CloneConfig` JSON in `data/clones/<slug>/`; Nest API CRUD/export; web loads config + PreviewBridge; builder side-by-side admin.

**Tech Stack:** NestJS, Next.js 16, Zod, archiver, existing section-library.

## Global Constraints

- No Postgres/auth in MVP
- Export `format=next` only (`static` → 501)
- Theme = colors only
- Default clone slug: `aurelia`

## Tasks

- [x] Task 1: `@cinematic/schemas` CloneConfig + prerequisites
- [x] Task 2: Seed `data/clones/aurelia` from web content
- [x] Task 3: API clones module (CRUD, assets, prerequisites, export)
- [x] Task 4: Web config loader + PreviewBridge + theme vars
- [x] Task 5: Builder admin UI (checklist, forms, iframe)
- [x] Task 6: Smoke: create/edit/preview/export path
