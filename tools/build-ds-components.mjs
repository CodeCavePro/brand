/* ===========================================================================
 * build-ds-components.mjs — component cards for the Claude Design project.
 *
 * ds-bundle/ used to carry only Foundations: tokens, the stylesheet, the fonts
 * and four static HTML cards. Components were out of scope because a card is a
 * plain HTML file and a component is a Vue SFC, and the obvious bridge — hand
 * writing HTML that LOOKS like the component — is exactly the drifting
 * miniature the storybook was built to delete. A card that redraws Button is
 * worth less than no card, because it is wrong the first time Button changes
 * and nothing says so.
 *
 * So these cards do not redraw anything. Each one mounts the SAME compiled
 * bundle the storybook mounts — esbuild output from codecave.pro's own
 * toolchain with `vue` and `gsap` left external — through an import map
 * pointing at the vendored runtimes. What renders in the Design pane is the
 * component the site ships, by construction rather than by resemblance.
 *
 * WHAT THIS MEANS FOR EDITS. A card's stories are authored here; the component
 * inside it is not authored anywhere in this repo. Change what a card
 * DEMONSTRATES by editing STORIES below; change what it RENDERS by changing
 * the component in codecave.pro, recapturing, and rebuilding the storybook.
 *
 * The two stylesheets are both load-bearing. styles.css carries the tokens.
 * tw-bridge.css carries the Tailwind utilities the templates use, scoped to
 * .sb-canvas — without it every component renders unstyled and NOTHING errors,
 * which is the same failure a consumer hits when it forgets the @source line
 * for node_modules (CCWEB2-360).
 *
 * AND A BUNDLE REACHES FOR MORE THAN CODE. A compiled bundle injects its scoped
 * CSS at runtime, so every url() inside it resolves against the CARD's location,
 * not the bundle's. The storybook pages sit two levels deep and the captures'
 * `../../assets/images/…` happens to land on the site root there; a card sits
 * three levels deep and the same string lands somewhere that does not exist.
 * Checkbox's tick was 404ing here for exactly that reason — the third time this
 * repo has been bitten by treating "what a component reaches for" as imports
 * only (CCWEB2-370 was the first, in the package build). So assetsFor() reads
 * the url() targets back out of the bundles rather than trusting a list and
 * says where the card will ask for each one, failing the build if no authored
 * file answers it. Never hand-edit a bundle to fix a path: the bundle is the
 * record. It no longer COPIES: tools/design-sync-map.mjs takes the mapping and
 * DesignSync uploads the authored file straight to that project path.
 *
 * Run: node tools/build-ds-components.mjs
 * ======================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const repo = path.join(docs, '..');
const BUNDLE = path.join(repo, 'ds-bundle');
/* The compiled bundles are read from the storybook output DIRECTLY. They used
 * to be read from ds-bundle/compiled/, which build-ds-bundle.sh copied there
 * first -- a staging mirror that existed only because the upload was treated
 * as a directory to sync. DesignSync's write_files takes the project path and
 * the local path as independent arguments, so it never needed one. */
const COMPILED = path.join(repo, 'docs', 'storybook', 'compiled');
const OUT = path.join(BUNDLE, 'components', 'Components');

/* Only components whose props are plain data belong here. ArticlePreview,
 * Review, link-group, technology-card and pain-points-item each take a CMS
 * shaped object or injected port, and a card carrying invented article copy
 * would be documenting the fixture rather than the component — the storybook
 * pages, which have room to explain the fixture, remain the right home. */
export const STORIES = [
  {
    name: 'Button',
    title: 'Button',
    lede: 'Seven variants off one prop. Four are pills; three are bare text links that share no box at all. Knowing which is which is the whole API.',
    setup: `const BOX = 'h-11 px-6 py-1';`,
    stories: {
      primary:   `{ title: 'Book a call', class: BOX }`,
      secondary: `{ title: 'Learn more', variant: 'secondary' }`,
      tertiary:  `{ title: 'Decline', variant: 'tertiary' }`,
      ghost:     `{ title: 'Services', variant: 'ghost', as: 'link', href: '#' }`,
      text:      `{ title: 'Cloud & DevOps', variant: 'text', as: 'link', href: '#' }`,
      link:      `{ title: 'Read the policy', variant: 'link', as: 'link', href: '#' }`,
      disabled:  `{ title: 'Submit', isDisabled: true, class: BOX }`,
    },
  },
  {
    name: 'GlowButton',
    title: 'Glow button',
    lede: 'The single loudest control in the system: one per screen, reserved for the primary conversion. The halo is --shadow-glow-button, three stacked violet layers with no offset.',
    stories: {
      'the CTA':   `{ title: 'Book a free consultation' }`,
      'full width': `{ title: 'Accept', class: 'w-full' }`,
    },
  },
  {
    name: 'Checkbox',
    title: 'Checkbox',
    lede: 'Two variants and two sizes. The tick is a background-image, which is why the icon has to ship beside the component — it is not an import, so a walk that followed only imports never saw it (CCWEB2-370). Note the checked prop is modelValue here and isChecked on Radio; the two are not spelled the same.',
    /* The checked story is not decoration. Every other story leaves the box
     * empty, so a missing tick asset renders identically to a working one --
     * which is how the 404 survived the first pass. */
    stories: {
      'primary · medium':   `{ id: 'cb1', label: 'I agree to the privacy policy', variant: 'primary', size: 'medium' }`,
      'primary · checked':  `{ id: 'cb5', label: 'I agree to the privacy policy', variant: 'primary', size: 'medium', modelValue: true }`,
      'primary · small':    `{ id: 'cb2', label: 'Subscribe to insights', variant: 'primary', size: 'small' }`,
      'secondary · medium': `{ id: 'cb3', label: 'Cloud & DevOps', variant: 'secondary', size: 'medium' }`,
      'secondary · small':  `{ id: 'cb4', label: 'Automation & AI', variant: 'secondary', size: 'small' }`,
    },
  },
  {
    name: 'Radio',
    title: 'Radio',
    lede: 'Pick-one. Same two variants as the checkbox; the secondary variant renders as a chip rather than a dot, which is how the service pickers read as a row of options.',
    stories: {
      'primary · checked':   `{ id: 'r1', label: '$10–25k', name: 'ds-budget', isChecked: true, variant: 'primary' }`,
      'primary':             `{ id: 'r2', label: '$25–50k', name: 'ds-budget', variant: 'primary' }`,
      'secondary · checked': `{ id: 'r3', label: 'Cloud & DevOps', name: 'ds-svc', isChecked: true, variant: 'secondary' }`,
      'secondary':           `{ id: 'r4', label: 'AR & VR', name: 'ds-svc', variant: 'secondary' }`,
    },
  },
  {
    name: 'InputText',
    title: 'Input',
    lede: 'One line of text, 64px tall — --input-height, not the 48px control height the buttons sit on. The error state carries --shadow-input-error.',
    stories: {
      'text':  `{ id: 'ds-name', label: 'Name', type: 'text', placeholder: 'Ada Lovelace' }`,
      'email': `{ id: 'ds-email', label: 'Email', type: 'email', placeholder: 'ada@example.com' }`,
      'error': `{ id: 'ds-err', label: 'Email', type: 'email', placeholder: 'ada@example.com', isError: true, errorMessage: 'Enter a valid email address' }`,
    },
    wide: true,
  },
  {
    name: 'TextField',
    title: 'Text field',
    lede: 'The multi-line sibling of the input. Its error message is the one accessibility defect the system has on record — 2.91:1, tracked as CCWEB2-320.',
    stories: {
      'default': `{ id: 'ds-msg', label: 'Message', placeholder: 'Tell us about your project' }`,
      'error':   `{ id: 'ds-msg2', label: 'Message', placeholder: 'Tell us about your project', isError: true, errorMessage: 'This field is required' }`,
    },
    wide: true,
  },
  {
    name: 'TypingEffect',
    title: 'Typing effect',
    lede: 'The homepage headline treatment. GSAP SplitText drives it, which is why this card loads gsap through the import map alongside vue.',
    stories: {
      'headline': `{ text1: 'Optimize costs.', text2: 'Protect your Data' }`,
    },
    wide: true,
  },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const slug = (s) => s.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

function card(c) {
  const ids = Object.keys(c.stories).map((k) => [`s-${slug(k)}`, k]);
  const cells = ids
    .map(([id, cap]) => `  <div class="cell"><div id="${id}"></div><span class="cap">${esc(cap)}</span></div>`)
    .join('\n');
  const table = ids
    .map(([id, cap]) => `    '${id}': ${c.stories[cap]},`)
    .join('\n');

  return `<!-- @dsCard group="Components" -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>CODECAVE — ${esc(c.title)}</title>

<!-- GENERATED by docs/tools/build-ds-components.mjs. Edit the STORIES table
     there, never this file.

     The component below is not re-implemented here: this mounts the same
     compiled bundle the storybook mounts, which is esbuild output from
     codecave.pro's own toolchain with 'vue' and 'gsap' left external. The
     import map is what resolves those. So the card is a record of the shipped
     component rather than a drawing of it, and it cannot drift.

     Both stylesheets matter. styles.css carries the tokens; tw-bridge.css
     carries the Tailwind utilities the template uses, scoped to .sb-canvas.
     Drop the second and everything renders unstyled with no error at all. -->
<link rel="stylesheet" href="../../../styles.css">
<link rel="stylesheet" href="../../../tw-bridge.css">

<script type="importmap">
{
  "imports": {
    "vue": "../../../vendor/vue.esm-browser.prod.js",
    "gsap": "../../../vendor/gsap/index.js",
    "gsap/SplitText": "../../../vendor/gsap/SplitText.js"
  }
}
</script>

<style>
  body { padding: 40px; background: var(--color-surface-primary); }
  h1 { font-size: var(--text-subhead); margin: 0 0 8px; color: var(--color-heading); }
  p.lede { color: var(--color-body-secondary-lighter); margin: 0 0 32px; max-width: 62ch; }
  .grid { display: flex; flex-wrap: wrap; gap: 24px 32px; align-items: flex-start; }
  .cell { display: flex; flex-direction: column; gap: 8px; ${c.wide ? 'flex: 1 1 320px; min-width: 320px;' : ''} }
  .cap { font-size: var(--text-xs); color: var(--color-body-secondary-lighter); }
</style>
</head>
<body class="sb-canvas">

<h1>${esc(c.title)}</h1>
<p class="lede">${esc(c.lede)}</p>

<div class="grid">
${cells}
</div>

<script type="module">
  import { createApp } from 'vue';
  import ${c.name} from '../../../compiled/${c.name}.js';

${c.setup ? '  ' + c.setup + '\n' : ''}  const stories = {
${table}
  };
  for (const [el, props] of Object.entries(stories)) {
    createApp(${c.name}, props).mount('#' + el);
  }
</script>

</body>
</html>
`;
}

/* Every url() a bundle carries, MAPPED to where the CARD will ask for it.
 *
 * The specifier is relative and was written for the storybook's page depth, so
 * the leading ../ segments carry no information — what identifies the file is
 * the remainder. Resolve the specifier against the card's own directory to
 * learn where it must LAND in the Design project, and take the remainder to
 * learn which authored file ANSWERS it. A specifier neither root can satisfy
 * fails the build: that is a component reaching outside what this bundle can
 * carry, and it must be answered rather than 404'd in a reader's browser.
 *
 * The resolution base is the card's DIRECTORY, because the bundle injects its
 * scoped CSS as a <style> element and a relative url() there resolves against
 * the DOCUMENT, not against the module that wrote it. The cards sit three
 * levels deep, so `../assets/…` lands under components/Components/ — which is
 * why the copy this replaced put a stale one at components/assets/ that no
 * card could ever reach.
 *
 * This returns the mapping instead of performing a copy. Nothing is written to
 * disk: DesignSync uploads the authored file straight to the project path. */
export function assetsFor(name) {
  const src = fs.readFileSync(path.join(COMPILED, `${name}.js`), 'utf8');
  const cardDir = path.posix.join('components', 'Components', name);
  const placed = [];

  for (const m of src.matchAll(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^"')\s]+))\s*\)/g)) {
    const spec = m[1] ?? m[2] ?? m[3];
    if (/^(data:|https?:|\/\/|#)/.test(spec)) continue;

    const bare = spec.replace(/^\.\//, '').replace(/^(\.\.\/)+/, '');
    /* src/ is authored and docs/ is payload, so ask src/ first. Both carry the
       checkbox tick today, byte-identical; only one of them is the origin. */
    const roots = [path.join(repo, 'src', 'components'), docs];
    const from = roots.map((r) => path.join(r, bare)).find((f) => fs.existsSync(f));
    if (!from) {
      console.error(
        `${name}.js reaches url(${spec}) — neither src/components/${bare} nor ` +
          `docs/${bare} exists.\nAdd the asset, or the card will 404 silently.`,
      );
      process.exit(1);
    }

    placed.push({
      path: path.posix.normalize(path.posix.join(cardDir, spec)),
      localPath: path.relative(repo, from).split(path.sep).join('/'),
    });
  }
  return placed;
}

/* Importing this module must not WRITE anything. design-sync-map.mjs imports
 * STORIES and assetsFor() to build the upload map, and a top-level write loop
 * would mean `npm run check` silently regenerated the cards as a side effect of
 * checking them -- a check that repairs what it is measuring measures nothing. */
const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

let written = 0;
const assets = [];
for (const c of invokedDirectly ? STORIES : []) {
  const bundle = path.join(COMPILED, `${c.name}.js`);
  if (!fs.existsSync(bundle)) {
    console.error(`no compiled bundle for ${c.name} — run \`npm run build:storybook\` first`);
    process.exit(1);
  }
  const dir = path.join(OUT, c.name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${c.name}.html`), card(c));
  assets.push(...assetsFor(c.name));
  written += 1;
}
if (invokedDirectly) {
console.log(
  `ds-bundle component cards: ${written} written (${STORIES.map((c) => c.name).join(', ')})`,
);
console.log(
  assets.length
    ? `  + ${assets.length} bundle asset(s) mapped: ${[...new Set(assets.map((a) => a.path))].join(', ')}`
    : '  no bundle reached for an asset — if a component has a background-image, that is a bug',
);
}
