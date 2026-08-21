# Contributing

How to change something in this repository without leaving a silent copy behind.

That is the whole difficulty here. Almost nothing in this repo fails loudly when
it goes stale — a derived file that is a week behind its origin compiles, loads,
renders, and quietly documents a design system that no longer exists. Most of
the rules below exist because that already happened.

New to the repo? Read [README.md](/README.md) first for what it *is*. This file
is what to do once you want to change it.

## The one rule

**`docs/` is the origin. Edit there.**

Everything else in this repository is downstream of it: the npm package, the
synced design bundle, the compiled storybook. If you find yourself editing a
token in `packages/` or `ds-bundle/`, stop — your change will be silently
overwritten by the next build, and until it is, you have two copies of the truth,
which is the exact failure this repo is organised to prevent.

There are two things under `docs/` that are *not* editable either. See
[Files you must never hand-edit](#files-you-must-never-hand-edit).

## Where a value actually lives

The action purple `#5F20FE` appears in **71 tracked files**. Only two of them are
places you change it. Knowing which category a file is in is most of the job:

| Category | Files | What to do |
|---|---|---|
| **Origin** | `docs/colors_and_type.css`, `docs/tokens/*.ts` | **Edit these.** Both, together — the `.ts` is a hand-maintained mirror, not a compilation. |
| **Provenance captures** | `docs/source_examples/**` | **Never edit.** Refresh *from the live site*, never by hand. |
| **Generated** | `packages/brand/dist/`, the derived half of `ds-bundle/`, `docs/storybook/compiled/`, `docs/storybook/tw-bridge.css` | Never edit. Rebuild. |
| **Artwork** | SVGs under `docs/assets/`, `docs/build/`, `docs/imagery/`, `src/`, `favicons/` | Edit the hex literally — SVG has no cascade to inherit a token from. |
| **Swatch captions** | `docs/index.html`, `docs/brand-kit.html`, `docs/preview/colors-*.html` | Edit the literal. Here the hex *is the content* — a `var()` would render nothing. |
| **Email** | `docs/artifacts/email.html`, `newsletter.html` | Edit the literal. Email clients do not support custom properties; this is not a shortcut. |
| **Prose** | `docs/DESIGN.md`, `README.md`, `docs/README.md`, `docs/SKILL.md` | Update the ones that state the value. `DESIGN.md` is the rulebook and always states it. |

Everything else consumes `var(--color-*)` and needs no edit at all — which is the
point of the token layer. **Never hard-code a hex in a file that could use a
`var()`.**

## Files you must never hand-edit

### `docs/source_examples/**`

These are **captures of first-party source** — what codecave.pro actually
shipped, at a moment in time. They exist to be *evidence*. Hand-editing one to
match what you wish the site did destroys the only thing it is for, and it does
it invisibly: a doctored capture looks exactly like a real one.

A hand-written stub lived here once, as `lib/strapi.ts`. It is gone. Nothing
under `source_examples/` is authored.

Refreshing them from the live site is a different act and is legitimate — that
is [CCWEB2-315](https://codecave.atlassian.net/browse/CCWEB2-315), and it is not
a one-time job. It measured nine drifted files on 2026-08-19, thirteen on
2026-08-20 and zero on 2026-08-21.

To find out where they stand right now:

```bash
npm run check:captures
```

It compares every capture against a `codecave.pro` checkout (expected beside
this repo; pass a path as an argument otherwise) and names the drifted ones.
**It is not part of `npm run check` and not in CI**, because the site repository
is private and CI has no checkout of it — with no checkout the command fails
loudly rather than reporting success, so it can only ever be run somewhere the
answer is real.

### The derived half of `ds-bundle/`

`ds-bundle/` is split, and the split is not visible from the file names:

- **Derived and gitignored** — regenerate with `sh docs/tools/build-ds-bundle.sh`.
- **Authored and tracked** — `README.md`, `styles.css`, `guidelines/brand.md`,
  and the Foundations cards. These have no upstream in `docs/`. Edit them here.

One exception worth knowing: `ds-bundle/README.md` is tracked and authored, but
its header is a verbatim copy of `.design-sync/conventions.md`. Change the
header in `conventions.md` and copy it across; they are checked by eye, so it is
on you.

## Making a change

### Changing a token value

1. Edit `docs/colors_and_type.css`. This is the real source of truth — if it and
   anything else disagree, **the CSS wins and the other thing is the bug.**
2. Mirror it in `docs/tokens/*.ts`. Nothing compiles the CSS into the TS; it is
   maintained by hand and it *has* silently diverged before. Packaging the mirror
   once turned up two latent bugs nothing in `docs/` consumed: an extensionless
   ESM import, and an interpolation of `brand[660]`, a ramp step that has never
   existed.
3. Update `docs/DESIGN.md` where it states the value, and the palette table in
   the root [README.md](/README.md) if the change is to one of the eight colours
   listed there.
4. Grep for the old value and triage every hit against the table above.
5. Rebuild and check:
   ```bash
   npm run build && npm run check
   ```
6. Regenerate the bundle if the CSS moved:
   ```bash
   sh docs/tools/build-ds-bundle.sh
   ```

### Changing a rule rather than a value

`docs/DESIGN.md` is the rulebook and is authored directly. If the rule has a
machine-readable half — an anti-pattern that a specimen demonstrates, a
divergence in §10 — move both, and say in the commit which specimen proves it.

### Adding to the storybook

Read [docs/README.md § Ports](/docs/README.md#ports--what-a-component-depends-on-outside-itself)
first. The short version: a captured component that depends on something the
static build cannot carry gets an **interface and an adapter**, never a stub.

- The interface goes in `docs/storybook/ports/ports.d.ts`, the adapter beside it,
  and the wiring in the `PORTS` table in `docs/tools/build-storybook.mjs`.
- **An adapter substitutes the environment, never the behaviour.** `SanitizerPort`
  is real `dompurify` with only the `jsdom` half dropped, because a docs page is
  only ever a browser. It shipped as an identity function for a day, and that
  made the one page people open to check sanitising the one page not doing it.
- Where an adapter genuinely cannot reach production, **the specimen must say so
  on its face** — not in a code comment nobody reading the page will see.
- `npm run check:ports` typechecks every adapter against its interface, and CI
  runs it. A drifted adapter compiles fine and fails as an `undefined` in a
  reader's browser, which is the one place a specimen must not fail.

Building the storybook needs a `codecave.pro` checkout beside this one. **That
repo uses pnpm** — `pnpm install --frozen-lockfile`. Reaching for `npm` there
produces an ERESOLVE that looks like a broken dependency graph and is not.

## Before you commit

```bash
npm run check
```

That is three assertions in one: the package is byte-identical to its origin, every
storybook port typechecks, and the compiled storybook matches the captures it was
built from. All three are things that would otherwise rot quietly.

**Prefer an assertion to a comment.** This is the repo's strongest habit and it
was learned the hard way — a comment asking the next person to keep two things in
step failed inside a day, while the pin it guarded was already wrong. If you find
yourself writing "remember to update X when Y changes", write the check instead.

**Prefer a proof to a claim.** A specimen that generates its verdict from the
rendered DOM beats a paragraph asserting the behaviour, because the paragraph
stays true-looking after the behaviour breaks.

## Where open work is tracked

**Jira is the only list.** This repo had a `TODO.md`; it was deleted on
2026-08-20 once its contents were filed, so *the absence of a to-do file here
does not mean there is no open work.*

Brand-package items are in [CCWEB2](https://codecave.atlassian.net/browse/CCWEB2)
under the **`brand-kit`** label. They sit in the website project because no brand
project exists yet; the label is what makes them movable in bulk when one does.
[CLAUDE.md](/CLAUDE.md) carries the current index with status.

**Site-side flaws are not ours to fix.** A genuine bug in what codecave.pro ships
gets written up in [WEBSITE-REVIEW.md](/WEBSITE-REVIEW.md) for a human designer
and filed in CCWEB2 *without* the `brand-kit` label — never silently "corrected"
in `docs/`. While the design system is still converging onto the site, the site
is the reference.

Print colour space — CMYK, and whether a spot colour is used — is deliberately
not filed anywhere. It is Maria Shaban's decision and gets its own project.

## Publishing

Changing `docs/` does not publish anything to npm. See
[RELEASING.md](/RELEASING.md), and read its rollback section before the first
publish rather than after: npm's unpublish window is 72 hours and a version
number, once used, can never be reissued.

The docs site at <https://brand.codecave.pro/> is a different matter — it deploys
from `docs/` on push, so a change there is live as soon as it merges.
