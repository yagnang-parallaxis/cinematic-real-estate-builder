# Product Requirements Document

## Cinematic Real Estate Website Builder (SaaS Platform)

**Status:** Draft for architecture review
**Owner:** Product / Platform Architecture
**Scope of this document:** Product requirements only. No application code, schemas, or APIs are defined here.

---

# 1. Executive Summary

Real-estate developers, resorts, and premium property brands routinely commission bespoke, cinematic websites for each project — a multi-month, developer-heavy process that must be repeated for every new development, phase, or brand relaunch. This document defines the requirements for a multi-tenant SaaS platform that lets these organizations produce websites of comparable visual and interactive quality themselves, through a structured visual builder, without writing code.

The platform separates **content**, **structure**, **design**, **animation**, **media**, **SEO**, **publishing**, and **analytics** into independent, user-configurable layers. A non-technical marketing manager should be able to stand up a premium, animation-rich, SEO-ready, accessible website for a new residential project in hours rather than months, and iterate on it continuously without engineering involvement.

A downloaded reference site (era-residence.com, built on Webflow) was inspected purely to extract _generalizable_ interaction and information-architecture patterns common to this category of website (cinematic hero sections, scroll-driven reveals, residence/unit browsing, amenity storytelling, lead capture). None of its code, content, or assets are used in the product; see Section 41-equivalent analysis embedded below ("Reference Website Analysis").

---

# 2. Product Vision

**Vision statement:** Any premium real-estate brand should be able to launch a cinematic, best-in-class website for a project — and keep it current — using only a visual builder, with the same production quality previously reserved for custom agency builds.

The platform achieves this by treating a "website" as **structured configuration** (pages → sections → blocks → content bindings, plus a design theme and an animation profile) rather than as hand-authored markup. A renderer consumes this configuration to produce a fast, SEO-friendly, accessible, animated website. The builder and the renderer are decoupled: the builder only ever edits configuration; the renderer never has builder-only concerns baked into it.

Layered separation of concerns (each independently editable, each versioned independently):

1. **Content** — the facts about the project (residences, amenities, location, timeline, media, contact info).
2. **Structure** — which pages exist, which sections are on each page, in what order, with what visibility rules.
3. **Visual design** — theme tokens: typography, color, spacing, radii, buttons, navigation, layout widths.
4. **Animations** — a preset-driven system (reveal, parallax, transitions) applied declaratively to sections/blocks.
5. **Media** — the asset library, transformations, and delivery.
6. **SEO** — metadata, structured data, sitemaps, canonical/redirect rules.
7. **Publishing** — draft/preview/production lifecycle, versioning, rollback, custom domains.
8. **Analytics** — engagement and lead data, scoped per organization/project/website/page.

---

# 3. Problem Statement

Premium real-estate marketing currently requires:

- Hiring an agency or in-house developers to hand-build a bespoke website per project (high cost, 2-4+ month lead times).
- Re-implementing the same interaction patterns (parallax heroes, unit browsers, amenity galleries, timelines, lead forms) from scratch each time, because no reusable, non-technical tooling exists at this quality bar.
- Accepting a quality trade-off: generic website builders (Squarespace, plain Webflow templates) are accessible to non-developers but rarely reach the cinematic, scroll-choreographed quality this market expects; bespoke agency builds reach that quality but are slow, expensive, and freeze the moment the developer's team stops being available.
- Struggling to keep a launched site updated (new unit availability, price changes, new renders, construction milestones) without going back to the agency/developer for every content change.
- Managing multiple concurrent developments (different buildings, phases, brands) with no unified, centrally governed tooling — leading to inconsistent quality, duplicated effort, and fragmented analytics/lead data.

**The gap:** there is no platform purpose-built for real estate that delivers agency-grade cinematic quality through a structured, code-free builder, with multi-tenant governance suitable for an organization running many projects at once.

---

# 4. Goals and Objectives

| ID  | Goal                                                                                                                                | Why it matters                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| G1  | Enable a non-technical user to publish a premium, animated, multi-page real-estate website without developer involvement            | Core value proposition                                                            |
| G2  | Reach visual/interaction quality comparable to bespoke cinematic real-estate sites                                                  | Differentiator vs. generic website builders                                       |
| G3  | Keep published sites fast (strong Core Web Vitals) despite heavy media and animation                                                | Cinematic ≠ slow; SEO and conversion depend on speed                              |
| G4  | Make SEO and accessibility first-class, not bolt-ons                                                                                | Real-estate leads come from organic search; legal/compliance risk if inaccessible |
| G5  | Support true multi-tenancy: one organization operating many projects/websites with isolated data, assets, and analytics             | Target customers (developers, agencies) manage portfolios, not one-offs           |
| G6  | Decouple the builder from the renderer via a structured content/config model                                                        | Long-term extensibility; allows renderer or builder to evolve independently       |
| G7  | Provide governed, role-based collaboration (owner, admin, editor, designer, viewer)                                                 | Real teams include internal staff and external agencies/designers                 |
| G8  | Capture and route leads (enquiries, brochure downloads, callback requests) reliably                                                 | The website's business purpose is lead generation                                 |
| G9  | Keep the MVP scoped tightly to what a real-estate company needs to _launch_ a site, deferring collaboration/AI/marketplace features | Ship a coherent, high-quality core rather than a shallow everything-platform      |

---

# 5. Non-Goals

Explicitly out of scope for the product direction covered by this PRD (not just MVP — see Section 38/Future Scope for items that are future-but-planned):

- The platform is **not** a general-purpose website builder (e.g., not for blogs, e-commerce stores, SaaS marketing sites unrelated to real estate). Its content model, section library, and templates are purpose-built for real-estate/property/hospitality projects.
- The platform does **not** aim to let users write arbitrary HTML/CSS/JS/GSAP inside the builder. All visual and animation control is through structured, constrained configuration.
- The platform is **not** a CRM. It captures and forwards leads; it does not replace a sales pipeline tool (though it must integrate with one — see Section 21).
- The platform does **not**, at this stage, generate content or imagery via AI (see Future Scope).
- The reference website's actual code/design system is **not** the platform's architecture; it is a research input only.

---

# 6. Target Users

### 6.1 Real-Estate Developer (Persona: "Elena, Development Director")

- **Goals:** Launch a credible, premium digital presence for a new project quickly; support sales velocity; protect brand quality across multiple developments.
- **Problems:** No in-house engineering; agency dependency is slow and costly; needs to update unit availability and pricing frequently.
- **Permissions:** Organization Owner or Organization Admin — full control over the organization's projects, billing readiness, users, and publishing.
- **Typical workflow:** Creates organization → creates project → picks a template → hands content entry to marketing manager → reviews design/animation choices → approves publish.
- **Required features:** Organization/project setup, template selection, publishing approval, custom domain setup, high-level analytics.

### 6.2 Marketing Manager (Persona: "Marcus, Marketing Lead")

- **Goals:** Keep website content accurate and compelling (units, amenities, gallery, timeline); run lead generation; monitor performance.
- **Problems:** Needs to publish content changes without waiting on developers; needs SEO control; needs to know which content drives leads.
- **Permissions:** Editor (content, media, SEO, forms) with limited or no access to global theme/design system changes depending on org policy.
- **Typical workflow:** Uploads new renders/floor plans, updates residence availability/pricing, edits copy, configures SEO metadata per page, reviews lead inbox, checks analytics.
- **Required features:** Content management for all entities, media library, SEO fields per page, lead inbox/export, page-level analytics, draft/preview before publish.

### 6.3 Agency/Designer (Persona: "Sofia, Freelance Brand Designer")

- **Goals:** Establish the visual identity (theme, typography, animation feel) for a client's project; sometimes work across multiple client organizations.
- **Problems:** Needs deep design control (tokens, spacing, motion) without touching content, which the client's team owns; needs to hand off the site cleanly.
- **Permissions:** Designer role — full access to theme/design system and animation configuration, restricted or read-only access to content data and publishing.
- **Typical workflow:** Invited as a collaborator to a specific project/website; configures design tokens and animation presets; builds/customizes section templates; previews across breakpoints; hands control back to the org's Editor/Owner for content and publish.
- **Required features:** Design system editor, animation preset configuration, section/template customization, responsive preview, no/limited publish rights (configurable).

### 6.4 Property/Project Manager (Persona: "Diego, Project Manager")

- **Goals:** Ensure the website accurately reflects real-world project status: construction milestones, unit availability, floor plan changes.
- **Problems:** Content changes are frequent and time-sensitive (a sold-out unit must be reflected immediately); needs simple, low-risk editing without breaking layout/design.
- **Permissions:** Editor scoped to a single project (content, media, timeline), typically without design or organization-level settings access.
- **Typical workflow:** Updates residence status/availability, uploads new construction-progress photos, edits the timeline/roadmap entity, requests publish or publishes directly if permitted.
- **Required features:** Structured content editing for residences/timeline/amenities, availability/status fields, media upload, publish or "request publish" action.

### 6.5 Platform Administrator (Persona: "Priya, Platform Ops")

- **Goals:** Operate the SaaS platform itself: onboard organizations, manage templates/components available platform-wide, ensure system health, security, and compliance.
- **Problems:** Needs visibility across all tenants for support and abuse prevention without violating tenant data isolation; needs to manage the shared template/component library.
- **Permissions:** Platform Admin — cross-tenant visibility scoped to operational necessity (support, moderation, billing), not general content access.
- **Typical workflow:** Reviews new organization signups, manages the global template/component/theme catalog, monitors publishing/domain/SSL status across tenants, reviews audit logs, manages platform-wide settings.
- **Required features:** Admin console (Section 34), template/component management, domain/SSL oversight, audit log access, system settings, impersonation-for-support with audit trail.

---

# 7. User Roles

Platform-wide role model (applies within an Organization; a Platform Admin role exists above all organizations):

| Role                   | Scope                          | Summary                                                                              |
| ---------------------- | ------------------------------ | ------------------------------------------------------------------------------------ |
| **Platform Admin**     | Cross-tenant                   | Operates the SaaS platform: templates, components, tenant oversight, system settings |
| **Organization Owner** | One organization               | Full control: billing readiness, users, all projects/websites, domains               |
| **Organization Admin** | One organization               | Full operational control except billing/ownership transfer                           |
| **Editor**             | Assigned project(s)/website(s) | Content, media, SEO, forms, publishing (if granted)                                  |
| **Designer**           | Assigned project(s)/website(s) | Theme, design tokens, animation configuration, section/template customization        |
| **Viewer**             | Assigned project(s)/website(s) | Read-only access to builder and analytics; no edits                                  |

Fine-grained permission matrix is defined in Section 26.

---

# 8. Core User Journeys

## 8.1 Primary Journey (End-to-End)

```
Sign up / Sign in
  → Create Organization
    → Invite team members (assign roles)
    → Create Project (e.g., a residential development)
      → Choose a Website Template (industry-specific starting point)
        → Customize Website
          → Manage Content (residences, amenities, gallery, location, timeline, contact info)
          → Configure Design (theme tokens: typography, color, spacing, buttons, nav)
          → Configure Animations (assign presets to sections/blocks)
          → Arrange Structure (pages, sections, ordering, visibility, responsive overrides)
        → Preview (desktop/tablet/mobile, draft state)
        → Configure SEO (per page: title, description, OG, structured data, slug)
        → Publish (draft → production)
        → Configure Custom Domain (DNS, SSL)
      → Monitor Analytics (organization → project → website → page)
      → Manage Leads (inbox, status, export, CRM webhook)
    → Repeat for additional Projects within the same Organization
```

## 8.2 Journey Detail: New Project Launch (Happy Path)

1. Organization Owner creates a new Project ("Project Aurora — Phase 2").
2. Owner or Editor selects an industry template (e.g., "Boutique Residences" template) — this seeds pages, section structure, a starter theme, and default animation profile.
3. Editor enters content: uploads logo and hero media, defines Buildings and Residences, uploads floor plans, defines Amenities, builds the Gallery, sets Location details, defines the construction Timeline, and enters Contact information.
4. Designer (or Editor, if no dedicated designer) adjusts the theme (colors, type) to match brand guidelines and reviews/adjusts the animation profile.
5. Any collaborator arranges page structure: reorders sections, toggles visibility of optional sections (e.g., hides Timeline if construction hasn't started), sets per-breakpoint overrides for a couple of sections.
6. Editor configures SEO per page and confirms structured data (project/residence schema) is populated from content, not re-typed.
7. Any collaborator previews the site in draft mode across breakpoints, including with reduced-motion simulated.
8. Editor/Owner publishes to production. Platform issues/attaches SSL for the assigned subdomain or connects a verified custom domain.
9. Owner reviews analytics after go-live; Editor manages the lead inbox as enquiries arrive.

## 8.3 Journey Detail: Ongoing Maintenance

- Property Manager updates a Residence's availability status → change is saved as a draft revision → either auto-published (if role permits) or queued for Editor/Owner review → republished with cache invalidation on the specific page(s) affected.
- Marketing Manager swaps hero video for a seasonal campaign, adjusts homepage SEO description, publishes.
- Designer is invited to refresh the theme for a rebrand; changes are staged, previewed, and published as a new website configuration version, with the prior version retained for rollback.

## 8.4 Journey Detail: Multi-Project Organization

An Organization ("Coastal Developments Group") operates three concurrent Projects, each with its own Website, content, theme, domain, and analytics — but shared Organization-level users, a shared asset library structure (per-project isolation within it), and roll-up analytics at the Organization level.

---

# 9. Product Architecture Overview

Conceptual layers (implementation-agnostic at this stage; see Sections 27-29 for backend/frontend/storage direction):

1. **Builder Application** — authoring tool. Operates exclusively on structured configuration (page/section/block graphs, theme tokens, animation assignments, content records). Never emits or edits raw HTML/CSS/JS.
2. **Platform API / Backend** — owns tenancy, RBAC, content, media metadata, publishing lifecycle, SEO configuration, lead capture, analytics aggregation, and audit logging.
3. **Website Renderer** — a separate application that consumes a **published (or preview) website configuration** and server-renders the actual public-facing website. It has no knowledge of builder UI concerns; it only knows how to interpret the structured configuration schema (pages → sections → blocks → content bindings + theme + animation profile).
4. **Media/Asset Pipeline** — ingestion, transformation, and CDN delivery of images/video, decoupled from both builder and renderer, addressed by stable asset references.
5. **Publishing Pipeline** — takes a website configuration version, produces a deployable/servable artifact or routing entry, invalidates caches, and manages custom domain/SSL binding.

Principle enforced throughout: **the builder edits configuration; the renderer only reads configuration.** This is what allows the renderer to evolve (e.g., change animation library, change rendering strategy) without requiring builder changes, and vice versa (Principle 11 in Section "Important Product Principles").

---

# 10. MVP Scope

### 10.1 MVP Website Pages (per project website)

| Page                          | Priority | Notes                                              |
| ----------------------------- | -------- | -------------------------------------------------- |
| Home                          | P0       | Hero, brand story, highlights, CTA sections        |
| Project Overview              | P0       | Concept, architecture, positioning narrative       |
| Residences/Buildings listing  | P0       | Filterable list of residence types/units           |
| Residence Detail              | P0       | Single unit/type: floor plan, specs, gallery       |
| Amenities                     | P0       | Amenity storytelling, icons/imagery                |
| Gallery                       | P0       | Project-wide media gallery                         |
| Location                      | P0       | Map, points of interest, distances                 |
| Project Information           | P0       | Specs, developer info, downloads                   |
| Construction/Roadmap Timeline | P1       | Milestone timeline; may be hidden pre-construction |
| Contact                       | P0       | Enquiry form, contact details, office/location     |
| 404 / Not Found               | P0       | Required for production readiness                  |

### 10.2 MVP Content Management — In Scope

Logo, images, videos, Buildings, Residences, Floor Plans, Amenities, Locations, Timeline, Project Information, Galleries, Contact Information — all listed capabilities in the brief are MVP (P0/P1 per Section 13).

### 10.3 MVP Website Builder — In Scope

Pages, Sections, Blocks/components, drag-and-drop reordering, section ordering, visibility toggles, per-breakpoint responsive configuration, content binding, reusable sections, template selection — all P0 (detailed in Section 11).

### 10.4 MVP Design System — In Scope

Typography, font family/size/weight, color tokens, backgrounds, spacing scale, border radius, button styles, navigation styles, layout/container widths — all P0 (Section 15).

### 10.5 MVP Animation System — In Scope

Fade, slide, scale, reveal (text/image), parallax, scroll-based triggers, section/page transitions, hover interactions — exposed as **presets with bounded parameters**, not code (Section 16).

### 10.6 MVP Media — In Scope

Image/video upload, asset library with folders, metadata, automatic optimization/responsive variants, CDN delivery, video posters, lazy loading (Section 18).

### 10.7 Explicitly NOT in MVP

- Multi-language / i18n websites (structure should not preclude it later — see Section 38).
- AI-assisted content, copy, or image generation.
- A/B testing and personalization.
- Advanced analytics (heatmaps, session replay).
- Billing/subscription enforcement (billing _readiness_ in the data model is in scope; charging is not).
- Marketplace for third-party templates/components.
- Real-time multi-user collaborative editing (concurrent edit locking is sufficient for MVP — see Section 39).
- Approval workflows beyond a simple draft → publish gate.
- White-label/reseller platform mode.
- Native mobile app.
- Free-form custom code/CSS/JS injection by end users.

---

# 11. Website Builder Requirements

### 11.1 Layout

- **Left Panel:** Pages list, Section library (browsable by category, with search), Component/block picker, Asset library shortcut.
- **Center:** Live website canvas rendering the actual section/component tree with the active theme and animation profile applied; device-frame responsive preview (Desktop / Tablet / Mobile).
- **Right Panel:** Contextual inspector for the selected page/section/block — tabs for Content, Layout, Typography, Colors, Animation, Visibility, Advanced.
- **Top Bar:** Save (with autosave + explicit save state indicator), Undo/Redo, Preview (opens a shareable, unpublished preview URL), Device selector, Publish button (with draft/published state indicator).

### 11.2 Requirements Table

| ID     | Priority | Requirement                                                                                                                                                                                   | Acceptance Criteria                                                                                         |
| ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| BLD-1  | P0       | User can add, remove, and reorder sections within a page via drag-and-drop                                                                                                                    | Reordering persists on save; order reflected identically in preview and published site                      |
| BLD-2  | P0       | User can toggle visibility of any section (hidden without deletion)                                                                                                                           | Hidden sections do not render on the live site but remain editable in the builder                           |
| BLD-3  | P0       | User can configure a section's per-breakpoint visibility and select layout variants (e.g., hide on mobile, stack on tablet) independently of desktop configuration                            | Breakpoint overrides do not affect other breakpoints                                                        |
| BLD-4  | P0       | Section/block content fields bind to structured content entities (e.g., a "Residence Card" block binds to a Residence record) rather than free-form static text where a content entity exists | Editing the source content record updates all bound instances                                               |
| BLD-5  | P0       | User can save a section configuration as a reusable/global section, usable across multiple pages, with instance-level content overrides                                                       | Editing the "global" definition propagates to all instances; instance-level content overrides are preserved |
| BLD-6  | P0       | Builder never requires the user to write or view HTML/CSS/JS/GSAP code                                                                                                                        | No code editor surface exists in the MVP builder UI                                                         |
| BLD-7  | P0       | Undo/redo covers structural, content, design, and animation edits within a session                                                                                                            | At least the last 50 actions are reversible                                                                 |
| BLD-8  | P0       | Autosave of drafts with explicit "unsaved changes" and "saved" states                                                                                                                         | No data loss on browser crash/refresh for autosaved state                                                   |
| BLD-9  | P0       | Preview reflects the exact draft state, including unpublished content/design/animation changes, via a distinct, non-public preview URL                                                        | Preview URL is not indexable and requires authentication or a signed token                                  |
| BLD-10 | P1       | Component/section library is filterable by category (Hero, Gallery, Amenities, Listing, Timeline, Contact, etc.)                                                                              | Search returns relevant sections within the active template's library                                       |
| BLD-11 | P1       | Builder supports keyboard-accessible operation of core actions (select, reorder via keyboard, save, undo)                                                                                     | Core builder actions operable without a mouse                                                               |

---

# 12. Website Rendering Requirements

### 12.1 Rendering Strategy for MVP

**Preferred approach: Static generation with incremental regeneration, served through a CDN, with dynamic fallback for freshly published or rarely visited pages.**

Rationale:

- Real-estate marketing pages are read-heavy and change infrequently relative to visits (content changes on the order of hours/days, not per-request) — ideal for static/ISR rendering.
- Cinematic, media-heavy pages benefit most from CDN-edge delivery of fully rendered HTML plus optimized media, minimizing time-to-first-byte and layout shift.
- Publishing an update should regenerate only the affected pages (incremental), not the whole site, to keep publish latency low as sites grow (more residences, more pages).
- A short-lived dynamic/on-demand rendering path is required for: brand-new pages not yet in the static cache, and preview mode (which must always reflect the latest draft, never a stale cache).

| ID    | Priority | Requirement                                                                                                         | Acceptance Criteria                                                    |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| REN-1 | P0       | Published pages are statically generated and served from a CDN by default                                           | Cache hit ratio target defined and met in staging load test            |
| REN-2 | P0       | Publishing a change triggers incremental regeneration limited to affected pages                                     | Unaffected pages are not rebuilt or cache-invalidated                  |
| REN-3 | P0       | Preview mode always renders the current draft dynamically (bypassing static cache)                                  | Preview never serves a stale cached version                            |
| REN-4 | P0       | Renderer consumes only the structured website configuration schema — no project-specific hardcoded pages/components | A new project on a new template requires zero renderer code changes    |
| REN-5 | P0       | Images/video are served in responsive, format-negotiated variants (see Section 18) regardless of rendering mode     | Verified via automated Lighthouse/CWV checks in CI                     |
| REN-6 | P1       | Production and preview environments are isolated (separate caching, separate indexing controls)                     | Preview pages are never crawlable/indexable                            |
| REN-7 | P1       | Renderer supports on-demand cache invalidation triggered by the publishing pipeline                                 | Invalidation completes within a defined SLA (target: under 60 seconds) |

---

# 13. Content Management Requirements

Users must be able to manage the following without code, each with structured fields, media relationships, and publishing state (draft vs. published values can differ):

| Entity                        | Priority | Key Capabilities                                                                                                                                                |
| ----------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logo & brand assets           | P0       | Upload, replace, usage across nav/footer/favicon                                                                                                                |
| Images/Videos (asset library) | P0       | Upload, organize into folders, tag with metadata, reuse across entities                                                                                         |
| Buildings                     | P0       | Create/edit building records, associate residences, attach media                                                                                                |
| Residences (units)            | P0       | Create/edit unit type or specific unit, specs (area, rooms, bedrooms, floor), availability/status, pricing (optional display), associate floor plan and gallery |
| Floor Plans                   | P0       | Upload plan image/PDF, associate with one or more residences, label rooms/dimensions (structured, not baked into the image)                                     |
| Amenities                     | P0       | Create/edit amenity entries (name, description, icon/image), reusable across pages                                                                              |
| Locations                     | P0       | Address, coordinates, points-of-interest list with distances, map configuration                                                                                 |
| Timeline                      | P1       | Ordered milestone entries (date/label/description/media, status: planned/in-progress/complete)                                                                  |
| Project Information           | P0       | Narrative fields, specs table, downloadable documents (brochure, specs sheet)                                                                                   |
| Galleries                     | P0       | Curated, ordered media collections, reusable across pages/sections                                                                                              |
| Contact Information           | P0       | Phone, email, address, office hours, social links, map                                                                                                          |

Full entity field definitions are in Section "Content Model" concept (Section titled below as part of this document's required structure is folded into Section 13 per the template — see subsections 13.x).

### 13.x Content Entity Definitions (Conceptual — no schema)

**Organization**

- Purpose: top-level tenant; owns Projects, Users, billing readiness.
- Required: name, primary contact email.
- Optional: logo, billing details (readiness only), default locale/timezone.
- Relationships: has many Projects, has many Users (via role assignment).
- Publishing behavior: not publishable itself; a container.

**Project**

- Purpose: a specific real-estate development managed by an Organization.
- Required: name, organization reference, status (active/archived).
- Optional: internal code/reference, description.
- Relationships: has one or more Websites (MVP: typically one); has Buildings, Residences, Amenities, Location, Timeline, Contact Info, Galleries.
- Publishing behavior: not directly publishable; publishing occurs at the Website level.

**Website**

- Purpose: the buildable/publishable site tied to a Project.
- Required: project reference, template reference, domain configuration, theme reference, animation profile reference.
- Optional: custom domain, favicon override.
- Relationships: has Pages; references a Theme and Animation Profile; references Project content entities via bindings.
- Publishing behavior: has Draft and Published configuration versions; supports rollback (Section 36).

**Building**

- Purpose: groups Residences physically (e.g., a block/tower/villa cluster).
- Required: name.
- Optional: description, media, floor count.
- Relationships: has many Residences.
- Publishing behavior: draft/published value pair, published via parent Website publish action.

**Residence**

- Purpose: a sellable unit or unit type.
- Required: name/reference, building (optional if project has no buildings), area, status (available/reserved/sold/not released).
- Optional: bedrooms, bathrooms, floor, orientation, price (display toggle), description.
- Relationships: has one or more Floor Plans, has a Gallery, belongs to a Building (optional).
- Publishing behavior: status changes are the highest-frequency edit; must support fast, low-risk publish path.

**Floor Plan**

- Purpose: visual + structured representation of a residence's layout.
- Required: image/PDF asset, associated residence(s).
- Optional: room labels/dimensions (structured), alternate/furnished version.
- Relationships: belongs to one or more Residences.
- Publishing behavior: versioned as media; replacing a plan does not break historical references.

**Amenity**

- Purpose: a project feature/facility (pool, spa, gym, etc.) presented narratively.
- Required: name.
- Optional: description, icon, image/video, category.
- Relationships: reusable across Home, Amenities page, Residence detail.
- Publishing behavior: draft/published pair.

**Gallery**

- Purpose: curated, ordered set of media for a page or context.
- Required: name/context, ordered media list.
- Optional: captions, categories/filters.
- Relationships: referenced by pages/sections; media items reference the asset library.
- Publishing behavior: ordering and membership are versioned with the website configuration.

**Location**

- Purpose: geographic/context information for the project.
- Required: address, coordinates.
- Optional: points of interest (name, category, distance/time), map style reference.
- Relationships: one per Project (MVP); referenced by Location page and structured data.
- Publishing behavior: draft/published pair.

**Timeline**

- Purpose: construction/roadmap milestones.
- Required: ordered list of milestones (label, date or date-range, status).
- Optional: description, media per milestone.
- Relationships: belongs to Project; rendered on Timeline page/section.
- Publishing behavior: can be hidden entirely pre-construction via section visibility (Section 11).

**Contact Information**

- Purpose: how prospects reach the project/organization.
- Required: at least one contact method (email or phone), enquiry form target.
- Optional: office address, hours, social links, secondary offices.
- Relationships: referenced by Contact page, footer, forms (Section 21).
- Publishing behavior: draft/published pair.

---

# 14. Template System

| ID    | Priority | Requirement                                                                                                                                                                                                  |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TPL-1 | P0       | Platform ships with one or more industry-specific Website Templates (full site starting point: pages, sections, starter theme, starter animation profile) targeted at premium residential/resort real estate |
| TPL-2 | P0       | Selecting a template seeds an editable copy — subsequent edits never mutate the shared template definition                                                                                                   |
| TPL-3 | P0       | Page Templates (single-page starting points, e.g., "Residence Detail — Gallery Layout") can be applied to a page within an existing website                                                                  |
| TPL-4 | P0       | Section Templates (pre-built section configurations) are selectable from the section library when adding a new section                                                                                       |
| TPL-5 | P1       | Component Presets exist for common repeated blocks (residence card, amenity card, stat/number block) with sensible defaults                                                                                  |
| TPL-6 | P2       | "Premium" template tier reserved for higher design complexity, potentially gated by plan (billing-readiness only in MVP)                                                                                     |
| TPL-7 | P1       | Templates are versioned; existing websites built from an older template version are not silently force-migrated to a newer version                                                                           |
| TPL-8 | P0       | Applying/customizing a template never locks the user out of later changing individual sections, theme, or animations                                                                                         |

---

# 15. Design System

Design tokens configurable per website, applied globally with section/block-level overrides where sensible:

| Category      | Configurable Properties                                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Typography    | Font family (heading/body), size scale, weight scale, line-height, letter-spacing per text role (H1-H6, body, label, caption)     |
| Color         | Primary, secondary, accent, background, surface, text (on-light/on-dark/on-brand variants), semantic states (success/error/focus) |
| Backgrounds   | Solid, gradient, image/video-backed section backgrounds with overlay controls                                                     |
| Spacing       | A constrained spacing scale (not arbitrary pixel entry) applied to section padding/margins and block gaps                         |
| Border radius | Global radius scale applied to buttons, cards, images, inputs                                                                     |
| Buttons       | Variant styles (primary/secondary/ghost/circular), size scale, icon placement, hover state                                        |
| Navigation    | Style (transparent-over-hero vs. solid), logo placement, menu item styling, mobile menu behavior                                  |
| Layout widths | Max container width, section width variants (full-bleed vs. contained)                                                            |

| ID    | Priority | Requirement                                                                                                                  | Acceptance Criteria                                           |
| ----- | -------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| DES-1 | P0       | All design tokens are editable through a structured inspector, not free-form CSS                                             | No raw CSS input field exists in MVP                          |
| DES-2 | P0       | Token changes apply live in the builder canvas and preview                                                                   | Change reflected without full page reload                     |
| DES-3 | P0       | Theme is stored as a distinct, versioned entity referenced by the website                                                    | Rolling back a theme version does not affect content          |
| DES-4 | P1       | Themes can be duplicated/exported as a starting point for a new website within the same organization                         | Duplication does not affect the source theme                  |
| DES-5 | P0       | Color/contrast combinations are checked against accessibility minimums when applied to text-on-background pairs (Section 20) | Warning surfaced in the inspector when contrast fails WCAG AA |

---

# 16. Animation System

The platform exposes **configurable animation presets**, not a code/timeline editor. Presets take bounded parameters (duration, easing choice from a curated list, delay, trigger, distance/intensity) rather than arbitrary code.

| Preset Category   | Examples                                                                                | Configurable Parameters                                               |
| ----------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Reveal            | Fade in, slide + fade, scale in, text reveal (line/word/char), image reveal (mask wipe) | Direction, distance, duration, delay/stagger, scroll-trigger position |
| Parallax          | Background parallax, foreground image parallax, depth-layered parallax                  | Speed/intensity, direction, clamped range                             |
| Scroll-driven     | Progress-linked reveal, pinned section, scroll-snapped section                          | Trigger start/end, scrub vs. play-once                                |
| Transitions       | Section-to-section transition, page transition (on internal navigation)                 | Style (fade/slide/wipe), duration                                     |
| Hover/interaction | Button hover, card hover lift, image hover zoom                                         | Intensity, duration                                                   |

| ID    | Priority | Requirement                                                                                                                                                                | Acceptance Criteria                                                                            |
| ----- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| ANI-1 | P0       | Every animation is selected from a curated preset list with bounded, validated parameters                                                                                  | No free-form code/expression input in MVP                                                      |
| ANI-2 | P0       | Animations can be assigned per section/block, with an explicit "none" option                                                                                               | Sections default to a sensible preset but can opt out entirely                                 |
| ANI-3 | P0       | An "Animation Profile" (a named bundle of default preset choices/intensity) is configurable per website and can be swapped without re-assigning every section individually | Swapping the profile changes site-wide feel while explicit per-section overrides are preserved |
| ANI-4 | P0       | A global reduced-motion mode is available and honors the visitor's OS-level `prefers-reduced-motion` setting automatically on the published site                           | Verified with reduced-motion emulation in automated tests (Section 33)                         |
| ANI-5 | P1       | Preview supports simulating reduced-motion mode regardless of the operator's OS setting                                                                                    | Toggle available in builder preview                                                            |
| ANI-6 | P0       | Animation configuration is part of the versioned website configuration (draft/published, rollback-capable)                                                                 | Same versioning guarantees as content/design (Section 36)                                      |

---

# 17. Responsive Design

| ID    | Priority | Requirement                                                                                                                                                                               |
| ----- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RES-1 | P0       | Builder provides Desktop, Tablet, and Mobile preview/edit modes                                                                                                                           |
| RES-2 | P0       | Typography, spacing, and layout are responsive by default via the design token scale (fluid/step-based), requiring no manual per-breakpoint work for standard cases                       |
| RES-3 | P0       | Users can override specific properties (visibility, stacking order, image crop/focus, spacing) at the Tablet and Mobile breakpoints where the default responsive behavior is insufficient |
| RES-4 | P0       | Breakpoint overrides are additive on top of the Desktop base configuration, never a fully separate parallel page definition                                                               |
| RES-5 | P1       | Image focal point/crop can be set once and adapted automatically per breakpoint aspect ratio                                                                                              |

Property responsiveness classification:

- **Global (not breakpoint-specific):** color tokens, font family choices, animation preset selection, content bindings.
- **Automatically responsive (derived from scale, no manual input required):** type scale steps, spacing scale steps, container width.
- **Breakpoint-specific overrides available:** section/block visibility, stacking/reflow order, image crop/focal point, specific spacing exceptions.

---

# 18. Media Management

| ID    | Priority | Requirement                                                                                                                | Acceptance Criteria                                                                                          |
| ----- | -------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| MED-1 | P0       | Users can upload images and videos into an organization/project-scoped asset library                                       | Upload supports common formats (JPEG/PNG/WebP/MP4/MOV at minimum)                                            |
| MED-2 | P0       | Assets can be organized into folders and tagged with metadata (alt text, caption, category)                                | Alt text is required before an image can be used in an SEO-relevant context (hero, gallery) — see Section 19 |
| MED-3 | P0       | Uploaded images are automatically processed into responsive variants and modern formats (WebP/AVIF) with graceful fallback | Renderer serves `srcset`/`sizes` variants automatically, no manual export required                           |
| MED-4 | P0       | Media is delivered via CDN with cache headers appropriate for long-term caching plus safe invalidation on replace          | Replacing an asset invalidates only the affected cache entries                                               |
| MED-5 | P0       | Video assets support an associated poster image and lazy/deferred loading below the fold                                   | Verified via CWV testing (Section 32)                                                                        |
| MED-6 | P1       | Video assets can be delivered via adaptive/streaming-friendly format for larger files                                      | Large hero videos do not block initial paint                                                                 |
| MED-7 | P0       | Uploaded files are validated for type/size and scanned before being servable (Section 31)                                  | Rejected files surface a clear error; nothing unvalidated reaches public delivery                            |
| MED-8 | P1       | Asset deletion checks for existing usage and warns before removing an asset referenced elsewhere                           | No silently broken references on the live site                                                               |

---

# 19. SEO Requirements

| ID     | Priority | Requirement                                                                                                                                                |
| ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEO-1  | P0       | Every page supports editable title, meta description, canonical URL                                                                                        |
| SEO-2  | P0       | Open Graph and Twitter/X card metadata (title, description, image) editable per page, with sensible fallback to site defaults                              |
| SEO-3  | P0       | Structured data (JSON-LD) is generated from structured content (e.g., residential/real-estate schema types) automatically — not manually authored per page |
| SEO-4  | P0       | Automatic XML sitemap generation, updated on publish                                                                                                       |
| SEO-5  | P0       | Configurable `robots.txt`, with sane defaults (allow crawling of production, disallow preview)                                                             |
| SEO-6  | P0       | Custom, human-readable URL slugs per page, editable by the user                                                                                            |
| SEO-7  | P1       | Redirect management (old slug → new slug) so republishing a renamed page doesn't produce dead links                                                        |
| SEO-8  | P0       | A configurable, on-brand 404 page                                                                                                                          |
| SEO-9  | P0       | All images used in content require (or strongly prompt for) alt text                                                                                       |
| SEO-10 | P0       | Renderer emits semantic HTML (proper heading hierarchy, landmark regions, semantic elements) regardless of visual styling chosen in the builder            |

---

# 20. Accessibility Requirements

| ID    | Priority | Requirement                                                                                                                               |
| ----- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| ACC-1 | P0       | Full keyboard navigability of the published website (nav, forms, galleries, modals)                                                       |
| ACC-2 | P0       | Visible focus states on all interactive elements, themeable but never removable to the point of invisibility                              |
| ACC-3 | P0       | Color/contrast validated against WCAG AA at minimum for text/background token pairs (Section 15)                                          |
| ACC-4 | P0       | `prefers-reduced-motion` is honored automatically; animation-heavy sections must have a non-animated equivalent presentation (Section 16) |
| ACC-5 | P0       | Semantic HTML and correct heading hierarchy enforced by the renderer regardless of visual design choices                                  |
| ACC-6 | P0       | All meaningful images require alt text; decorative images are marked as such (empty alt)                                                  |
| ACC-7 | P0       | Forms have properly associated labels, error messaging, and are screen-reader operable                                                    |
| ACC-8 | P1       | Video content supports captions/transcripts where used for informational (not purely ambient/background) purposes                         |
| ACC-9 | P0       | Navigation (including mobile menu, modals, lightboxes) is screen-reader accessible (proper roles, focus trapping, escape-to-close)        |

---

# 21. Contact and Lead Management

| ID     | Priority | Requirement                                                                                                                                            | Acceptance Criteria                                                                   |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| LEAD-1 | P0       | Builder provides a form component supporting common real-estate lead intents: general enquiry, schedule a visit, request a callback, download brochure | Each intent maps to a distinct, trackable form type                                   |
| LEAD-2 | P0       | Form builder allows adding/removing standard fields (name, email, phone, message) and toggling which are required                                      | Validation enforced both client-side and server-side                                  |
| LEAD-3 | P0       | Spam protection (e.g., honeypot field and/or challenge mechanism) is applied to all public forms by default                                            | Automated spam submissions are filtered without user configuration                    |
| LEAD-4 | P0       | Submissions trigger configurable email notifications to designated recipients                                                                          | Notification delivery is retried on transient failure                                 |
| LEAD-5 | P0       | All submissions are stored as Leads with status (new/contacted/qualified/disqualified/converted) manageable in a lead inbox                            | Status changes are audit-logged                                                       |
| LEAD-6 | P0       | Leads can be exported (e.g., CSV)                                                                                                                      | Export respects tenant isolation — only leads for the requesting organization/project |
| LEAD-7 | P1       | Outbound webhook support on new-lead events                                                                                                            | Webhook payload includes source page/form/UTM context                                 |
| LEAD-8 | P1       | Lead capture supports UTM parameter capture and attribution to source page                                                                             | Leads inbox surfaces source page and campaign attribution                             |
| LEAD-9 | P2       | Native CRM integrations (beyond generic webhook)                                                                                                       | Deferred to Future Scope; webhook readiness is the MVP bridge                         |

---

# 22. Analytics

| ID    | Priority | Requirement                                                                                                                                                                              |
| ----- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ANA-1 | P0       | Google Analytics 4 (or equivalent) integration configurable per website                                                                                                                  |
| ANA-2 | P0       | Tracked events: page views, sessions, CTA clicks, form submissions (per form type), brochure downloads, gallery interactions, residence detail views, video engagement (play/completion) |
| ANA-3 | P0       | Analytics roll up hierarchically: Page → Website → Project → Organization, viewable at each level                                                                                        |
| ANA-4 | P1       | Basic in-platform analytics summary (not requiring the user to leave the product to view GA4) for top-line metrics                                                                       |
| ANA-5 | P0       | Analytics data and configuration are tenant-isolated — no cross-organization visibility                                                                                                  |
| ANA-6 | P2       | Advanced analytics (heatmaps, session replay, personalization signals) — Future Scope                                                                                                    |

---

# 23. Publishing

Lifecycle:

```
Draft (auto-saved, continuously edited)
  → Preview (shareable, non-indexed, always reflects latest draft)
    → Review (optional internal approval step per org policy)
      → Publish (promotes draft configuration to a new Published version)
        → Production (served via CDN/static+ISR, per Section 12)
          → Update (new draft created on top of current published version)
            → Republish (repeats the cycle; prior published version retained)
```

| ID    | Priority | Requirement                                                                                                        | Acceptance Criteria                                                                                 |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| PUB-1 | P0       | Draft and Published states are always distinct; editing never mutates the live site until Publish is invoked       | Live site unaffected by draft edits                                                                 |
| PUB-2 | P0       | Every Publish action creates a new immutable version, retaining prior versions                                     | Version history is listable                                                                         |
| PUB-3 | P0       | Rollback to any prior published version is supported                                                               | Rollback creates a new published version referencing prior configuration, not a destructive rewrite |
| PUB-4 | P0       | Preview URLs are shareable but not publicly indexable                                                              | `noindex` enforced; access may be gated by auth or signed token                                     |
| PUB-5 | P0       | Publish status and deployment status are visible to the user (e.g., "Publishing…", "Live", "Failed — see details") | Failure states are actionable, not silent                                                           |
| PUB-6 | P1       | Optional review/approval gate configurable per organization before a non-owner role can publish                    | Enforced server-side, not just hidden in UI                                                         |
| PUB-7 | P0       | Publishing triggers scoped cache invalidation (Section 12) and, when applicable, custom domain/SSL status checks   | No stale content served past the invalidation SLA                                                   |

---

# 24. Custom Domains

| ID    | Priority | Requirement                                                                                               | Acceptance Criteria                                            |
| ----- | -------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| DOM-1 | P0       | Every website has a default platform subdomain available immediately (e.g., `project.platformdomain.com`) | Works without any DNS setup                                    |
| DOM-2 | P0       | Organization can attach one or more custom domains to a website                                           | Domain attachment flow provides DNS records to configure       |
| DOM-3 | P0       | DNS verification is required before a custom domain goes live                                             | Unverified domains do not serve traffic                        |
| DOM-4 | P0       | SSL is automatically provisioned and renewed for verified custom domains                                  | No manual certificate management required by the user          |
| DOM-5 | P0       | Domain status (pending/verified/active/error) is clearly surfaced                                         | Errors include actionable next steps (e.g., "CNAME not found") |
| DOM-6 | P1       | Domain can be removed/detached, reverting to the platform subdomain                                       | No downtime for the platform subdomain during detachment       |
| DOM-7 | P1       | Redirect configuration (e.g., apex → www, or old domain → new domain)                                     | Redirects are enforced at the edge, not per-page               |

---

# 25. Multi-Tenancy

| ID   | Priority | Requirement                                                                                                                                                                     |
| ---- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MT-1 | P0       | Organization is the top-level tenant boundary; all data (Projects, Websites, Users, Assets, Analytics, Leads) is scoped to an Organization                                      |
| MT-2 | P0       | A single Organization supports multiple Projects, each with its own Website(s), content, and (optional) custom domain                                                           |
| MT-3 | P0       | Tenant isolation is enforced at the data-access layer, not only in the UI — no cross-organization data must be retrievable via API regardless of client-side controls           |
| MT-4 | P0       | Asset storage is namespaced per Organization/Project to prevent accidental cross-tenant reference or exposure                                                                   |
| MT-5 | P0       | Analytics data is isolated per tenant; no aggregate cross-tenant reporting is exposed to tenant users (platform-level aggregate reporting is an internal admin capability only) |
| MT-6 | P0       | Publishing and custom domains are configured and resolved per Website within a Project within an Organization, with no bleed-through of configuration between tenants           |
| MT-7 | P1       | Data model supports future billing/plan enforcement per Organization without structural rework (billing-readiness, not billing enforcement, in MVP)                             |

---

# 26. Roles and Permissions

Permission matrix (✅ full, ➕ create/edit own scope, 👁 view only, ❌ none). "Editor" and "Designer" are scoped to the Projects/Websites they are explicitly assigned to; Organization Owner/Admin have access across all Projects/Websites within their Organization by default.

| Capability                                   | Platform Admin           | Org Owner      | Org Admin      | Editor          | Designer    | Viewer |
| -------------------------------------------- | ------------------------ | -------------- | -------------- | --------------- | ----------- | ------ |
| Organization settings                        | ✅ (support scope)       | ✅             | ✅             | ❌              | ❌          | 👁      |
| Billing readiness settings                   | ❌                       | ✅             | ➕             | ❌              | ❌          | ❌     |
| User invite/role management                  | ✅ (support)             | ✅             | ✅             | ❌              | ❌          | ❌     |
| Create/archive Projects                      | ❌                       | ✅             | ✅             | ❌              | ❌          | ❌     |
| Create/archive Websites                      | ❌                       | ✅             | ✅             | ➕ (if granted) | ❌          | ❌     |
| Page structure (add/remove/reorder sections) | ❌                       | ✅             | ✅             | ✅              | 👁           | 👁      |
| Content (residences, amenities, etc.)        | ❌                       | ✅             | ✅             | ✅              | 👁           | 👁      |
| Media/asset library                          | ❌                       | ✅             | ✅             | ✅              | ➕ (upload) | 👁      |
| Design/theme tokens                          | ❌                       | ✅             | ✅             | 👁               | ✅          | 👁      |
| Animation configuration                      | ❌                       | ✅             | ✅             | 👁               | ✅          | 👁      |
| SEO configuration                            | ❌                       | ✅             | ✅             | ✅              | ❌          | 👁      |
| Forms/lead configuration                     | ❌                       | ✅             | ✅             | ✅              | ❌          | 👁      |
| Lead inbox view/export                       | ❌                       | ✅             | ✅             | ✅              | ❌          | 👁      |
| Analytics view                               | ✅ (platform-level only) | ✅             | ✅             | ✅              | 👁           | 👁      |
| Publish website                              | ❌                       | ✅             | ✅             | ➕ (if granted) | ❌          | ❌     |
| Custom domain configuration                  | ❌                       | ✅             | ✅             | ❌              | ❌          | ❌     |
| Manage platform templates/components         | ✅                       | ❌             | ❌             | ❌              | ❌          | ❌     |
| View audit logs                              | ✅ (platform)            | ✅ (org scope) | ✅ (org scope) | ❌              | ❌          | ❌     |

Note: "Editor: publish (if granted)" reflects the optional review/approval gate (PUB-6) — organizations may restrict publish rights to Owner/Admin only.

---

# 27. Backend Requirements

Backend stack direction: **NestJS + PostgreSQL + Prisma + Redis.** At the requirements level (no code/schema), the backend is responsible for:

| ID    | Priority | Responsibility                                                                                                                                                                                                  |
| ----- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BE-1  | P0       | Enforce tenant isolation and RBAC on every request, independent of client-side checks                                                                                                                           |
| BE-2  | P0       | Own the canonical structured content model (Organizations, Projects, Websites, Buildings, Residences, Floor Plans, Amenities, Galleries, Location, Timeline, Contact, Leads) and its draft/published versioning |
| BE-3  | P0       | Own the website configuration schema (pages/sections/blocks/bindings, theme references, animation profile references) as the contract consumed by the renderer                                                  |
| BE-4  | P0       | Manage the publishing lifecycle: version creation, promotion, rollback, cache-invalidation signaling to the rendering/CDN layer                                                                                 |
| BE-5  | P0       | Manage asset metadata and coordinate with object storage/CDN for the media pipeline (Section 29)                                                                                                                |
| BE-6  | P0       | Handle lead intake, validation, spam mitigation, notification dispatch, and webhook delivery                                                                                                                    |
| BE-7  | P0       | Emit and store audit log events (Section 35)                                                                                                                                                                    |
| BE-8  | P0       | Manage authentication, session lifecycle, and authorization policy evaluation                                                                                                                                   |
| BE-9  | P1       | Manage background job orchestration (publish jobs, media processing jobs, notification retries) backed by Redis-based queuing                                                                                   |
| BE-10 | P1       | Provide rate limiting and abuse protection at the API layer (Redis-backed)                                                                                                                                      |
| BE-11 | P0       | Expose the data needed for analytics aggregation at Organization/Project/Website/Page scope                                                                                                                     |

---

# 28. Frontend Requirements

### 28.1 Published Website Renderer

Stack direction: **Next.js, TypeScript, GSAP, ScrollTrigger, Lenis.**

| ID   | Priority | Requirement                                                                                                                                                                                                          |
| ---- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FE-1 | P0       | Renderer is data-driven: it interprets the website configuration schema (pages/sections/blocks/theme/animation profile) rather than containing hardcoded, project-specific page implementations                      |
| FE-2 | P0       | Renderer maps each supported section/block type to a corresponding presentational implementation, with animation behavior driven by the assigned preset + parameters, not bespoke per-project code                   |
| FE-3 | P0       | Smooth-scroll and scroll-triggered animation behavior is centrally implemented (e.g., via a shared scroll controller and animation-trigger layer) and reused across all section types, not reimplemented per section |
| FE-4 | P0       | Renderer respects `prefers-reduced-motion` and the builder's simulated reduced-motion flag by disabling/softening motion-heavy behavior                                                                              |
| FE-5 | P0       | Renderer is responsible for emitting semantic HTML, structured data, and metadata as configured (Sections 19-20), regardless of visual theme                                                                         |
| FE-6 | P1       | Renderer degrades gracefully when JavaScript fails to load or is disabled: core content and navigation remain accessible (progressive enhancement for animation layers)                                              |

### 28.2 Builder Application

Stack direction: **Next.js, TypeScript, shadcn/ui, dnd-kit.**

| ID    | Priority | Requirement                                                                                                                                                                    |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FE-7  | P0       | Builder operates exclusively on structured page/section/block configuration objects; it does not generate or allow editing of raw HTML                                         |
| FE-8  | P0       | Drag-and-drop reordering (sections, blocks, gallery items, timeline entries) is implemented consistently across all reorderable lists                                          |
| FE-9  | P0       | Builder's live canvas renders using the same section/component contract the production renderer consumes, to minimize builder/renderer visual drift                            |
| FE-10 | P1       | Builder UI itself meets baseline accessibility standards (keyboard operability, focus management) independent of the accessibility requirements it enforces on published sites |

---

# 29. Storage Requirements

Direction: **S3-compatible object storage + CDN.**

| ID    | Priority | Requirement                                                                                                                                                          |
| ----- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| STO-1 | P0       | All uploaded media is stored in object storage, namespaced per Organization/Project for isolation                                                                    |
| STO-2 | P0       | Asset metadata (dimensions, format, size, alt text, tags, upload timestamp, uploader) is tracked alongside the stored object                                         |
| STO-3 | P0       | Upload lifecycle: client-initiated upload (e.g., via signed URL) → processing (variant generation) → available-for-use state, with clear status surfaced to the user |
| STO-4 | P0       | Public delivery occurs via CDN URLs, never direct-from-storage-bucket URLs, to enable caching and access control                                                     |
| STO-5 | P0       | Image transformation (resize/format conversion) is performed as part of the pipeline and cached, not repeated per request                                            |
| STO-6 | P1       | Video storage supports larger file sizes and, where applicable, adaptive delivery                                                                                    |
| STO-7 | P0       | Deletion removes/invalidates CDN-cached copies within a defined SLA and checks for active references first (MED-8)                                                   |
| STO-8 | P0       | Access control on non-public assets (e.g., draft-only media, internal documents) is enforced via signed/expiring URLs                                                |

---

# 30. Caching and Background Jobs

Direction: **Redis** for the following (requirements only, no implementation):

| ID    | Priority | Requirement                                                                                                                                                                       |
| ----- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CAC-1 | P0       | Publishing jobs (configuration promotion, cache invalidation triggers) run as background jobs, not inline with the user's publish request, with status polling/feedback to the UI |
| CAC-2 | P0       | Media processing (variant generation) runs as background jobs with status tracked per asset                                                                                       |
| CAC-3 | P1       | Rate limiting for public-facing endpoints (forms, preview) is Redis-backed                                                                                                        |
| CAC-4 | P1       | Session-related and short-lived preview-state data may use Redis where a durable database record is unnecessary                                                                   |
| CAC-5 | P1       | Notification delivery (email on lead submission, webhook dispatch) is queued with retry/backoff                                                                                   |
| CAC-6 | P0       | Background job failures are visible to the responsible internal system (not silently dropped) and, where user-relevant (e.g., a failed publish), surfaced to the user             |

---

# 31. Security Requirements

| ID     | Priority | Requirement                                                                                                                                |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| SEC-1  | P0       | Authentication required for all builder/admin/API access; no anonymous write access anywhere in the platform                               |
| SEC-2  | P0       | Authorization (RBAC per Section 26) enforced server-side on every request; UI-level hiding of controls is never the sole enforcement       |
| SEC-3  | P0       | Tenant isolation enforced at the data-access layer (Section 25); cross-tenant data leakage is treated as a critical severity issue         |
| SEC-4  | P0       | All public API endpoints (including lead-submission forms) are rate-limited                                                                |
| SEC-5  | P0       | All user input is validated and sanitized server-side, independent of client-side validation                                               |
| SEC-6  | P0       | File uploads are validated by type/size and scanned/checked before being made servable; executable or disallowed file types are rejected   |
| SEC-7  | P0       | Non-public assets and preview URLs use signed, time-limited URLs rather than relying on obscurity                                          |
| SEC-8  | P0       | Secrets (API keys, credentials) are managed via a dedicated secrets management mechanism, never committed to code or exposed to the client |
| SEC-9  | P0       | CSRF protection on all state-changing authenticated requests                                                                               |
| SEC-10 | P0       | XSS protection: all user-generated/editable content rendered on published sites is escaped/sanitized appropriately for its context         |
| SEC-11 | P0       | SQL injection is prevented structurally via parameterized queries/ORM usage (Prisma) — no raw string-concatenated queries                  |
| SEC-12 | P0       | Audit logs record security-relevant events (Section 35) and are tamper-evident (append-only)                                               |
| SEC-13 | P0       | Session management uses secure, expiring sessions/tokens with appropriate invalidation on logout/role change                               |
| SEC-14 | P0       | Password security follows current best practice (strong hashing, breach-list checks where feasible, no plaintext storage)                  |
| SEC-15 | P1       | Backup and recovery procedures exist for the primary database and object storage, with defined RPO/RTO targets                             |

---

# 32. Performance Requirements

Cinematic quality must not come at the cost of speed. Measurable MVP targets for **published websites** (mobile, 75th percentile field or lab data, simulated mid-tier mobile network/device unless noted):

| Metric                                               | Target                                                                                                                                       |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| LCP (Largest Contentful Paint)                       | ≤ 2.5s                                                                                                                                       |
| CLS (Cumulative Layout Shift)                        | ≤ 0.1                                                                                                                                        |
| INP (Interaction to Next Paint)                      | ≤ 200ms                                                                                                                                      |
| JavaScript shipped on first load (per page, gzipped) | Kept to a defined budget; heavy animation libraries loaded/initialized only for above-the-fold and progressively for below-the-fold sections |
| Above-the-fold hero media                            | Optimized/responsive asset only; no full-resolution desktop asset served to mobile                                                           |
| Font loading                                         | No invisible-text flash; fallback stack defined; font-display strategy applied                                                               |
| Mobile performance                                   | Meets the same LCP/CLS/INP targets as desktop, not a relaxed tier                                                                            |

| ID     | Priority | Requirement                                                                                                                                |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| PERF-1 | P0       | Automated performance budgets are enforced in CI for template/reference pages (Section 33)                                                 |
| PERF-2 | P0       | Animation libraries and heavy interaction code are loaded/executed in a way that does not block initial render or degrade INP              |
| PERF-3 | P0       | Images and video follow the responsive/optimized delivery rules in Section 18 on every published page, with no per-project exception path  |
| PERF-4 | P0       | Above-the-fold content is prioritized (preloaded critical hero asset, deferred non-critical assets)                                        |
| PERF-5 | P1       | Performance regressions are flagged before publish where feasible (e.g., warning if an unoptimized/oversized asset is used above the fold) |

---

# 33. Testing Requirements

| ID    | Priority | Requirement                                                                                                                                                                                                                                                   |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TST-1 | P0       | Unit tests (Jest) cover backend business logic: RBAC/permission evaluation, publishing lifecycle/versioning, content validation, tenant isolation logic                                                                                                       |
| TST-2 | P0       | E2E tests (Playwright) cover core user journeys: organization/project/website creation, content editing, design/animation configuration, preview, publish, domain setup, lead submission                                                                      |
| TST-3 | P0       | Visual regression (screenshot-based) testing covers Desktop/Tablet/Mobile for: hero sections, navigation (including mobile menu), core animations (at rest and post-trigger states), residence listing/detail pages, galleries, and general responsive layout |
| TST-4 | P0       | Accessibility checks (automated, e.g., axe-core in CI) run against rendered pages for core templates                                                                                                                                                          |
| TST-5 | P0       | Reduced-motion mode is explicitly covered by automated tests to confirm animation-heavy sections degrade correctly                                                                                                                                            |
| TST-6 | P1       | Performance budgets (Section 32) are asserted in CI against representative template pages                                                                                                                                                                     |
| TST-7 | P0       | Tenant isolation is explicitly tested (attempted cross-tenant access must fail)                                                                                                                                                                               |

---

# 34. Admin Requirements

Platform Admin console must support:

| ID     | Priority | Requirement                                                                                                       |
| ------ | -------- | ----------------------------------------------------------------------------------------------------------------- |
| ADM-1  | P0       | View/manage Organizations (status, suspension, support access with audit trail)                                   |
| ADM-2  | P0       | View/manage Users across the platform for support/abuse purposes, scoped and audited                              |
| ADM-3  | P0       | View Projects/Websites across tenants for support purposes (not routine content access)                           |
| ADM-4  | P0       | Manage the platform-wide Template library (create/update/version/retire templates)                                |
| ADM-5  | P0       | Manage the platform-wide Component/Section library made available to the builder                                  |
| ADM-6  | P1       | Manage platform-wide Theme presets offered as starting points                                                     |
| ADM-7  | P0       | Manage/oversee Asset storage at a platform operational level (e.g., storage health, not routine content browsing) |
| ADM-8  | P0       | View/manage custom Domain and SSL status across tenants for support/troubleshooting                               |
| ADM-9  | P0       | View/manage Publishing status/failures across tenants for support/troubleshooting                                 |
| ADM-10 | P0       | Manage system settings (platform-level configuration, feature flags)                                              |
| ADM-11 | P0       | View Audit logs (platform-wide and, on request, org-scoped)                                                       |

---

# 35. Audit Logging

Minimum events to record (actor, timestamp, tenant/scope, before/after state where applicable):

| Category            | Events                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| Access              | Login, logout, failed login attempts                                                                        |
| User/Org management | User creation, user deletion, invitation, role/permission changes, organization creation/settings changes   |
| Content             | Content entity create/update/delete (residences, amenities, etc.), including draft-vs-published transitions |
| Design              | Theme/token changes                                                                                         |
| Animation           | Animation profile/preset assignment changes                                                                 |
| Publishing          | Publish action, rollback action, publish failure                                                            |
| Domains             | Domain add/remove, verification status changes                                                              |
| Assets              | Asset upload, asset deletion                                                                                |
| Admin               | Platform admin support/impersonation actions, template/component library changes                            |

| ID    | Priority | Requirement                                                                                                          |
| ----- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| AUD-1 | P0       | Audit log entries are immutable/append-only                                                                          |
| AUD-2 | P0       | Audit log entries are queryable by organization admins for their own org scope, and by platform admins across scopes |
| AUD-3 | P1       | Audit log retention policy is defined and configurable at the platform level                                         |

---

# 36. Versioning

| ID    | Priority | Requirement                                                                                                                                                                                                                                       |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| VER-1 | P0       | Website configuration (pages/sections/blocks/bindings) supports Draft and Published states, with every Publish creating a new immutable version                                                                                                   |
| VER-2 | P0       | Theme and Animation Profile changes are versioned independently but referenced consistently by each website configuration version, so rollback of the website configuration also restores the theme/animation state that was live at that version |
| VER-3 | P0       | Content entities (residences, amenities, etc.) support draft edits distinct from currently published values                                                                                                                                       |
| VER-4 | P0       | Templates are versioned; a website is pinned to the template version it was created/last-updated from (Section 14, TPL-7)                                                                                                                         |
| VER-5 | P0       | Rollback to any previous published version is available and produces a new published version (never destructive in-place overwrite)                                                                                                               |
| VER-6 | P1       | Version history displays a human-readable summary of what changed (at least: who published, when, and a coarse diff of affected pages/entities)                                                                                                   |

---

# 37. Observability

| ID    | Priority | Requirement                                                                                                                                           |
| ----- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| OBS-1 | P0       | Centralized logging across backend services, correlated by request/trace ID                                                                           |
| OBS-2 | P0       | Application metrics (API latency/error rate, publish job duration/failure rate, media processing duration/failure rate) are collected and dashboarded |
| OBS-3 | P0       | Alerting is configured for critical failure modes (publish failures, elevated error rates, domain/SSL provisioning failures)                          |
| OBS-4 | P1       | Real-user monitoring (Core Web Vitals) is collected from published websites in aggregate to detect performance regressions                            |
| OBS-5 | P1       | Background job queues are observable (depth, failure rate, retry counts)                                                                              |

---

# 38. Future Scope

Explicitly deferred beyond MVP (tracked for later prioritization, not designed against yet):

- AI-assisted website generation from a brief/prompt.
- AI copywriting assistance for content fields.
- AI image generation/enhancement for renders and staging.
- An advanced, more expressive animation/timeline editor for power users.
- A marketplace for third-party templates/components/themes.
- White-label/reseller SaaS mode.
- Billing and subscription enforcement (usage metering, plan gating, payment processing).
- Real-time multi-user collaborative editing.
- Commenting and structured approval workflows beyond a simple publish gate.
- Deeper native CRM integrations (beyond generic webhooks).
- A/B testing and on-site personalization.
- Advanced analytics: heatmaps, session replay, funnel analysis.
- Multi-language/i18n website support (the content and page model should avoid decisions that would make this structurally difficult later, without building it now).
- Native mobile companion app (e.g., for lead management on the go).
- Advanced third-party integrations (marketing automation, ad platforms, data warehouses).

---

# 39. MVP Acceptance Criteria

The MVP is considered complete when:

1. A new user can create an Organization, invite a teammate with a distinct role, and both can sign in with role-appropriate access (Sections 6-7, 26).
2. A user can create a Project, select a Website Template, and land in a builder populated with a working starter site (Sections 8, 14).
3. A user can fully populate all P0 content entities in Section 13 for a project without engineering assistance.
4. A user can reorder/hide sections, configure responsive overrides, assign animation presets, and adjust theme tokens entirely through the builder UI with zero code input (Sections 11, 15-17).
5. A user can preview the draft site across Desktop/Tablet/Mobile, including a reduced-motion simulation, before publishing (Sections 11, 16-17).
6. A user can configure per-page SEO fields and confirm structured data is populated automatically from content (Section 19).
7. A user can publish the site, see it live on a platform subdomain, and subsequently attach and verify a custom domain with automatic SSL (Sections 23-24).
8. A published page meets the Core Web Vitals targets in Section 32 in automated CI checks against a representative template.
9. A published page passes automated accessibility checks (Section 33, TST-4) and correctly honors reduced motion.
10. A submitted enquiry form results in a stored Lead, an email notification, and appears in the lead inbox with correct status management (Section 21).
11. Rollback to a previous published version succeeds and is verified via E2E test (Sections 23, 36).
12. Tenant isolation is verified by automated tests attempting (and failing) cross-tenant data access (Section 33, TST-7).
13. Platform Admin can view/manage organizations, templates, and domains/publishing status across tenants for support purposes (Section 34).
14. All events in Section 35's minimum list are being recorded and queryable.

---

# 40. Open Product Decisions

Decisions that should be resolved before database/architecture implementation begins:

| #   | Decision                                                                                                                                     | Why it matters                                                                                        | Recommendation direction (non-binding)                                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Can one Project have multiple Websites (e.g., a microsite + main site), or is Project:Website strictly 1:1 for MVP?                          | Affects the core data model and routing/domain assignment logic                                       | Model as 1:many from day one even if MVP UX only exposes one, to avoid a breaking migration later                                  |
| 2   | Does the optional publish-approval gate (PUB-6) ship in MVP or Future Scope?                                                                 | Affects publishing state machine complexity                                                           | Lean toward a minimal binary flag in MVP (org requires approval: yes/no) rather than a full workflow engine                        |
| 3   | What is the exact initial set of industry Website Templates (how many, which sub-styles) for MVP launch?                                     | Affects content/design team workload and the section/component library scope                          | Recommend starting with one strong, flexible template covering the full page list in Section 10.1 rather than several shallow ones |
| 4   | Should Residence "price" display be a first-class public field, or always agent-mediated ("Price on request")?                               | Real-estate norms vary by market/region; affects the Residence content model and legal considerations | Make it a configurable per-project toggle rather than a hardcoded choice                                                           |
| 5   | Where is the line between "Editor" and "Designer" on borderline capabilities (e.g., section-level layout variant selection)?                 | Affects the permission matrix (Section 26) and builder UI gating                                      | Recommend Designer owns theme/animation defaults; Editor owns per-instance content and structural section choices                  |
| 6   | What object-storage provider and CDN pairing is used, and is it single-region or multi-region for MVP?                                       | Affects Section 29/12 latency assumptions and cost model                                              | Recommend starting single-region with a global CDN edge layer, revisit multi-region post-MVP                                       |
| 7   | Is a lightweight in-platform analytics view (ANA-4) required for MVP, or is GA4-only acceptable at launch?                                   | Affects backend aggregation work required for MVP                                                     | Recommend deferring to P1/fast-follow; GA4 integration alone can satisfy initial launch                                            |
| 8   | What is the exact SLA target for publish-to-live latency and cache invalidation?                                                             | Directly shapes the rendering/caching architecture (Section 12, REN-7)                                | Propose a concrete target (e.g., "publish visible within 60 seconds for 95% of publishes") before backend design                   |
| 9   | How is "template version pinning" (VER-4/TPL-7) surfaced to users — do they get notified of available template updates, and can they opt in? | Affects both data model and UX for template upgrades                                                  | Recommend a simple "update available" notice with manual opt-in merge, not automatic migration                                     |
| 10  | Should Floor Plan structured room/dimension data (Section 13) be required at MVP, or is an image/PDF-only floor plan acceptable initially?   | Affects content-entry burden vs. potential future structured search/filter features                   | Recommend image/PDF-only for MVP; keep the schema open to add structured dimensions later without migration pain                   |

---

# Reference Website Analysis

The reference site (era-residence.com, downloaded as static HTML with all interactive assets served from Webflow's CDN) was inspected structurally only — page markup, class naming, `data-*` attributes, and third-party script includes. No CSS, JavaScript, imagery, copy, or branding from the reference site is used in, or should ever be used in, this product. The analysis below distills _category-level_ patterns common to this genre of premium real-estate site, expressed as generalizable product requirements (already reflected above), not as implementation instructions.

### Observed Patterns

- **Page inventory:** Home, a filterable Residences/Apartments listing (with per-unit detail pages), and Contact — a minimal, focused page set consistent with the MVP page list in Section 10.1.
- **Per-unit detail pages** exist as individually addressable pages (one per residence/apartment), each reusing the same structural template with different bound content (floor plan image, specs, gallery) — validating the Section 13/11 content-binding and reusable-section approach rather than one-off hand-built pages per unit.
- **Structured data:** the homepage embeds a rich JSON-LD graph describing the development as an `ApartmentComplex`, with nested `Accommodation` and `LocationFeatureSpecification` entries for amenities and unit types. This directly validates SEO-3 (auto-generating structured data from structured content, e.g., Residences and Amenities, rather than hand-authoring per page).
- **Section-based composition:** pages are built from clearly delineated `<section>` blocks, each independently themed (light/dark/color/brand variants) — supporting the section-as-unit-of-composition model in Section 11 and the per-section theme-variant concept implicit in Section 15.
- **Filtering/sorting on the listing page:** unit listings carry attributes (bedroom count, floor type/category) used for client-side filtering and sorting — validating the Residence content model's need for structured, filterable fields (bedrooms, type/status) rather than free-text descriptions.
- **Lead form design:** the contact form uses a small set of required fields (name, email, phone, message), a hidden honeypot-style field, and hidden UTM/source-tracking fields submitted alongside the form — directly informing LEAD-1/2/3/8.

### Interaction and Animation Patterns

- **Scroll-triggered reveal:** text and image elements are marked for progressive reveal as they enter the viewport (line-by-line text reveal, image mask reveals), consistent with the "Reveal" preset category in Section 16.
- **Parallax layers:** background and foreground imagery move at different scroll speeds, and a distinct "slow scroll" mode is applied to specific sections — consistent with the Parallax preset category and the idea of a per-section animation-profile override (ANI-2/ANI-3).
- **Section-level pinning/snapping:** certain sections are configured to pin or snap during scroll — consistent with the "Scroll-driven" preset category (pinned section, scroll-snapped section).
- **Micro-interactions:** a pulsing map-pin indicator, circular icon buttons with hover states, and lightbox-based gallery/image viewing — consistent with the Hover/interaction preset category and the Gallery content entity's need for a lightbox-style presentation mode.
- **Tabbed/sliding sub-navigation:** used for switching between related content groups (e.g., unit categories, amenity slides) within a single page — consistent with treating "tabs" as a first-class block/component pattern in the section library.
- **Page and section transitions:** smooth-scroll (via a dedicated scroll library) and animated transitions between internal page navigations — consistent with FE-3 (a centrally implemented scroll/animation controller shared across section types) and the "page transition" preset in Section 16.
- **Responsive breakpoint classes:** distinct "desktop-only" and "mobile-only" utility markers are used to show/hide specific elements per breakpoint — consistent with the breakpoint-override model in Section 17 (RES-3).

### Content Patterns

- Amenities are presented narratively (title + description + supporting image/icon) rather than as a plain checklist — informing the Amenity entity's need for a description field and media, not just a name (Section 13).
- Construction/roadmap-style milestone content and a distances/points-of-interest list near the location content were present in structured, list-like form — informing the Timeline and Location entities' list-of-entries shape (Section 13).
- Media is heavily used for storytelling (large hero imagery/video, ambient looping background video, high-resolution renders) with a consistent visual "camera angle" numbering convention across images — informing the general expectation that the Gallery/Media system must handle large numbers of high-resolution images and looping ambient video gracefully (Section 18).

### Responsive Patterns

- Distinct desktop/mobile visibility utility classes and breakpoint-scoped spacing tokens were observed, rather than a single fluid layout handling every case — supporting the product decision (Section 17) to offer explicit breakpoint overrides on top of a fluid default, rather than promising a single "automatically perfect" responsive system for every section type.

### Performance Observations

- Responsive image delivery via `srcset`/`sizes` with multiple resolution variants (500w/800w/1080w/1600w/original) and modern formats (WebP, AVIF for video posters) was used consistently — directly validating MED-3's requirement for automatic responsive-variant and modern-format generation.
- Video is delivered with an explicit poster image and a modern container format, with `playsinline`/`muted`/`loop` semantics for ambient background video — validating MED-5/MED-6.
- Above-the-fold hero assets were marked for eager loading while the broader page relies on lazy loading — validating PERF-4's above-the-fold prioritization requirement.
- Heavy animation/scroll libraries were loaded as render-blocking-adjacent third-party scripts at the end of the document — a pattern our renderer should improve upon, not copy (informing FE-3/PERF-2's requirement that the animation layer must not block initial render or degrade interactivity metrics).

### Generalizable Lessons

1. A small, focused page set (home, listing, detail, contact) executed with high craft outperforms a large, shallow page set — reinforcing the Section 10 MVP page scope.
2. Reusable, content-bound section templates (one "residence detail" template serving every unit) are what make this achievable without per-page custom builds — the central justification for Sections 11 and 13's content-binding model.
3. Structured content (unit specs, amenity lists, location POIs) is what enables both rich SEO structured data and clean filtering/sorting UI — reinforcing why the platform must model these as structured entities (Section 13) rather than free-text blocks.
4. Motion is used purposefully and section-by-section (not uniformly blasted across the whole page) — reinforcing the per-section, opt-out-capable animation model in Section 16 (ANI-2) rather than a single global "animate everything" switch.
5. Lead capture is lightweight (few fields) with invisible spam/attribution mechanisms rather than user-facing friction — reinforcing LEAD-2/3/8.

### What We Should NOT Copy

- The reference site's specific visual identity, copy, imagery, logo, or brand assets — these are proprietary to that business and must never appear in the product, its templates, or its marketing.
- Its specific Webflow-generated CSS class names, component structure, or any literal markup/script — the product's section/component/theme model must be designed independently against our own schema and renderer, per Principle 13.
- Its exact technology choices as a mandate — GSAP/ScrollTrigger/Lenis are directionally adopted per this document's stated frontend direction (Section 28) because they are well-suited to the interaction quality bar, not because the reference site used them; the specific library versions/APIs used by the reference site are not a constraint on our implementation.
- A single hardcoded page-per-project approach — the reference site _is_ a one-off, hand-built site; our platform must generalize what it does into reusable, data-driven configuration (Principle 11), never replicate the idea of hand-building each site.

---

# Important Product Principles (Enforced Throughout This Document)

1. Content is separated from presentation (Sections 2, 9, 13).
2. Website structure is configurable, not hardcoded (Section 11).
3. The builder is built from reusable components/sections (Sections 11, 14).
4. No coding knowledge is required of any user role (Sections 11, 15, 16).
5. Animations are configured through bounded presets, never authored as code (Section 16).
6. Published websites must be fast under measurable targets (Section 32).
7. SEO is first-class, not an afterthought (Section 19).
8. Accessibility is first-class, including mandatory reduced-motion support (Section 20).
9. The architecture is multi-tenant from day one (Section 25).
10. The system is designed to support multiple websites/projects per organization from day one (Sections 9, 25).
11. The website renderer is decoupled from the builder — it only ever consumes structured configuration (Sections 9, 12, 28).
12. The product is extensible without full-platform rewrites (templates, sections, presets are additive, versioned units — Sections 14, 36).
13. The downloaded reference website is a research input only, never the application's source architecture (see "Reference Website Analysis").
14. MVP avoids unnecessary complexity (Section 10.7, Section 38).
15. MVP favors scalable foundations (multi-tenant data model, versioned configuration, decoupled renderer) over premature enterprise features (billing enforcement, AI, marketplace, i18n) — Sections 10, 38.
