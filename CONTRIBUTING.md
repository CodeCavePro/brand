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
| **Swatch captions** | `docs/index.html`, `docs/brand-kit.html`, `docs/pages/preview/colors-*.astro` | Edit the literal. Here the hex *is the content* — a `var()` would render nothing. On the ported page the literals are a data array at the top of the file; that is still a literal. |
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

`npm run check:captures` is what measures it, and **it reads whatever branch the
codecave.pro checkout beside this one happens to be on.** Point it at a feature
branch and it will report that branch's own unmerged work as capture drift — the
captures record what the site *ships*, so the checkout belongs on `development`
before you believe the answer, and certainly before you "refresh" anything to
match.

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
- **A port exists because a captured component needs it.** That check typechecks
  an adapter whether or not anything imports it, so on its own a green result
  reads as coverage of something that may be running for nothing. Every
  `build-storybook.mjs` run therefore names the specimens each port stood in
  for, and names any port nothing reached for — delete those, or capture what
  needs them.
- **The import map is checked against the bundles, both ways.** The compiled
  specimens keep `vue` and the gsap entry points as bare imports, and only the
  map in `docs/layouts/DocPage.astro` resolves them — where a key is matched
  *exactly*. Miss one and the browser rejects the whole module graph: the page
  renders, the canvas is empty, nothing errors. `npm run check:importmap` fails
  on an unmapped import and on a mapped specifier nothing imports any more,
  which is a claim about the bundles that has stopped being true. Both inputs
  are committed, so it runs in CI.
- **Adding or removing a finding moves a number in three other files.**
  `docs/README.md`, `docs/pages/storybook/index.astro` and `docs/pages/index.astro`
  each quote how many findings the story pages carry. Do not adjust them by one
  and hope — `npm run check:findings` counts the pages and compares. A finding
  is an element carrying `sb-note` *after* that page's `<h2>Findings</h2>`, with
  `is-warn` marking a defect; notes above the heading are furniture, which is
  why project-chip's opening note is not a finding.

  It checks the split, not just the total, because the drift that prompted it
  moved neither: a note marked fixed upstream lost its `is-warn`, turning a
  defect into an observation while 55 stayed 55. It also fails when one of
  those three sentences is **reworded**, since the patterns are literal — that
  is the point. Fix the pattern in `docs/tools/check-findings.mjs` so the claim
  stays covered; a check that has quietly stopped covering anything reads
  exactly like one that passes.

Building the storybook needs a `codecave.pro` checkout beside this one. **That
repo uses pnpm** — `pnpm install --frozen-lockfile`. Reaching for `npm` there
produces an ERESOLVE that looks like a broken dependency graph and is not.

## Before you commit

```bash
npm run check
```

That is six assertions in one: the package is byte-identical to its origin,
every storybook port typechecks, the compiled storybook matches the captures it
was built from, no token silently redefines a Tailwind default, the storybook's
import map resolves exactly what its bundles import, and the findings counts
three files quote agree with the story pages. All six are things that would
otherwise rot quietly.

"Byte-identical" has one exception, and it is stated by the check itself rather
than left to be discovered: the site imports its helpers through an `@helpers`
alias that only exists in codecave.pro's `tsconfig.json`, so the nine captures
using it are rewritten to the relative form on the way into `dist/`. Those nine
match their origin *once the alias is resolved*, and the check prints the two
counts separately so neither claim is doing the other's work. The rewrite is in
`docs/tools/helpers-alias.mjs`, shared with `build-storybook.mjs` — which needs
the same answer, because for those nine files identical bytes would mean the
package was **not** built from that capture.

The token one is worth a sentence, because it catches a failure with no symptom
here at all. Tailwind declares its theme inside `@layer theme`;
`colors_and_type.css` declares in a plain `:root`, and **unlayered CSS beats any
cascade layer regardless of source order.** So a token that happens to share a
name with a Tailwind default does not merely coexist with it — it silently and
unconditionally replaces it in every consumer's app, and nothing in this
repository renders any differently. `npm run check:collisions` diffs the token
layer against Tailwind's complete default theme, and sweeps the SFCs for
properties nothing declares. The first time it ran it found
[CCWEB2-323](https://codecave.atlassian.net/browse/CCWEB2-323).

Both of its inputs live here — `source_examples/` is committed, and Tailwind's
theme comes from a devDependency pinned to the version the site resolves — so
unlike `check:captures` it runs in CI. It also sweeps the full site checkout for
undeclared properties when one is beside this repo, and says which it did.

### Line endings are content, so leave `.gitattributes` alone

`* text=auto eol=lf`, and it is load-bearing rather than tidiness. Three things
here are digests or byte-for-byte copies of files in `docs/`, and all three
read the **working tree**, not the git blob:

- `check-tw-bridge.mjs` compares a sha256 of `docs/source_examples/` against
  the value recorded in the generated `tw-bridge.css` header.
- `npm run check` asserts `packages/brand/dist/colors_and_type.css` and
  `fonts.css` are byte-identical to their origins, and `npm pack` runs it.
- `build-storybook.mjs` compiles `.vue` SFCs with esbuild, which reproduces only
  if its inputs do.

A CRLF checkout and an LF checkout of the same commit disagree on every one of
them. That is not a hypothetical: without this file, `core.autocrlf=true` on
Windows broke the Pages deploy for **36 consecutive runs** across 2026-08-20
and 21 — green locally every time, red in CI every time, and the site quietly
served a two-day-old build the whole while. `text=auto` on its own would not
have helped: it normalises what is committed and leaves the checkout
platform-native, which is exactly the state that caused it.

If you clone into a tree that predates the file, or the check reports a digest
mismatch it identifies as a line-ending difference, renormalise in place:

```bash
git rm -r --cached . && git reset --hard
```


**Prefer an assertion to a comment.** This is the repo's strongest habit and it
was learned the hard way — a comment asking the next person to keep two things in
step failed inside a day, while the pin it guarded was already wrong. If you find
yourself writing "remember to update X when Y changes", write the check instead.

**Prefer a proof to a claim.** A specimen that generates its verdict from the
rendered DOM beats a paragraph asserting the behaviour, because the paragraph
stays true-looking after the behaviour breaks.

## Looking at the docs site

The site is built with Astro now ([CCWEB2-317](https://codecave.atlassian.net/browse/CCWEB2-317)).

```bash
npm run docs:dev
```

`docs/` is still the origin and is still committed — the build reads from it and
writes to `dist/`, which is not. **Nothing about the one rule changes:** if the
build wrote back into `docs/`, the npm package's byte-identity assertion would be
comparing a generated file against itself.

Every page is ported: the thirteen `preview/` cards, the fourteen `storybook/`
pages, `index.html` and `brand-kit.html`. Each is an `.astro` under
`docs/pages/` and reaches the site by being rendered. `artifacts/` is the
exception and always will be — see below.

The half-migrated state is gone, but the machinery that made it survivable is
not, and it is worth keeping: a page reaches `dist/` either by being rendered or
by being copied, both silently, and `docs/tools/astro-passthrough.mjs` asserts
both every build. Adding a page back as plain `.html` still works.

Four things to know if you write or move a page:

- **The body is `.astro` now, not HTML.** A brace opens an expression, so
  literal text like `codecave-{wide|tall}-{size}.png` compiles to JavaScript —
  write it as `{'…'}` instead. Entities are the same hazard in reverse: `title`
  is plain text and the layout escapes it, so passing `&amp;` puts a literal
  `&amp;` in the browser tab. That one is asserted — `DocPage` refuses a title
  containing an entity — because nothing else caught it: the page built, served
  and looked right, and only the diff below showed the doubled escape.

- **Delete the `.html` you replace, in the same commit.** `publicDir` and
  `srcDir` are the same directory, and when both offer a path Astro keeps the
  copied file and skips the page — a `WARN` in a build that exits 0, leaving the
  new `.astro` as dead source. The build now fails instead: see
  `docs/tools/astro-passthrough.mjs`.
- **Diff the output against the page you replaced.** `compressHTML` is off, so a
  faithful port renders almost byte-identically and the diff is short enough to
  read. It is off for a better reason than that — on by default it collapsed a
  line break before an inline tag to nothing, turning "violet light
  **upward**" into "lightupward" in three places on the first page tried. In a
  repository whose prose is the asset, that is not a minification setting.

The fourth applies only to `storybook/`, and it is the one worth stating twice:

- **The specimens are not islands, and must not become them.** Each storybook
  page carries a browser import map and a module script that mounts
  `compiled/*.js` — esbuild output from codecave.pro's own toolchain, with `vue`
  left external. Since CCWEB2-318 phase 4 those bytes come from
  `@codecavepro/brand` for every component the package ships and from the
  captures for the rest, which is the same claim either way: the package's
  components *are* the captures, copied. The build prints the split on every
  run, so a specimen silently falling back to the captures is visible rather
  than not. That is what makes a specimen a record of what the site ships
  rather than a rebuild of it. Both tags need `is:inline`: processed, Astro
  bundles the module script and rewrites its bare specifiers, and the import map
  is then resolving nothing. `DocPage`'s `importmap` prop emits the map, which is
  identical on all thirteen mounting pages. `docs/pages/storybook/button.astro`
  says all of this at the point where undoing it would be easy.

The six specimens under `artifacts/` are **never** rendered. They are the
deliverable being shown, not pages about it, and an HTML email with a
documentation bar welded to the top is not a valid email. They pass through
untouched.

The gallery that links them is the exception this paragraph always reserved,
and it took it: `docs/pages/artifacts/index.astro`. It is chrome rather than a
specimen — it always carried the documentation bar — and while it was payload
it carried its own hand-written copy of that bar's markup. Once the bar became
a component, that copy would have been the only markup left in the repository
claiming to be the nav while not being it. Its route did not move:
`build.format: 'preserve'` emits it to `artifacts/index.html`, the href every
nav already carries. Nothing else under `artifacts/` will follow it.

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
