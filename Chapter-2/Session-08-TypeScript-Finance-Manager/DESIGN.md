# Design

<!-- impeccable:design-schema 1 -->

Recorded from the built world (ground truth), seed `751027cb`, mode Operate, canon direction.

## Direction

A quiet, trustworthy money dashboard. It owns **calm legibility and tabular numbers**; it refuses skeuomorphic clutter and gamified color noise. Craft bar: Stripe Dashboard, Linear, Monarch Money.

## Color

Light mode (daytime use on laptop/phone). Restrained strategy: near-white ground + ink text + one indigo accent, with green/red as **semantic roles** (SRS requirement), never decoration.

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#F7F8FA` | page ground |
| `--surface` | `#FFFFFF` | cards, panels |
| `--ink` | `#1A1D23` | primary text |
| `--ink-soft` | `#5A6372` | secondary text (5.6:1 on white) |
| `--line` | `#E4E7EC` | hairline borders, tracks |
| `--accent` | `#4F46E5` | primary button, focus, category bars |
| `--income` | `#15803D` | income / positive balance (5.3:1) |
| `--expense` | `#B91C1C` | expense / over-budget alert (6.4:1) |

Green and red are always paired with text/icon (e.g. "Vượt hạn mức!" + warning glyph), so state is never color-only.

## Type

System sans stack (`-apple-system, Segoe UI, Roboto…`) — no webfont dependency, fast and offline-safe, appropriate for an Operate surface. Numbers use `font-variant-numeric: tabular-nums` with `-0.01em` tracking so columns align. Scale: balance 2.4rem → stat 2rem → h2 1.05rem → body 1rem → meta 0.8–0.85rem. Weights 550/600/650/700 for steps.

## Space & shape

Spacing scale 6/12/18/26/40px. Radius 14px cards, 9px controls. Shadows carry offset + blur (`0 1px 2px`, `0 4px 12px`). Generous separation between sections, tight grouping within.

## Layout

- Sticky translucent header (blur) with brand + Month picker.
- Dashboard: 3 stat cards (balance wider) → full-width budget progress bar.
- Two columns: transactions (form + history) | categories (form + list). Collapses to one column ≤760px (NFR-5).
- Multi-month summary table at the base.

## Motion

One authored moment: the budget/category progress bars ease their fill on state change (`cubic-bezier(0.22,1,0.36,1)`, 0.5s). Width transition is deliberate for progress semantics (rounded pill ends would distort under `scaleX`).

## Icons

Hand-drawn inline SVG (wallet, up/down arrows, edit, trash, warning) at consistent 2px stroke. No emoji, no icon font.

## States

Empty ("Chưa có giao dịch nào…"), inline validation errors under forms, hover on rows/buttons, focus outline (2px accent). Over-budget is the signature state: red bar + red text + warning glyph.
