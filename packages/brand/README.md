# @codecavepro/brand

The CODECAVE design system as **CSS custom properties**, as a **typed module**, and as
the **Vue components codecave.pro actually renders** — no runtime, no provider, no
wrapper layer.

Link one stylesheet and the whole system is live on `:root`.

> **Status: stable.** The token _values_ mirror what
> [codecave.pro](https://codecave.pro) ships, and the package _layout_ — export paths,
> module shape — is settled under semver: an export will not move or disappear outside a
> major bump. Token _values_ can change in a minor or patch release, because they track a
> living design system; pin an exact version if you need them frozen.

## Install

```bash
npm install @codecavepro/brand
```

## Quick start

```css
@import "@codecavepro/brand/css";
```

That is the whole setup. Every token is now a custom property on `:root`:

```css
.card {
  background: var(--color-surface-secondary);
  border-radius: var(--radius-card);
  color: var(--color-body-primary);
}

.card a {
  color: var(--color-action);
}
```

**Consume the semantic layer** — `--color-action`, `--color-surface-secondary`,
`--color-body-primary`. The raw ramps (`--color-brand-500`, `--color-gray-1100`) exist
only so the semantic names have somewhere to point; using them directly is how a
redesign turns into a find-and-replace across your codebase.

### Already have your own base styles? Import the values only

`@codecavepro/brand/css` is the design system **whole**: the tokens, ten `@font-face`
rules, base rules for `html`, `body`, `h1`–`h6` and `a`, two layout primitives and
around sixty component classes. That is what you want for a page that should look like
CODECAVE. It is _not_ what you want in an app that already has a base layer — dropping
it in restyles every heading and link you have.

For that case there is a second stylesheet holding the custom properties and nothing
else:

```css
@import "@codecavepro/brand/tokens.css";
```

Same 103 properties on `:root`, same values, zero rules. Nothing it declares can change
how a single existing element renders — a `var()` only takes effect where you write
one. Fonts come with it only as a _name_: `--font-sans` says Satoshi, and declaring the
faces stays your call (see below).

Use it to end a duplicated palette without signing up for a redesign in the same commit.

### No build step, if you prefer

The same file is served, byte for byte, from the published design system:

```html
<link rel="stylesheet" href="https://brand.codecave.pro/colors_and_type.css" />
```

The package build asserts that identity, so the file in your `node_modules` and the
file at that URL are provably the same bytes.

## Fonts: this package ships none

`@codecavepro/brand/css` declares ten `@font-face` rules for **Satoshi**, but **no font
binaries are included** — that is a licensing question, not an oversight. Until you
supply the files, the faces 404 and the browser falls back down the stack
(`-apple-system`, `Segoe UI`, Roboto, …). Tokens, colours and the type _scale_ are all
correct regardless; only the typeface is missing.

The two stylesheets expect the files in **different places**, because one is meant to be
dropped into a project on its own:

| Import                          | `@font-face` URLs             | Put the `.woff2`/`.woff` files at              |
| ------------------------------- | ----------------------------- | ---------------------------------------------- |
| `@codecavepro/brand/css`        | `./fonts/Satoshi-*.woff2`     | a `fonts/` directory **beside** the stylesheet |
| `@codecavepro/brand/fonts.css`  | `./Satoshi-*.woff2`           | **beside** the stylesheet itself               |
| `@codecavepro/brand/tokens.css` | _none — it declares no faces_ | wherever your own `@font-face` rules point     |

Get the cuts from [Fontshare](https://www.fontshare.com/fonts/satoshi) — 300, 400, 500,
700 and 900, each upright and italic, which is the ten faces these stylesheets declare.
Bind each with a real `font-weight` descriptor rather than letting the browser
synthesize; the design system documents why in
[DESIGN.md §10.3](https://github.com/CodeCavePro/brand/blob/development/docs/DESIGN.md#103-synthesized-vs-real-font-weights).

**Do not use the `stylesheet.css` that comes in the Fontshare download.** It declares
Bold and Black _both_ as `font-weight: bold`, and their italics likewise, so four cuts
collide into two slots and whichever is declared last silently wins — your `900` text
renders Bold, or your `700` renders Black, with nothing to indicate which. Take the
binaries from that download and the declarations from here.

## The typed module

For consumers that cannot read a stylesheet — design tooling, canvas/WebGL renderers,
PDF and email builders, native apps:

```ts
import {
  color,
  radius,
  fontSize,
  spacing,
  gradientBrand,
} from "@codecavepro/brand";

color.action; // '#5F20FE'
color.surfaceSecondary; // '#0F0F15'
radius.card; // '1.5rem'
fontSize.headingLg; // { size: '3.5rem', lineHeight: '130%' }
fontSize.body; // { size: '1rem', lineHeight: '1.5rem' }
spacing.sectionPaddingTop; // '12.5rem'
```

The body steps are `stat`, `subhead`, `md`, `label`, `body`, `caption` — named
for their job rather than as t-shirt sizes. That is deliberate and worth copying
if you build on this: `lg`, `sm` and `base` are Tailwind default theme names, and
because this package's `:root` is unlayered it would beat Tailwind's `@layer
theme` and silently resize every `text-lg` and `text-sm` in your app.

Everything is `as const`, so the values are literal types, and the key unions are
exported for building your own maps:

```ts
import type { SemanticColor, Radius, FontSizeStep } from "@codecavepro/brand";
```

| Module     | Exports                                                                            |
| ---------- | ---------------------------------------------------------------------------------- |
| colour     | `brand`, `gray`, `accent`, `technologyGradient`, `error`, `color`, `gradientBrand` |
| layout     | `radius`, `gutter`, `spacing`, `shadow`, `maxWidthDesktop`, `breakpointSm`         |
| typography | `fontFamily`, `fontSize`, `fontWeight`, `eyebrow`                                  |

Two things to know about it:

- **Size and line-height travel together.** `fontSize` steps are objects for that
  reason — never pair a size with a line-height from a different step.
- **The CSS is the source of truth.** This module is a faithful mirror of it. If the
  two ever disagree, the CSS wins and the module is the bug.

## The components

21 components and 13 icons — the buttons, the form controls and the forms
themselves, the nav bar, the footer link group, the article and technology
cards, the review card and the typing effect codecave.pro renders — ship as
**source**, byte-for-byte the files the site builds from. Not a reimplementation
of them, and not a bundle compiled from a snapshot: the same files, kept
identical by a check that runs on every push.

**None of them knows your routes.** Six of these shipped for the first time in
2.1.0 and were held back before it, because each read codecave.pro's own route
table or menu data directly — installing one would have put that site's
navigation behind an npm release, so changing a menu item would mean publishing.
They now take the same information as props: `basePath` on `ArticlePreview`,
`items` on `link-group` and `services-list`, `serviceLinks` and `ctaHref` on
`technologies`, `href` on `technology-card`, `items` and `logo` on
`mobile-menu`. `BrandNav` was the first to be built that way and is the reason
the rest could follow.

```vue
<BrandNav
  :left="[
    { name: 'Workflow', href: '/workflow' },
    { name: 'Services', slot: 'services' },
  ]"
  :right="[{ name: 'Insights', href: '/insights' }]"
  :logo="wordmarkUrl"
  current="Workflow"
>
  <template #services><YourServicesPanel /></template>
</BrandNav>
```

Render it without a `client:` directive and it ships no JavaScript: the dropdown
is CSS hover and the responsive wrap is a media query. **The wordmark is a URL
you pass in** — this package ships no brand marks, so the logo is yours to
resolve through your own asset pipeline.

```vue
<script setup lang="ts">
import Button from "@codecavepro/brand/components/common/Button.vue";
import TextField from "@codecavepro/brand/components/common/TextField.vue";
import CloudIcon from "@codecavepro/brand/assets/icons/cloud-icon.vue";
</script>

<template>
  <TextField v-model="email" label="Email" type="email" />
  <Button title="Send" variant="primary" />
  <CloudIcon />
</template>
```

Because they are `.vue` files rather than compiled JS, your build needs a Vue SFC
plugin — `@vitejs/plugin-vue`, `@astrojs/vue`, `vue-loader`. In exchange their scoped
styles go through your own pipeline and you can read the source of anything that
surprises you.

`vue` is the only required peer. Four more are optional, each wanted by one or two
components; leave one out and only those are affected — `gsap` by `GlowButton.vue`,
`effects/TypingEffect.vue` and `forms/ContactUsForm.vue`; `vue3-carousel` by
`homepage/technologies.vue`; `marked` and `isomorphic-dompurify` by
`project/pain-points-item.vue`.

### Import the theme, not just the tokens

Every colour, radius and control height in these components is a token — but they reach
most of them through **Tailwind utility classes** (`bg-surface-primary`,
`text-heading-md`, `rounded-custom`), and a utility class exists only if Tailwind knows
the name. `tokens.css` gives you the _values_; `theme.css` gives Tailwind the names, so
you need both:

```css
@import "tailwindcss";
@import "@codecavepro/brand/tokens.css";
@import "@codecavepro/brand/theme.css";
```

**`tokens.css` must stay unlayered.** Several entries in `theme.css` are deliberate
self-references (`--color-glow-25: var(--color-glow-25)`): the declaration is what makes
Tailwind emit the utility, while the value comes from `tokens.css`, whose unlayered
`:root` outranks `@layer theme`. Wrap `tokens.css` in a cascade layer — or leave it out —
and those names resolve to nothing. Measured on codecave.pro: importing it as
`layer(brand)` changes the emitted CSS and moves a stylesheet's content hash.

The order of those two lines, by contrast, is convention rather than a constraint —
Tailwind collects every `@theme` and `:root` in the stylesheet before it emits anything,
so reversing them produced byte-identical output. They are written values-then-names
because that is the direction of the dependency.

Import only `tokens.css` and the components mount and behave correctly and render
nearly unstyled.

### Installing the components? Tailwind cannot see them

**Tailwind's automatic content detection skips `node_modules`, and this package ships Vue
source.** So a utility class used only inside a component you install exists nowhere
Tailwind reads, and is simply never emitted. Add the package to the scan:

```css
@source "../../node_modules/@codecavepro/brand/dist/src";
```

Adjust the path to be relative to the stylesheet the `@source` sits in. It **adds** to the
automatic scan rather than narrowing it.

This is the failure mode to know about because nothing reports it: the build succeeds, a
typecheck reports no errors, and the affected elements render unstyled. Leaving the line
out while installing `Button.vue` alone cost codecave.pro 783 bytes of CSS and all 12 of
the utilities only that component uses — every button on the site, silently.

Because nothing reports it, it is worth checking rather than remembering. codecave.pro
does it by asking Tailwind twice: its own scanner for the class names inside this
package, its own compiler for which of those are real utilities, and then whether each
one is in the CSS the build emitted. That reads the same answer Tailwind would, so it
cannot go stale when this package gains a component.

### The content-shaped four resolve their own image URLs

`ArticlePreview`, `Review`, `pain-points-item` and `technologies` render CMS content, so
they used to reach a helper that knew codecave.pro's CMS host. They no longer do. The
three that show images take an optional resolver and default to leaving the URL alone:

```vue
<!-- URLs already absolute — nothing to pass -->
<Review :item="testimonial" />

<!-- URLs relative to your own media host -->
<Review
  :item="testimonial"
  :resolve-image="(u) => `https://cdn.example.com/${u}`"
/>
```

Their props are declared as the fields each one reads — `item.photo.url`,
`article.cover.url` — not as a generated CMS schema. Anything with those fields
satisfies them, so a Strapi entity, a Contentful entry or a plain object all work
unchanged.

## Controls are 48px, and it is a floor

`spacing.controlHeight` / `--control-height` is `3rem` — 48px, what codecave.pro
actually renders. `.btn` applies it as `min-height` rather than `height`, so a button
whose label wraps grows instead of clipping. If you build your own controls from the
token, do the same.

48px clears WCAG 2.5.5 AAA outright rather than merely meeting 2.5.8 AA, so there is no
separate mobile size.

## Documentation

This README covers installing and consuming the package. The design system itself —
the rules, the reasoning, the anti-patterns — is documented separately:

- **[brand.codecave.pro](https://brand.codecave.pro/)** — the published design system:
  brand kit, foundation specimens, and a storybook of real components.
- **[DESIGN.md](https://github.com/CodeCavePro/brand/blob/development/docs/DESIGN.md)** —
  the rules in full: the 26-step ramp, components, motion, anti-patterns, known
  divergences from what the site ships today.
- **[CodeCavePro/brand](https://github.com/CodeCavePro/brand)** — the repository.

## How this package is built

It authors nothing. Every byte is copied, extracted or compiled out of `docs/` in the
repository above: `css` and `fonts.css` are copied verbatim, `tokens.css` is extracted
from the same file `css` is copied from, `theme.css` is extracted from the capture of
codecave.pro's `global.css`, and the typed module is compiled from `src/tokens/*.ts`.
A name that `theme.css` and `tokens.css` both give a literal value must agree, and the
build fails if it does not — otherwise one of the two would be dead and nobody would
see it. `docs/` stays the single origin, and CI asserts on every push that
the copies are byte-identical and the extraction still reproduces what shipped.

Two editable copies of a palette is the exact failure this package exists to end, so it
would be self-defeating to introduce a second one on the way there. **Fixes go to
`docs/`, never to `packages/`.**

## Licence

[Unlicense](https://github.com/CodeCavePro/brand/blob/development/LICENSE). The
CODECAVE name and marks are not covered by it.
