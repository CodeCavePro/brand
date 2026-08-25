# CODECAVE website review — remarks for a human designer

**Scope:** the website sources in `codecave.pro/src` (the code behind the live
site at codecave.gay). Compiled 2026-08-19 from three passes: mounting every
`.vue` component live in the brand storybook (`docs/storybook/`), a token audit
of `src/styles/global.css` after the palette rebuild, and WCAG 2.1 contrast
math computed against the current palette (page ground `#0A0A0B`, card ground
`#0F0F15`).

**The direction of truth inverted on 2026-08-25, and it changes who acts on
this list.** When these remarks were compiled, `docs/` documented codecave.pro
and every component below was the site's. The components now live in
`docs/authored/`, ship in `@codecavepro/brand`, and the site installs them and
keeps no copies — so **a finding about a component is this repository's to fix,
and reaches the site at its next version bump.** Only findings about files the
site still owns are the site's.

Each remark names the source file so it can be addressed where it lives.
Severity: **P0** = ship-blocking (security or accessibility failure), **P1** =
incorrect behavior or broken contract, **P2** = hygiene and polish.

**This file lists only what is still open.** Remarks are deleted as they are
fixed rather than struck through — the Jira backlog under
[CCWEB2](https://codecave.atlassian.net/browse/CCWEB2) is the record of what was
done and when. Every remark below was re-verified against
`docs/authored/` on 2026-08-25.

---

## 2 · P0 — Accessibility

### 2.1 No reduced-motion handling anywhere
`grep -r "prefers-reduced-motion" src/` returns nothing. The two biggest
animations are GSAP-driven — the TypingEffect character stagger
(`common/effects/TypingEffect.vue`) and the GlowButton pointer-tracking highlight
(`common/GlowButton.vue`) — so even a CSS kill-switch would not cover them.
**Fix:** a `window.matchMedia('(prefers-reduced-motion: reduce)')` guard in
both components (GlowButton already has the identical pattern for
`pointer: coarse`), plus a global CSS collapse for the rest. WCAG 2.3.3 / 2.2.2.

### 2.2 The disabled treatment is unreadable (`common/Button.vue`)
At `opacity-20` the label-to-fill contrast composites to **1.55:1** and the whole
control sits at **1.72:1** against the page — below every contrast floor there
is, including the 3:1 one that applies to a disabled control's boundary. The
control is inert, so nothing is *reachable* that should not be; it simply cannot
be read.
**Fix:** a less drastic disabled treatment than 20% opacity. That is a colour
decision, so it belongs with Maria Shaban rather than being picked here.

### 2.3 Form errors are invisible twice over (`common/InputText.vue`)
- The error message renders in a plain `<span>`: no `role="alert"`, no
  `aria-live`, no `aria-describedby` tying it to the input, and the input never
  gets `aria-invalid`. Screen readers get no signal at all.
- The error color is `--color-error` = error-300 `#B42318`: **3.01:1** on the
  page ground at 12px — far below the 4.5:1 floor, on exactly the text a user
  most needs to read. In-palette fixes: error-100 `#FE9A9A` (9.71:1) or
  error-200 `#FE2020` (5.13:1).

### 2.4 Action violet used as small text (`common/Review.vue` and eyebrows)
`#5F20FE` measures **2.94:1** on `#0A0A0B` (2.84:1 on cards) — that is under
the 4.5:1 floor for body text **and**, by a 0.06 hair, under the 3:1 floor for
large/bold display type, so even the signature 32px eyebrows now miss AA. Any
slightly lighter violet clears the large-text floor; body-size usages need
more. The Review
component's "verification" row uses it at caption size, and it is the trust
signal of a testimonial. `--color-hovered` `#B19AFE` (8.41:1) is the in-palette
fix.

### 2.5 Footer link groups have no structure (`footer/link-group.vue`)
`groupName` renders as a `<p>` and every link sits in a bare `<div>`. Assistive
tech reports the whole footer as one flat run of anchors — no group boundaries,
no counts. A `<nav aria-labelledby>` + `<ul>` fixes it without moving a pixel.

### 2.7 Smaller a11y defects
- **Alt text is a CMS filename** — `ArticlePreview.vue` binds
  `:alt="article.cover.name"` (`bim-export-hero.png` read aloud). The image is
  decorative next to the title: `alt=""` is more correct.
- **Icon buttons have no name** — `Button.vue` `variant="icon"` with no
  `title` renders nothing accessible; call sites need `aria-label`.
- **Checkbox hover fakes a checked state** — `common/Checkbox.vue`
  `input:hover::before` scales the tick to 1 exactly as `:checked` does, so a
  hovered empty box is indistinguishable from a checked one.
- **Text-variant hit target ≈ 20px** — Button's `text` variant has no padding,
  under the 24px minimum; footer rows rely on parent spacing.

## 3 · P1 — Broken contracts and state bugs

| # | File | Problem | Suggested fix |
|---|------|---------|---------------|
| 3.1 | `common/Checkbox.vue` | Stateless and unreported: no `modelValue`, no emit, no `:checked` binding — the only way to read it is DOM query | give it real `v-model` like the other form fields |
| 3.2 | `common/Radio.vue` | `modelValue` declared but never read; visual state comes from the separate `isChecked` prop — two props for one state, and they can disagree | drive checked state from `modelValue` |
| 3.3 | `common/TextField.vue` | Emits on `@change`, not `@input` — parent `v-model` syncs only on blur; submit-before-blur reads a stale value. `InputText` in the same form emits per keystroke | emit on input |
| 3.4 | `common/TextField.vue` | Auto-resize runs only in the input handler — programmatic value changes (draft restore, prefill) leave content clipped under `overflow: hidden` | watch `modelValue` and re-measure |
| 3.5 | `common/Review.vue` | Avatar gated on the magic string `photo.name !== 'no-image.svg'`; no null guard on `photo` (throws); `linkedinurl.length > 1` accepts any 2+-char string as a URL and throws on `null` | explicit `hasPhoto` flag from the CMS; real URL validation |
| 3.6 | `homepage/technology-card.vue` | `index?: number` is optional but `rotate[index]`/`translate[index]` are unguarded — the mobile carousel really does omit it, interpolating the literal string `undefined` into classes | default the prop, guard the lookup |
| 3.8 | `project/pain-points-item.vue` | Markdown parsed once at `<script setup>` level, not in `computed` — swapping `item` without remount leaves stale body text next to the new image | wrap in `computed()` |
| 3.9 | `common/GlowButton.vue` | The `class` prop lands on both the wrapper div and the inner anchor — positional utilities double-apply (`Cookies.vue` passes `w-full max-w-[12.5rem]!`) | apply caller class to the wrapper only |
| 3.10 | `common/effects/TypingEffect.vue` | `SplitText.create('.split-text span')` queries the whole document — a second instance re-splits and animates the first one's characters | scope via template ref |
| 3.11 | `common/Button.vue` | `type?: 'submit'` declared, never bound — implicit `type="submit"` inside forms is unreachable to override | bind it, or delete the prop |
| 3.12 | `footer/link-group.vue` | `:key="index"` on the links `v-for` — wrong node reuse on reorder once the list is CMS-driven | key by `href` |
| 3.13 | `common/Radio.vue` | Secondary hover is dead code: `group-hover:bg-surface-tertiary` with no ancestor carrying `group` | add the class at the call site or drop the style |

## 4 · P1 — Visual and interaction polish

- **Tertiary hover dims the control** (`Button.vue`): border `#5F20FE` →
  `#4004AF` on hover is **1.75:1** against the page — the affordance recedes at
  the exact moment of interaction. If intentional, worth an explicit design
  note; if not, hover lighter (e.g. `#B19AFE`).
- **ArticlePreview hover is a no-op**: `bg-surface-secondary
  hover:bg-surface-secondary` re-applies the resting token while
  `transition-colors` + `cursor-pointer` promise a lift. Restore
  `hover:bg-surface-tertiary` or drop the transition.
- **Ordered lists render as bullets** (`pain-points-item.vue`): the renderer
  picks `ol` vs `ul` but applies `list-disc` to both branches.
- **Gradient ring can fill solid** (`technology-card.vue`): only the standard
  `mask-composite: subtract` is declared; engines still needing
  `-webkit-mask-composite: xor` paint the pseudo-element as a violet block.
- **Checkbox squashes next to a wrapping label** (`common/Checkbox.vue`): the
  box is sized with `w-6 h-6` and nothing else, and a Tailwind width is not a
  floor — as a flex item beside a label long enough to wrap, it gives up width
  while keeping its height and renders as a tall rounded slot. Any consumer with
  a sentence-length label (the newsletter opt-in on the contact form is one)
  hits it. Add `shrink-0`.

  **This one now ships.** The note here used to say it was "fixed ahead in the
  port" — that fix lived in the docs-side copy and did not survive the
  component's promotion into the package. Verified 2026-08-25: neither
  `shrink-0` nor `flex: none` appears in `docs/authored/common/Checkbox.vue`,
  nor in `@codecavepro/brand@2.2.0`'s copy of it. Every consumer that gives a
  checkbox a wrapping label gets the tall rounded slot.
- **`Checkbox.vue`'s `secondary` variant is dead code.** The props type says
  `variant?: 'primary'`, so the `case 'secondary'` branches in
  `labelVariantClass` and `inputVariantClass` are unreachable through the typed
  API, and no caller passes it — the only `<Checkbox>` usages on the site are
  the contact form's two, both default. The chip form (16px box in a
  `surface-secondary` pill) therefore renders nowhere. Either it was dropped and
  the branch should go, or it was meant to survive and the type should read
  `'primary' | 'secondary'`. Right now the source documents a control the site
  does not have, which is how the design-system port came to carry a specimen
  for it.

## 5 · P2 — Token layer

**This section changed owner.** It was written against
`codecave.pro/src/styles/global.css`. That file now declares **zero** custom
properties — it imports `@codecavepro/brand/tokens.css` and `/theme.css` — so
the ramps below are **this package's**, in `docs/colors_and_type.css`, and the
findings are ours to answer rather than a designer's to relay.

- **The gray ramp is non-monotonic.** `gray-1000 #050505` is *darker* than
  `gray-1100 #0F0F15` (relative luminance 0.0015 vs 0.0050). By luminance,
  `#0F0F15` belongs between gray-950 and gray-1000. Rename or reorder — ramp
  numbers that stop meaning "darker as they grow" get misused. The declaration
  in `colors_and_type.css` carries a `NOTE` admitting the inversion, which makes
  it documented rather than fixed.
- **The brand ramp hides neutrals and one inversion.** `brand-950 #0A0A0B` (the
  page ground) is a neutral near-black, and `brand-25/50` are grays — they read
  as violet steps but aren't. `brand-500 #5F20FE` is slightly *lighter* than
  `brand-400 #5F3ABD` (L 0.106 vs 0.091).
- **Raw ramps in bare `:root`, semantics in `@theme`.** This works only because
  unlayered `:root` out-cascades Tailwind's `theme` layer, and the package now
  depends on that arrangement deliberately: `tokens.css` carries the values,
  `theme.css` carries the names, and several `@theme` entries are
  self-referential (`--x: var(--x)`) precisely so Tailwind emits the utility
  while the value comes from `tokens.css`. **Do not "fix" one on sight** — behind
  a layered or absent `tokens.css` the same line is a cycle that resolves to
  nothing. The live risk that remains: redefining `--color-gray-*` silently
  repaints Tailwind's *default* gray palette for any future `text-gray-*`
  utility. None are used today; worth keeping it that way.
- **Naming nits:** `--color-text-body-primary` (gray-200) vs
  `--color-body-primary` (gray-50) is a near-collision that invites the wrong
  pick; `--color-default-transparent` points at opaque `gray-100`; the comment
  header reads "erros"; the "once used?" section is a question mark in
  production code.

## 6 · Contrast reference (current palette)

Computed WCAG 2.1 ratios; page = `#0A0A0B`, card = `#0F0F15`.

| Pair | Ratio | Verdict |
|------|-------|---------|
| heading `#F4F4F6` on page | 18.02:1 | pass |
| body `#D5D5DD` on page | 13.56:1 | pass |
| secondary `#C7C7DB` on page | 11.89:1 | pass |
| secondary `#9595BB` on page | 6.87:1 | pass |
| hovered `#B19AFE` on page | 8.41:1 | pass |
| label `#F4F4F6` on primary fill `#5F20FE` | 6.12:1 | pass |
| glow text `#1B0D4E` on `#9980FF` | 5.67:1 | pass |
| error-200 `#FE2020` on page | 5.13:1 | pass (borderline for 12px) |
| neutral `#6B6699` on page | 3.76:1 | large text only |
| **action `#5F20FE` as text** | **2.94:1** | **fail < 4.5:1** |
| **error-300 `#B42318` as text** | **3.01:1** | **fail < 4.5:1** |
| **tertiary hover border `#4004AF`** | **1.75:1** | **fail < 3:1 (UI)** |
| **disabled button (opacity .2), label vs fill** | **1.55:1** | **fail** |

## 7 · Worth keeping exactly as-is

Patterns found during the review that are deliberate and good — do not
"fix" these: the `:-webkit-autofill` override in InputText (kills Chrome's
yellow flash on the dark form); TypingEffect waiting on `document.fonts.ready`
before splitting (prevents fallback-glyph jumps); GlowButton's three-signal
touch detection with early returns; TextField's focus halo on the wrapper via
`:focus-within` (rings the whole control, label included); and the upward
section glow — the light-from-below signature is the brand's strongest move.
