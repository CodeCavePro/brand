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

Nothing still listed is blocked on this repo alone: two need a decision, one
needs an asset exported, and one is a standing check. The items that were merely
undone have been done; they are recorded at the bottom.

---

## 1. Keep the Tailwind-collision check running

The `.vue` sources in `docs/source_examples/` reference custom properties that
the site's own `global.css` never declares — they resolve only because the
Tailwind build happens to emit a default of the same name. Lift such a
component out of that build and the value changes or disappears.

```bash
comm -23 <(grep -rhoE "var\(--[a-zA-Z0-9-]+" docs/source_examples --include=*.vue | sed 's/var(//' | sort -u) <(grep -oE "^\s*--[a-zA-Z0-9-]+" docs/source_examples/styles/global.css | tr -d ' ' | sort -u)
```

Two names come out today and both are filed against the site:
[`--radius-sm`](https://codecave.atlassian.net/browse/CCWEB2-313) and
[`--default-transition-duration`](https://codecave.atlassian.net/browse/CCWEB2-304).

**Careful — the one-liner has a blind spot.** It compares what the `.vue` files
*reference* against what `global.css` *declares*, so it only ever finds names
the site consumes. It cannot see a name this package publishes that Tailwind
also defines but no SFC happens to use: `--radius-md` was exactly that case and
sat undetected until someone read the two scales side by side. The complement —
diffing this package's `:root` against Tailwind's default theme — has no check.

**To do:** run the one-liner when `source_examples/` is refreshed; any third
name is a new instance. Write the complementary check if the token layer grows.

## 2. The two email templates still set the wordmark as type

[docs/artifacts/email.html](/docs/artifacts/email.html) and
[docs/artifacts/newsletter.html](/docs/artifacts/newsletter.html) render
"CODECAVE" in Satoshi Bold rather than the drawn lockup, which DESIGN.md §8
says must never be re-typed by hand. Every other artifact — deck, form, landing,
poster — now carries `assets/codecave-wide.svg`.

**The URL blocker is gone.** <https://brand.codecave.pro/> resolves and serves
this package (verified 2026-08-20 — DNS points at Cloudflare, which fronts
GitHub Pages; `codecavepro.github.io/brand/...` now 301s to it). Because `docs/`
is the Pages artifact root, a file at `docs/assets/x.png` is served at
`/assets/x.png`, so an absolute URL in an email is derivable rather than
invented and will not rot.

What remains is a file-format problem, not a hosting one. Outlook's Word
rendering engine does not render SVG at all, and `assets/codecave-wide.svg` is
the only cut of the wordmark in the package, so the asset has to be exported as
a PNG at 2× or 3× first. Inlining is not an escape hatch: Gmail strips `data:`
image URIs and Outlook does not support them either — the only reliable
alternative is a `cid:` MIME attachment, which is a property of the sending
message, not of an HTML template, so no edit to these files can supply it.

**To do:** export raster cuts of `codecave-wide` into `docs/assets/`, then point
both templates at `https://brand.codecave.pro/assets/…`. Until then the typed
fallback stays and this note explains why.

## 3. What counts as "converged"?

The apparent contradiction in the README is resolved: it was never two competing
claims, it was one claim about the **target** and one about the **current phase**.
`docs/` began highly divergent from the shipped site and is converging onto it
without surrendering the brand identity; while that runs, the site is the
reference and site-side flaws go to [WEBSITE-REVIEW.md](/WEBSITE-REVIEW.md).
Afterwards, implementations follow the repo. Both READMEs and
`.design-sync/conventions.md` now say exactly that.

What is *not* defined is the switch. Nothing anywhere says when convergence has
been reached, so the flip has no trigger and could stay "in progress" forever by
default.

**To do:** decide the criterion, and write it next to the claim. Candidates: the
[CCWEB2](https://codecave.atlassian.net/browse/CCWEB2) backlog reaching zero open
design-token tickets; DESIGN.md §"Known divergences" emptying out; or a dated
call. Whichever it is, it needs to be checkable by someone who was not in the
room.

## 4. Not ours: inert Tailwind config on the site side

`tailwind.config.ts` in the website repo is never loaded: Tailwind 4 reads a JS
config only via `@config`, which no stylesheet declares, so `darkMode`,
`content` and `theme.extend` are all dead. Filed under
[CCWEB2-274](https://codecave.atlassian.net/browse/CCWEB2-274) (design-token and
typography cleanup) and recorded in [WEBSITE-REVIEW.md](/WEBSITE-REVIEW.md) §5.

Nothing for this repo to do beyond not mirroring the file. Listed here so the
next reader does not re-discover it as new.

---

## Recently closed

- **Two published tokens carried Tailwind's default names at different values.**
  `--radius-sm` was 0.5rem here and 0.25rem in Tailwind; `--radius-md` was
  0.75rem here and 0.375rem there — the two scales offset by exactly two steps,
  so the collision was invisible until something rendered in both. Renamed
  `--radius-control` and `--radius-tile`. The six other radii were already
  semantic; these two were precisely the ones that could collide, so the
  namespace is now structurally clean. Breaking for anyone consuming the old
  names, which is why it waited for a decision. The site-side half —
  `Checkbox.vue` reading a name nothing declares — is
  [CCWEB2-313](https://codecave.atlassian.net/browse/CCWEB2-313).

- **The checkbox specimen contradicted itself.** `components-inputs.html` said
  in prose that the chip box "takes a 4px corner … pinned here so the specimen
  matches the site", while its own `.chip-check input` rule used the 8px token —
  so the page rendered the perfect circle it was warning against. Both checkbox
  boxes now pin the site's 4px, which is also a real convergence: `.checkbox
  input` in `colors_and_type.css` had been shipping 8px where the site ships 4px.

- **`brand.codecave.pro` is live.** DNS and the Pages custom domain were wired
  up outside this repo; verified 2026-08-20 by loading
  <https://brand.codecave.pro/preview/components-inputs.html> in a browser and
  by `codecavepro.github.io/brand/...` returning a 301 to it. Cloudflare fronts
  the domain and challenges non-browser clients, so `curl` sees a 403 — that is
  the bot check, not a broken deploy. `docs/CNAME` added so a future deploy
  cannot drop the custom-domain setting; safe to commit now that DNS resolves.

- **The CSS component layer had no name anywhere in the navigation.** The four
  nav groups cover tokens, live Vue components and artifact templates, but the
  `.btn` / `.field` / `.checkbox` / `.chip` / `.rule` classes that live directly
  in `colors_and_type.css` — the thing a consumer of this package actually
  writes — were three unlabelled cards in the middle of a flat list of twelve.
  [docs/preview/index.html](/docs/preview/index.html) now splits them under
  "Tokens & assets" (9) and "CSS components" (3), with the second group saying
  in so many words that it is *not* the "Live components" entry in the bar. The
  nav bar stays at four groups: a fifth would advertise a section that is three
  cards deep. *(The six artifact specimens remain deliberately excluded from
  `ds-nav.css` — those pages are the deliverable being shown, so they carry the
  site's chrome rather than the package's. Intended, not an omission.)*

- **The storybook could not be verified or rebuilt anywhere but one laptop.**
  `tw-bridge.css` is generated from `docs/source_examples/`, but the generator
  needs the codecave.pro checkout's toolchain, so nothing verified the two were
  in step — and a stale bridge compiles, loads, and silently documents an older
  site. Now: the generator records a SHA-256 of every source file in the
  `tw-bridge.css` header, and [check-tw-bridge.mjs](/docs/tools/check-tw-bridge.mjs)
  verifies it with **nothing but node**, so it runs anywhere. Wired into
  `.github/workflows/static.yml`, which runs it on every deploy and rebuilds the
  storybook when the toolchain is reachable. *(The committed bridge turned out
  not to be stale — the 1420 generated lines were byte-identical.)*

- **The generator's output depended on where it was run from.** esbuild wrote
  path annotations relative to the invocation directory, so building from the
  repo root and from `docs/` produced twelve differing files. Pinning
  `absWorkingDir` makes the output reproducible, which is what lets CI diff a
  fresh build against the committed one and mean it.

- **The generator's own header described behaviour it does not have.** It
  claimed the bridge "adds utilities without redefining the brand"; the bridge
  deliberately scopes the *site's* palette over this package's inside the
  canvases, which is the only reason specimens are faithful. The canvas-scope
  code said "see header comment", pointing readers at the wrong explanation.

- **The root README linked two directories that do not exist** — `docs/system/`
  and `docs/ui_kits/app/`. The templates live in
  [docs/artifacts/](/docs/artifacts); there is no UI kit, so the claim is gone
  rather than repointed. Every repo-relative link in the top-level and `docs/`
  markdown now resolves.

- **`ds-bundle/` was entirely gitignored**, including 32K of files that exist
  nowhere else in the repo — the bundle README, `styles.css`, `guidelines/brand.md`
  and the four Foundations cards were untracked source. The derived half stays
  ignored and is materialized by
  [build-ds-bundle.sh](/docs/tools/build-ds-bundle.sh).

- **The "source of truth" contradiction was not a contradiction.** The README
  describes the target; the site-wins rule describes the phase we are in.
  Recorded as such in both READMEs and `.design-sync/conventions.md`, which had
  been carrying the flatly false clause "where the live site differs, the site
  is what's out of date". What remains is item 4: defining when the phase ends.

- **`.design-sync/conventions.md` had drifted out of the palette rebuild** —
  it is the configured `readmeHeader`, so it feeds the bundle README's first 86
  lines, and it still named `#050505` as the page ground and `--color-brand-210`,
  a token the rebuilt ramp does not define.
