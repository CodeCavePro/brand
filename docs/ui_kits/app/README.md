# Applied interface kit — CODECAVE delivery workspace

An interface assembled entirely from `../../colors_and_type.css`. Open
`index.html` directly in a browser; there is no build step, no bundler and no
package install.

## What this is, and what it is not

The captured evidence is a **marketing and lead-generation website** — 61 Astro
pages, 45 Vue components, zero React. This kit therefore does not reproduce an
existing CODECAVE screen, and it is not a claim that such a screen exists.

It is the design system applied to a *denser* surface than the source has: an
internal client workspace with a persistent rail, a scrolling thread, selection
and unread state, and a composer that lives inside a scroll container. The point
is to prove the tokens survive contact with product density — that four surfaces
one hair apart still separate when they are stacked three columns deep, that
24px radii still read at 320px of width, and that a system with exactly one
primary button can drive an application shell.

Every visual value comes from the design system. The kit's own stylesheet is
embedded in `index.html` and contains layout only: no color, radius, shadow or
type size that `colors_and_type.css` has not already defined.

The domain content is first-party. The six pods are the six services from
`source_examples/header/menu.ts`, carrying their production names and outcome
lines verbatim.

## Structure

```
ui_kits/app/
├── index.html                    entry point — runtime, tokens, kit chrome, mount
├── README.md                     this file
└── components/
    ├── App.jsx                   shell · state · composition        → window.App
    ├── Sidebar.jsx               primary navigation rail            → window.Sidebar
    ├── AssistantsList.jsx        selectable list rail               → window.AssistantsList
    ├── ChatArea.jsx              main workspace column              → window.ChatArea
    ├── MessageBubble.jsx         one thread entry                   → window.MessageBubble
    ├── InputBar.jsx              composer + scope chips             → window.InputBar
    └── GlowButton.jsx            the single primary action          → window.GlowButton
```

`index.html` loads React 18.3.1, ReactDOM 18.3.1 and `@babel/standalone` 7.29.0
from unpkg, then each component as `<script type="text/babel">`. Babel gives each
file its own scope, so every component publishes itself on `window` and the load
order runs leaves first, `App.jsx` last. The mount is:

```js
const App = window.App;
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

## Component files and their source basis

| Component | Role | Modelled on |
|---|---|---|
| `App.jsx` | App shell, three-column grid, all state | `styles/global.css` surface steps; `header/menu.ts` for content |
| `Sidebar.jsx` | Navigation / sidebar | `header/desktop-menu.vue` (ghost items, live dot), `header/services-list.vue` (12px icon tile) |
| `AssistantsList.jsx` | List rail with selection + unread | `header/services-list.vue` (tile + outcome line), `common/ArticlePreview.vue` (card hover lift) |
| `ChatArea.jsx` | Main workspace | `services/heading.astro` (the eyebrow/lead pair), `homepage/testimonial.astro` (action pairing) |
| `MessageBubble.jsx` | Message | `common/Review.vue` (avatar + attribution), `common/ArticlePreview.vue` (card, no shadow) |
| `InputBar.jsx` | Composer | `common/InputText.vue`, `common/TextField.vue`, `common/Checkbox.vue` |
| `GlowButton.jsx` | Primary action | `common/GlowButton.vue`, including the cursor-tracked highlight |

All of the above live in `../../source_examples/`.

## Usage workflow

1. **Open** `index.html` in a browser. Nothing to install.
2. **Change the system, not the kit.** Edit a token in
   `../../colors_and_type.css` and reload — every surface, control and state in
   the kit moves with it. If something does not move, it is hard-coded and that
   is a bug in the kit.
3. **Reuse a component** by copying its file plus the matching block of the
   `<style>` element in `index.html`. Each component is presentational; `App.jsx`
   owns all state, so a component drops into another host unchanged.
4. **Port to a real stack** by keeping the class names. `.btn`, `.btn-glow`,
   `.card`, `.field`, `.checkbox`, `.chip`, `.eyebrow`, `.lead`, `.eyebrow-lead`,
   `.stat`, `.divider` are the system's public API and are defined in
   `colors_and_type.css`, not here.

## Design notes

- **One primary, ever.** The composer's send button is the only `.btn-glow` in
  the entire shell. Every other action is `.btn-tertiary` or `.btn-text`. Adding
  a second glow anywhere is a defect, not a preference.
- **Cards never carry a shadow.** Messages, rail items and panels separate with
  24px of radius and a 1px `#2E2C33` hairline. The only shadow in the system
  points *upward* and belongs to section panels — nothing in this kit qualifies.
- **Violet lives on edges.** Selection in the rail is a violet 1px border plus
  the raised surface, never a violet fill. The one violet *field* in the system
  is the glow button, and it flips to `#1B0D4E` text to earn its contrast.
- **Four surfaces, one hair apart.** `#050505` page, `#0D0D0F` panel, `#141319`
  raised/hover, `#2E2C33` hairline. Depth comes from radius and border, not from
  contrast.
- **Focus is a halo on inputs and a ring everywhere else.** Text controls set
  `outline: none` and draw `--shadow-input-focus`; buttons and rail items keep
  the global 2px `:focus-visible` ring. Tab through the kit to verify both.
- **Nothing dims on hover.** Hover always raises contrast (`#E8E6F0` →
  `#B19AFE`, `#0D0D0F` → `#141319`). Only `:disabled` reduces it, to opacity 0.2.
- **Motion respects the user.** The one animation here is the navigation status
  dot, and `colors_and_type.css` collapses it under
  `prefers-reduced-motion: reduce`.

## Known limitations

- React and Babel load from unpkg, so the kit needs network access on first
  paint. It is an inspection artefact, not a production bundle — never ship
  `@babel/standalone` to users.
- Production drives the glow highlight with GSAP `quickTo`
  (`duration: 0.5, ease: 'power2.out'`). GSAP is not loaded here, so
  `GlowButton.jsx` writes pointer position into `--glow-x` directly. The resting
  position (20%) is identical; the easing is not.
