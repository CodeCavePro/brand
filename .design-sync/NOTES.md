# design-sync notes — CODECAVE

## Shape: `foundations`, not `package` or `storybook`

This repo has **no code**, and neither does the design system. `codecave.pro` (the production
site, `CodeCavePro/codecave.pro`) is **Astro 7 + Vue 3 + Tailwind 4** — 61 `.astro`, 45 `.vue`,
**zero React**, no Storybook.

## `ds-bundle/` is half derived, half authored

The upload directory holds two kinds of file, and conflating them cost us a silent regression.

**Derived (gitignored, 500K).** `colors_and_type.css`, `tokens/*.ts` and `fonts/*` are
byte-for-byte copies of tracked files under `docs/`. They are ignored because tracking them
would put a second copy of the Satoshi binaries in the history and make every palette change
a two-commit job.

**Authored (tracked, 32K).** `README.md`, `styles.css`, `guidelines/brand.md` and the four
`components/Foundations/*/*.html` cards exist **nowhere else in this repo** and nothing
regenerates them. They were untracked until 2026-08-20 — source files with no backup, invisible
to review.

### Before every push

```sh
sh docs/tools/build-ds-bundle.sh
```

It refreshes the derived half and proves every pair byte-identical. Skipping it is not a
theoretical risk: at the 2026-08-20 sync the bundle stylesheet was two real declarations behind
`docs/` — `flex: none` on the checkbox box and `border-radius: 0.25rem` on the chip, both shape
fixes — because a plain copy going stale breaks nothing and uploads cleanly.
