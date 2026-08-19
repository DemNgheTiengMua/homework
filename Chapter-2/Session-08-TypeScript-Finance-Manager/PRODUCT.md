# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + TypeScript (strict mode, no `any`). ES Modules. Data persisted in `localStorage`. Chosen by the user to satisfy the SRS rubric (NFR-1 strict TS 8pts, NFR-2 Vite 2pts). Runs via `npm install` then `npm run dev`.

## Users

A single student/individual tracking their own personal income and expenses on a laptop or phone. Also the exam context: the student must be able to explain every part of the code 1:1 to a teacher. Expected skill level is beginner–intermediate, so code clarity and explainability outrank cleverness.

## Product Purpose

A Personal Finance Manager ("E-Wallet"). Lets the user record income/expense transactions, organize them into categories with spending limits, filter by month/year, see a dashboard of balance and totals, and get visual warnings when a category exceeds its limit. It exists as a graded lab assignment (Module 02 SRS) — success = all five feature groups (F01–F05) work, TypeScript is strict, data survives reload, and the author can defend the design.

## Positioning

Month-scoped budgeting: each month's data is stored and viewed independently in localStorage, so the dashboard, history, and reports all pivot on a single Month/Year picker. Per-category limits drive an over-budget alert that is the app's signature moment.

## Operating Context

Opened in a browser via a local dev server (Vite). No backend, no accounts — everything is local. Content language is Vietnamese; code identifiers and attribute values in English (project convention). 2-space indentation.

## Capabilities and Constraints

- **F01 Dashboard:** current balance (realtime), total income + total expense for selected month, progress vs total budget with Đạt/Vượt text.
- **F02 Categories:** add / edit / delete (with constraint check), per-category spending limit, list showing limit + spent.
- **F03 Transactions:** form (amount, category, note, date), income/expense type, history sorted newest-first, delete updates dashboard + categories.
- **F04 Time filter:** Month/Year picker; dashboard, history, stats change with it; each month stored separately in localStorage.
- **F05 Alerts & summary:** red/text warning when a category exceeds its limit; multi-month summary table (≥2 months).
- **NFR:** strict TS interfaces no `any`; Vite dev server; autosave to localStorage on every change; modular files (storage, category, transaction, ui, app); responsive Grid/Flex with mobile column layout; green = income/balance, red = expense/alert; seed data on first run.
- **EXTRA:** input validation (negative/positive, empty category, invalid limit); important comments + README; clean UI, no console errors.

## Brand Commitments

Name shown to user: "Ví Của Tôi" / E-Wallet. Vietnamese UI copy. Green for income/positive balance, red for expense/alerts is a fixed SRS requirement.

## Evidence on Hand

Source SRS: `Module 02 – Software Requirement Specification (SRS).docx.md`. No real user data — seed/sample transactions are authored and clearly synthetic. No real financial figures to preserve.

## Product Principles

1. **Explainable over clever** — the author must defend every line; prefer plain, well-commented code.
2. **Month is the lens** — one Month/Year picker drives every view.
3. **The limit is the story** — per-category budgets and their over-budget alert are the emotional core.
4. **Local and durable** — every action autosaves; a reload never loses data.
5. **Spec-faithful** — F01–F05 and every NFR are met and traceable to the rubric.

## Accessibility & Inclusion

Color is an SRS requirement (green/red) but must not be the only signal — pair with text/icons (e.g. "Vượt" label) so the over-budget state is not color-only.
