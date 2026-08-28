# design-sync notes — CODECAVE

## Shape: `foundations`, not `package` or `storybook`

This repo has **no code**, and neither does the design system. `codecave.pro` (the production
site, `CodeCavePro/codecave.pro`) is **Astro 7 + Vue 3 + Tailwind 4** — 61 `.astro`, 45 `.vue`,
**zero React**, no Storybook.

## `ds-bundle/` holds three kinds of file

The split is not visible from the file names, and conflating two of them cost us a silent
regression.

**Derived (gitignored).** `colors_and_type.css`, `tokens/*.ts`, `fonts/*`, and since
2026-08-24 `tw-bridge.css`, `vendor/**` and `compiled/*.js` are byte-for-byte copies of tracked
files under `docs/`. They are ignored because tracking them would put a second copy of the
Satoshi binaries in the history and make every palette change a two-commit job.

**Authored (tracked, 32K).** `README.md`, `styles.css`, `guidelines/brand.md` and the four
`components/Foundations/*/*.html` cards exist **nowhere else in this repo** and nothing
regenerates them. They were untracked until 2026-08-20 — source files with no backup, invisible
to review.

**Generated (gitignored).** `components/Components/*/*.html` — seven component cards written by
`tools/build-ds-components.mjs` from the `STORIES` table inside it. The table is the
tracked source; the cards are output.

## The Components cards mount the real component

This is the part worth understanding before editing one. A Components card contains no markup
resembling the component. It carries an import map and a `<script type="module">` that mounts
`compiled/<Name>.js` — the same esbuild bundle the storybook mounts, built from codecave.pro's
own capture with `vue` and `gsap` left external. So the card is a *record* of the shipped
component, by construction, and cannot drift into a flattering approximation.

Consequences:

- Change what a card **demonstrates** by editing `STORIES` and re-running the generator.
- Change what it **renders** in codecave.pro, recapture, rebuild the storybook, re-run both
  scripts here.
- Two stylesheets are load-bearing. `styles.css` carries the tokens; `tw-bridge.css` carries the
  Tailwind utilities the templates use, scoped to `.sb-canvas`. Drop the second and every
  component renders unstyled **with no error at all** — the same failure a consumer hits when it
  forgets the `@source` line for `node_modules` (CCWEB2-360).
- These cards need ES modules and import maps in the rendering pane. That is not something this
  repo can verify; if a card ever shows an empty canvas in Claude Design while it renders locally
  off `http://localhost:8130`, that is the reason, and the answer is to fall back to static
  Foundations-style cards rather than to hand-draw the components.

### Before every push

```sh
npm run build:storybook && npm run check:design-sync
```

The first refreshes the derived half and proves every pair byte-identical; the second regenerates
the cards and refuses to run if a bundle it needs is missing. Skipping the first is not a
theoretical risk: at the 2026-08-20 sync the bundle stylesheet was two real declarations behind
`docs/` — `flex: none` on the checkbox box and `border-radius: 0.25rem` on the chip, both shape
fixes — because a plain copy going stale breaks nothing and uploads cleanly. A stale
`compiled/*.js` fails the same silent way, one layer further in: the card renders an old
component, correctly, and says nothing.
