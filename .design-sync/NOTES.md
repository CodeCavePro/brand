# design-sync notes — CODECAVE

## Shape: `foundations`, not `package` or `storybook`

This repo has **no code**, and neither does the design system. `codecave.pro` (the production
site, `CodeCavePro/codecave.pro`) is **Astro 7 + Vue 3 + Tailwind 4** — 61 `.astro`, 45 `.vue`,
**zero React**, no Storybook, on every remote branch (verified after a `git fetch --all` on
2026-08-07, all 6 branches).

Claude Design's runtime renders React from `window.<globalName>.*`, so there is nothing to bundle.
This sync therefore ships **no `_ds_bundle.js` and no `components/*.d.ts`** — inventing an API
contract for components that don't exist is the exact failure the skill warns about. The converter
(`package-build.mjs`) was never run; the layout is hand-produced and `_ds_sync.json` is
deliberately omitted, so the next sync re-verifies everything. That is correct, not a defect.

## Where the tokens come from

`codecave.pro/src/styles/global.css` is the source of truth — it carries the raw ramp on `:root`
and the semantic layer in Tailwind 4's `@theme`. Values were cross-checked against computed styles
on <https://codecave.gay> and matched exactly.

Do **not** re-derive tokens from screenshots. Read `global.css`, then confirm against the live site
with the browser tools — that path costs nothing and is exact.

## Figma is effectively unavailable

The Figma MCP account (`Salaros`) holds a **View** seat, whose tool-call quota is exhausted in
about 7 calls. `get_variable_defs` returns "nothing selected" (falls through to the desktop bridge)
and `get_metadata` fails with an SSE parse error on large nodes; only `get_screenshot` works, and
board-level nodes (e.g. `534-10` at 13733×11356) are illegible at the default 1024px cap.

Nothing in this sync derives from Figma. If the seat is upgraded, the frames worth reading are
`8525-40752`, `8525-43354`, `8525-32231` in file `IvwZHE6Iuo243QkdtR96L3`.

## Font: Satoshi, one real cut

Satoshi is the brand font (confirmed by Yaroslav, 2026-08-07 — it replaced Montserrat; an earlier
instruction to switch to Inter was withdrawn). Production self-hosts a single
`Satoshi-Regular.ttf` declared with **no `font-weight` descriptor**, so the 300 and 700 weights it
renders are browser-synthesized. `fonts/fonts.css` in the bundle declares `font-weight: 400`
explicitly so the synthesis is at least deliberate.

Outstanding repo issue: the logo wordmarks in `src/` are outlined paths drawn in **Montserrat
Bold**, so every PNG in `logos/` is still Montserrat-shaped despite the README naming Satoshi.

## Re-sync risks

- **Don't let a future run "fix" the missing bundle** by authoring React components. That was
  offered and declined (2026-08-07): it would produce components that exist in no CODECAVE repo,
  so designs would not map onto shippable Astro/Vue. Revisit only if a real React library appears.
- The `docs/` folder is a **separate deliverable** (GitHub Pages), not part of the sync. It mirrors
  `ds-bundle/` but flattens `components/Foundations/<N>/<N>.html` to `foundations/<n>.html` and
  rewrites the stylesheet link from `../../../styles.css` to `../styles.css`. If the cards change,
  rebuild both.
- `ds-bundle/` is generated output and is gitignored — regenerate it, don't commit it.
- The stale colour table in the root `README.md` (`#9D26FF`, `#212121`, `#ABB4BD`, `#CFD4DA`,
  `#F3F6F9`) matches nothing in the shipped tokens; only `#5F20FE` survives. Left alone
  deliberately — rewriting stated brand intent from an implementation is the owner's call.

## Project

`37e536aa-cd72-45fc-859d-066404b92daf` — "CODECAVE Design System",
<https://claude.ai/design/p/37e536aa-cd72-45fc-859d-066404b92daf>. 13 files, verified by
`list_files` after upload.
