# TODO

Open work on **this repository**. Two neighbouring lists exist and this one is
neither of them:

- [WEBSITE-REVIEW.md](/WEBSITE-REVIEW.md) — designer-facing remarks on
  `codecave.pro/src`. Those are filed in Jira under
  [CCWEB2](https://codecave.atlassian.net/browse/CCWEB2) and belong to the
  website team.
- [docs/DESIGN.md](/docs/DESIGN.md) §"Known divergences" — places where the
  documented system and the shipped site knowingly disagree, with the reason.

What follows is work the brand repo owes itself. Nothing here is a defect on the
live site.

**Only open work is listed here.** Items are deleted when they are done rather
than moved to a "closed" section — git history is the record of what changed and
why, and a list that accumulates finished work stops being a list of what to do.
Of the six below: one is a standing check, one is real work this repo owes,
three need a decision — §4 is the largest and has its own document, §5 needs a
designer rather than an engineer — and one is somebody else's.

---

## 1. Keep the Tailwind-collision check running

The `.vue` sources in `docs/source_examples/` reference custom properties that
the site's own `global.css` never declares — they resolve only because the
Tailwind build happens to emit a default of the same name. Lift such a
component out of that build and the value changes or disappears.

```bash
comm -23 <(grep -rhoE "var\(--[a-zA-Z0-9-]+" docs/source_examples --include=*.vue | sed 's/var(//' | sort -u) <(grep -oE "^\s*--[a-zA-Z0-9-]+" docs/source_examples/styles/global.css | tr -d ' ' | sort -u)
```

It returns nothing today. It is listed because it has to keep being run, and
because two things about its output need knowing before it is trusted.

*It over-reports.* Point it at the full website checkout rather than the
captures and it also returns `--duration`, which
`homepage/projects-carousel.vue` declares itself inside its own scoped block. A
component-local custom property is not an undeclared dependency, so every hit
needs a glance at where the name is defined before it counts.

*It under-reports, structurally.* It compares what the `.vue` files *reference*
against what `global.css` *declares*, so it only ever finds names the site
consumes. It cannot see a name this package publishes that Tailwind also defines
but no SFC happens to use — the complement, diffing this package's `:root`
against Tailwind's default theme, has no check at all.

**To do:** run it against the website checkout, not just the captures, whenever
either moves. Write the complementary check if the token layer grows.

## 2. `docs/source_examples/` has drifted from the site

The captures are not a snapshot of today's `codecave.pro/src`. Diffed against
that checkout's `development` HEAD on 2026-08-20 (line endings normalised), nine
of nineteen files differ:

| Capture | Drift |
|---|---|
| `common/Checkbox.vue` | **40 lines the capture lacks** — gained `isRequired`, `isError`, `modelValue`, an `AsteriskIcon`, a `.checkbox-error` glow, and lost the `input:hover::before` tick preview |
| `header/mobile-menu.vue` | 50 capture-only / 22 site-only lines |
| `header/desktop-menu.vue` | 21 / 22 |
| `common/TextField.vue` | 20 / 24 |
| `common/ArticlePreview.vue`, `common/InputText.vue`, `common/Review.vue`, `project/pain-points-item.vue`, `common/Button.vue`, `homepage/technologies.vue` | 1–6 lines each |

In sync: `styles/global.css`, `common/Radio.vue`, `common/GlowButton.vue`,
`homepage/technology-card.vue`, `footer/link-group.vue`, the three icons.
`common/TypingEffect.vue` and `homepage/contacts-form.vue` no longer exist on the
site at those paths at all.

This matters beyond tidiness: DESIGN.md and the specimens are written *from* the
captures, so any component in that table may be documented as it was rather than
as it is. The checkbox is the proven case — its `secondary` variant is documented
here and typed out of existence on the site (see
[WEBSITE-REVIEW.md](/WEBSITE-REVIEW.md) §4), and the error/required states it has
gained are documented nowhere.

**To do:** refresh the nine, then re-read DESIGN.md §§ on each against the new
source. Not a mechanical copy — the point of the captures is provenance, so each
refresh is a chance to find a divergence, and doing them in one sweep would bury
that. `Checkbox.vue` and `Radio.vue` were refreshed on 2026-08-20 alongside the
`--radius-control` fix; the other seven are open.

## 3. What counts as "converged"?

Both READMEs and `.design-sync/conventions.md` say that `docs/` is converging
onto the shipped site, that the site is the reference while that runs, and that
implementations follow this repo once it is done.

Nothing anywhere says when it is done. The flip has no trigger, so it can stay
"in progress" indefinitely by default.

**To do:** decide the criterion, and write it next to the claim. Candidates: the
[CCWEB2](https://codecave.atlassian.net/browse/CCWEB2) backlog reaching zero open
design-token tickets; DESIGN.md §"Known divergences" emptying out; or a dated
call. Whichever it is, it needs to be checkable by someone who was not in the
room.

## 4. Decide whether `docs/` is built with Astro

The doc pages have been copied from each other long enough that the duplication
is measurable: the global nav is 14 identical lines in **30 files**, the callout
exists in **four** implementations, and the page header and section block exist
in three each. The reasoning has started duplicating too — `.pv-meta` and
`.bk-meta` carry the same sentence, and the DESIGN.md §10.5 eyebrow argument is
written out twice.

Building the site with the stack it documents — Astro 7 + Vue 3 + Tailwind 4,
the versions `codecave.pro` pins — collapses all of that, and would let the
storybook mount the captured components directly instead of going through
`build-storybook.mjs` and `tw-bridge.css`.

**To do:** read [ASTRO-MIGRATION.md](/ASTRO-MIGRATION.md) and decide. It has the
full census, the five phases, and the two constraints that shape everything —
that an unreachable `codecave.pro` must never take the docs site down, and that
the `colors_and_type.css` deliverable stays buildless. One question in it needs
answering before any work starts: whether `docs/` remains committed once it is
build output.

## 5. Decide the print colour space — Maria Shaban

[CLAUDE.md](/CLAUDE.md) scopes the palette as HEX and RGB. CMYK was in that list
and has been deferred here, because it is not a conversion job that can be run
and committed.

Two things make it a decision rather than a lookup:

- **`#5F20FE` is outside CMYK gamut.** It is a highly saturated blue-violet, and
  no four-ink mix reproduces it — it will shift, visibly, and the shift is the
  brand's single most recognisable colour. Someone has to choose what it becomes
  in print, and whether that is a four-colour approximation or a spot ink.
- **`#0A0A0B` is an ink-coverage problem at scale.** The system's ground is
  near-black and its panels are large. Rich black needs a build (the CMY under
  the K) chosen against the stock and the press, and a large near-black field
  printed wrong looks muddy or soaks.

Neither has a right answer derivable from the hexes, and guessing produces a
palette that is worse than none — the same failure mode as the removed `system/`
token layer, which derived its own primary and never emitted `#5F20FE`.

**Owner: Maria Shaban.** Both calls are theirs to make. Once made, record them in
DESIGN.md beside the RGB/HEX values, with the reasoning, the way every other
value in this package is recorded. Until then the package is screen-only and
should say so.

The RGB half is separable and cheap: it is mechanically derivable from the
hexes and can be added to `tokens/` without a decision from anyone. It is not
blocked on this item.

## 6. Not ours: inert Tailwind config on the site side

`tailwind.config.ts` in the website repo is never loaded: Tailwind 4 reads a JS
config only via `@config`, which no stylesheet declares, so `darkMode`,
`content` and `theme.extend` are all dead. Filed under
[CCWEB2-274](https://codecave.atlassian.net/browse/CCWEB2-274) (design-token and
typography cleanup) and recorded in [WEBSITE-REVIEW.md](/WEBSITE-REVIEW.md) §5.

Nothing for this repo to do beyond not mirroring the file. Listed here so the
next reader does not re-discover it as new.
