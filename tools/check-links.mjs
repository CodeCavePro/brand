/* Every documentation route this repo's prose cites has to exist.
 *
 *   node docs/tools/check-links.mjs
 *
 * Collapsing five documentation surfaces into two moved almost every URL on
 * this site: preview/ and storybook/ merged into kitchen-sink/, artifacts/
 * became examples/raw/ behind a wrapper page, and brand-kit.html was folded
 * into the home page as anchors. The pages were checked. The dozens of places
 * that CITE them, across a dozen prose and config files, were not — and a
 * markdown link to a page that no longer exists fails nowhere: not in the
 * build, not in CI, not in any other check here. It fails for a reader.
 *
 * That is the same shape as the deliverables losing their assets: a real fault
 * in something nothing was looking at. So it gets the same treatment.
 *
 * THE ROUTE SET IS DERIVED FROM COMMITTED SOURCE, NOT FROM dist/. dist/ is
 * gitignored, so reading it would make this check need a build to be honest and
 * silently pass on a stale one. Both inputs here are tracked, which is what lets
 * it run in CI unbuilt -- the same reasoning check:importmap is built on.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { PUBLISHED } from './astro-passthrough.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = path.join(root, 'docs');
const pages = path.join(docs, 'pages');

/* ---- what the build will emit ------------------------------------------- */
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

const routes = new Set();
const anchors = new Map(); // route -> Set of ids it declares
const anchorClassed = new Map(); // 'route#id' -> does it carry .ds-anchor
const unlayouted = [];

/* A page under pages/ emits at its own path with build.format: 'preserve'. */
for (const file of walk(pages)) {
  if (!file.endsWith('.astro')) continue;
  const r = path.relative(pages, file).split(path.sep).join('/').replace(/\.astro$/, '.html');
  routes.add(r);
  if (r.endsWith('index.html')) routes.add(r.slice(0, -'index.html'.length)); // the directory form
  const src = fs.readFileSync(file, 'utf8');
  anchors.set(r, new Set([...src.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])));

  /* An element a sub-nav link jumps to has to carry .ds-anchor, which is the
     only thing offsetting it past the two sticky bars. Without it the jump
     "works" — the URL changes, the page scrolls — and the heading lands
     underneath the navigation, which is how eight of thirteen targets shipped
     that way without anyone noticing. */
  for (const m of src.matchAll(/<[a-z0-9]+\b([^>]*\bid="([^"]+)"[^>]*)>/gi)) {
    anchorClassed.set(`${r}#${m[2]}`, /\bds-anchor\b/.test(m[1]));
  }

  /* The main menu is the same on every page because DocPage renders it with no
     prop to override — there is no way for a page to get a DIFFERENT menu. The
     only way to get NO menu is to not use the layout, which is a normal-looking
     .astro file that builds fine and quietly drops off the navigation. */
  if (!/from\s+'[^']*layouts\/DocPage\.astro'/.test(src)) unlayouted.push(r);
}

if (unlayouted.length) {
  console.error(
    `${unlayouted.length} page(s) do not go through DocPage.astro:\n` +
      unlayouted.map((r) => `  ${r}`).join('\n') +
      '\n\nEvery route carries the same main menu, and that holds because the\n' +
      'layout renders it and takes no prop to change it. A page that skips the\n' +
      'layout is the one way to break it: it builds, it renders, and it is simply\n' +
      'missing from the navigation with nothing to say so.',
  );
  process.exit(1);
}

/* ---- the four routes that legitimately do NOT go through DocPage ---------
 * The guides are rendered by Starlight, so DocPage never runs for them and the
 * assertion above cannot reach them. That is a hole in "every route carries the
 * same main menu" unless something else closes it, and an exemption that closes
 * nothing is worse than no exemption at all -- it reads as coverage.
 *
 * What actually carries the menu there is the Header override, which renders
 * the same DsNav and SubNav out of the same menu.ts. So the invariant holds by
 * a different mechanism, and this asserts that mechanism is still wired: the
 * config has to name the override, and the override has to render both tiers.
 * Deleting either one leaves a build that succeeds and four pages with
 * Starlight's own header on them.
 */
const configSrc = fs.readFileSync(path.join(root, 'astro.config.mjs'), 'utf8');
const OVERRIDE = 'docs/starlight-overrides/Header.astro';

if (!configSrc.includes(OVERRIDE)) {
  console.error(
    `astro.config.mjs does not name ${OVERRIDE} as Starlight's Header.\n` +
      `Without it the four guide routes render Starlight's own header instead of\n` +
      `this site's bar -- a build that succeeds and a surface that is off-brand and\n` +
      `off-navigation at once.`,
  );
  process.exit(1);
}

const overrideSrc = fs.readFileSync(path.join(root, OVERRIDE), 'utf8');
/* A tag, not a substring. `overrideSrc.includes('<SubNav')` is satisfied by
   `<SubNavX`, so renaming the component past this check was invisible -- which
   is the same mistake usesAlias() was fixed for, in the other direction. */
const missingTiers = ['DsNav', 'SubNav'].filter(
  (c) => !new RegExp(`<${c}(?![A-Za-z0-9_-])`).test(overrideSrc),
);
if (missingTiers.length) {
  console.error(
    `${OVERRIDE} does not render: ${missingTiers.join(', ')}.\n` +
      `The guides carry both tiers because they are pages of this site, not a\n` +
      `documentation appliance bolted to the side of it.`,
  );
  process.exit(1);
}

/* Everything under docs/ that is not a page is payload and is copied verbatim. */
for (const file of walk(docs)) {
  if (file.startsWith(pages + path.sep)) continue;
  routes.add(path.relative(docs, file).split(path.sep).join('/'));
}

/* And the published half of src/ -- colors_and_type.css, theme.css, the fonts
 * and the token modules are authored there and copied out to these URLs by the
 * passthrough. A route is a route whether the build rendered it, copied it from
 * docs/ or copied it from src/; leaving this out reported the front page's own
 * stylesheet as a dead link the day the file moved. The map is READ from the
 * passthrough rather than restated, because that file is the one place that
 * decides what src/ publishes and where. */
for (const [from, to] of PUBLISHED) {
  const source = path.join(root, 'src', from);
  if (!fs.existsSync(source)) continue;
  if (!fs.statSync(source).isDirectory()) {
    routes.add(to);
    continue;
  }
  for (const file of walk(source)) {
    routes.add(`${to}/${path.relative(source, file).split(path.sep).join('/')}`);
  }
}

/* ---- the prose collection ------------------------------------------------
 * Four routes exist that have no .astro under pages/: Starlight renders them
 * from the collection in docs/content.config.ts, out of DESIGN.md, README.md,
 * SKILL.md and guide.md where those already sit.
 *
 * A route set derived from pages/ alone cannot see them, and the failure that
 * causes is silent in the worst way -- every link to a guide would be reported
 * as DEAD, so the honest response to adding the surface would have been to stop
 * trusting this check. It is taught about the collection instead.
 *
 * The slugs are read out of the config rather than listed here. There is
 * exactly one place the guide routes are decided, and this is not it.
 */
const collectionSrc = fs.readFileSync(path.join(docs, 'content.config.ts'), 'utf8');
const guides = [...collectionSrc.matchAll(/file:\s*'([^']+)',\s*slug:\s*'([^']+)'/g)].map((m) => ({
  file: m[1],
  slug: m[2],
}));

if (guides.length < 4) {
  console.error(
    `only ${guides.length} guide(s) read out of docs/content.config.ts — the GUIDES shape ` +
      `changed, and this check would report every guide route as dead if it kept going.`,
  );
  process.exit(1);
}

for (const g of guides) {
  /* The loader throws on a missing file at build time. This says so without a
     build, which is the only reason check:links runs in CI at all. */
  if (!fs.existsSync(path.join(docs, g.file))) {
    console.error(
      `docs/content.config.ts names docs/${g.file}, which does not exist.\n` +
        `The prose collection renders the shipped files in place; a rename has to be made there too.`,
    );
    process.exit(1);
  }
  routes.add(`guides/${g.slug}.html`);
}

if (routes.size < 40) {
  console.error(
    `only ${routes.size} route(s) derived from docs/ — the layout moved, and this ` +
      `check would report every link as dead if it kept going.`,
  );
  process.exit(1);
}

/* ---- every sub-nav target must clear the sticky bars --------------------- */
const menuSrc = fs.readFileSync(path.join(docs, 'components', 'menu.ts'), 'utf8');
const targets = [...menuSrc.matchAll(/href: '([^']+#[a-z0-9-]+)'/g)].map((m) => m[1]);
if (targets.length < 6) {
  console.error(
    `only ${targets.length} sub-nav target(s) read out of menu.ts — the shape changed, ` +
      `and this check would assert nothing if it kept going.`,
  );
  process.exit(1);
}
const badTargets = [
  ...targets.filter((t) => anchorClassed.get(t) === undefined)
    .map((t) => `  ${t}  — nothing on that page declares that id`),
  ...targets.filter((t) => anchorClassed.get(t) === false)
    .map((t) => `  ${t}  — the element exists but carries no .ds-anchor`),
];
if (badTargets.length) {
  console.error(
    `${badTargets.length} sub-nav target(s) will land behind the navigation:\n` +
      badTargets.join('\n') +
      '\n\nA sub-nav link jumps to an element the two sticky bars sit on top of, and' +
      '\n.ds-anchor is the only thing offsetting it clear of them. Without it the jump' +
      '\n"works" — the URL changes, the page scrolls — and the reader is left looking' +
      '\nat whatever sits below a heading they cannot see. Eight of thirteen targets' +
      '\nshipped that way before this asked.',
  );
  process.exit(1);
}

/* ---- and every nav target that is a PAGE has to be a page ----------------
 * The block above only ever looked at hrefs containing a '#', because when it
 * was written the only sub-nav worth doubting was the kitchen sink's in-page
 * anchors. That left the sibling-page bars entirely unchecked -- six under
 * examples/ and, once the guides landed, four more. A menu entry pointing at a
 * page that does not exist is the plainest dead link on the site and was the
 * one kind nothing here asked about.
 *
 * `[^']+\.html` ends at the quote, so an anchor href is not matched twice. */
const pageTargets = [...menuSrc.matchAll(/href: '([^']+\.html)'/g)].map((m) => m[1]);
if (pageTargets.length < 10) {
  console.error(
    `only ${pageTargets.length} page target(s) read out of menu.ts — the shape changed, ` +
      `and this check would assert nothing if it kept going.`,
  );
  process.exit(1);
}
const deadTargets = pageTargets.filter(
  (t) => !routes.has(t) && !routes.has(t.replace(/index\.html$/, '')),
);
if (deadTargets.length) {
  console.error(
    `${deadTargets.length} navigation target(s) point at nothing:\n` +
      deadTargets.map((t) => `  ${t}`).join('\n') +
      '\n\nEvery MAIN and SUB href that names a page has to be one. A guide slug\n' +
      'renamed in content.config.ts without menu.ts following lands exactly here,\n' +
      'and lands nowhere else: the build succeeds, the bar renders, and the link\n' +
      '404s.',
  );
  process.exit(1);
}

/* ---- menu.ts and content.config.ts have to agree about the guides --------
 * Two files decide what a guide is called: the collection decides the ROUTE,
 * the menu decides the BAR. The check above catches a slug the menu points at
 * and the collection does not render. This catches the other direction -- a
 * guide that exists and is in no bar, which is the orphan-page failure the
 * whole surface was added to fix. */
const guidesBlock = menuSrc.match(/\n {2}guides:\s*\[([\s\S]*?)\n {2}\],/);
if (!guidesBlock) {
  console.error(`menu.ts has no SUB["guides"] block, so the four guide routes are in no bar.`);
  process.exit(1);
}
const barred = [...guidesBlock[1].matchAll(/href: 'guides\/([a-z0-9-]+)\.html'/g)].map((m) => m[1]);
const unbarred = guides.map((g) => g.slug).filter((s) => !barred.includes(s));
if (unbarred.length) {
  console.error(
    `${unbarred.length} guide(s) render but appear in no navigation:\n` +
      unbarred.map((s) => `  guides/${s}.html  (from docs/content.config.ts)`).join('\n') +
      '\n\nA rendered page nothing links to is reachable only by typing its URL.\n' +
      'All four guides were in that state before this surface existed, which is\n' +
      'the reason it does.',
  );
  process.exit(1);
}

/* ---- every file a PAGE reaches for at runtime has to be there ------------
 * The two blocks above ask about prose and about the menu. Neither asks the
 * plainest question of all: when this page runs, does the file it imports
 * exist?
 *
 * Nothing did, and the cost was the entire storybook. Collapsing the surfaces
 * moved pages/storybook/*.astro to pages/kitchen-sink/*.astro, and `./compiled/
 * Button.js` -- correct while the page lived at /storybook/ -- silently became
 * /kitchen-sink/compiled/Button.js, which does not exist. 28 references across
 * 13 pages broke at once. The build stayed green, every other check stayed
 * green, and every specimen on the site rendered an empty box: the imports are
 * inside `<script is:inline type="module">`, so Astro ships them verbatim and
 * never resolves them, and a module that 404s fails in the browser and nowhere
 * else.
 *
 * check:importmap did not catch it and could not: it compares the bare
 * specifiers inside the bundles against the vendor map, so it proves `vue`
 * resolves. It never asks whether the PAGE can reach the bundle.
 *
 * Same shape as the deliverables losing their assets, one directory up -- and
 * the same answer, which is to ask rather than to remember.
 *
 * THERE ARE THREE RESOLVERS ON AN .astro PAGE, not two, and a reference has to
 * be judged by whichever one owns it:
 *
 *   ABOVE THE FENCE            Astro's, at build time, against the SOURCE tree.
 *                              Skipped -- judging a layout import by the output
 *                              tree reports every page's layout as a dead file.
 *
 *   <script> WITHOUT is:inline Vite's, at build time, also against the SOURCE
 *                              tree. This is where the kitchen-sink specimens
 *                              live now: they import the component .vue sources
 *                              directly, so editing one hot-reloads the page.
 *                              Judged against the output tree those read as
 *                              pointing three levels above the site root, which
 *                              is how this check greeted the change -- twelve
 *                              dead files, every one of them fine.
 *
 *   EVERYTHING ELSE            the browser's, at request time, against the
 *                              OUTPUT tree. Markup src/href, url(), and the
 *                              contents of an is:inline script, which Astro
 *                              ships verbatim.
 *
 * So the Vite half is checked against the source tree and the browser half
 * against the built tree. Neither is exempt; they are asked different questions.
 */
const runtimeMissing = [];
const sourceMissing = [];
const mapMismatch = [];
let runtimeOk = 0;

for (const file of walk(pages)) {
  if (!file.endsWith('.astro')) continue;
  const src = fs.readFileSync(file, 'utf8');

  /* Below the closing fence only. A page with no fence is all body. */
  const fence = src.startsWith('---') ? src.indexOf('\n---', 3) : -1;
  const body = fence === -1 ? src : src.slice(src.indexOf('\n', fence + 1) + 1);

  /* Who resolves what. A <script> Astro processes is Vite's; one marked
     is:inline is shipped verbatim and so is the browser's. */
  const viteScripts = [];
  const browserBody = body.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/g,
    (whole, attrs, inner) => {
      if (/\bis:inline\b/.test(attrs)) return whole;
      viteScripts.push(inner);
      return '';
    },
  );
  const viteBody = viteScripts.join('\n');

  /* Where this page's OUTPUT lands, which is what a relative URL resolves
     against. 'preserve' emits pages/x/y.astro at x/y.html, so the directory is
     the page's own directory. */
  const outDir = path.relative(pages, path.dirname(file)).split(path.sep).join('/');

  /* A bare specifier inside an is:inline script has nothing to resolve it.
     Astro ships that script verbatim, so `import { createApp } from 'vue'`
     reaches the browser as written and dies on "Failed to resolve module
     specifier" -- the whole module graph is rejected, the page renders, and
     every specimen on it is an empty box.

     DocPage used to answer this with an `importmap` prop emitting a vendored
     map. Nothing passes it any more: the specimens import their sources through
     Vite, which resolves `vue` at build time. So the rule inverted -- from
     "declare the map" to "do not write an import an is:inline script cannot
     follow" -- and the map moved to tools/storybook-vendor.mjs, where its one
     remaining consumer (ds-bundle) is checked against it. */
  const inlineBare = [
    ...body
      .replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/g, (w, a, inner) =>
        /\bis:inline\b/.test(a) ? inner : '')
      .matchAll(/import\s[^'"]*from\s*['"]([^.\/'"][^'"]*)['"]/g),
  ].map((m) => m[1]);
  const docPageTag = /<DocPage\b([^>]*)>/.exec(body);
  const relPage = path.relative(root, file).split(path.sep).join('/');

  if (inlineBare.length) {
    mapMismatch.push(
      `  ${relPage}\n      an is:inline script imports ${[...new Set(inlineBare)].join(', ')} — nothing resolves a bare specifier there`,
    );
  }

  /* And a page that mounts a component needs the utilities those components
     are written in. Without them it mounts perfectly and renders as raw HTML,
     every class resolving to nothing -- which does not look like a failure at
     all, it looks like a component with no styling of its own. The hub did
     exactly that once: it DESCRIBED the stylesheet in its own prose, two
     hundred lines below a list that did not include it.

     This is now docs/tailwind.css, IMPORTED above the fence rather than listed
     as a raw href, because Vite has to compile it -- a plain <link> would ship
     the file with its `@import "tailwindcss/..."` unresolved. So the test is on
     the FRONTMATTER, not the body; matching anywhere in the file would let the
     prose about the stylesheet satisfy the check that the prose is wrong. */
  const frontmatter = fence === -1 ? '' : src.slice(0, fence);
  const mountsCompiled = /from\s*['"][^'"]*\.vue['"]/.test(viteBody);
  const linksBridge = /import\s+['"][^'"]*\/tailwind\.css['"]/.test(frontmatter);

  if (mountsCompiled && !linksBridge) {
    mapMismatch.push(
      `  ${relPage}\n      mounts a component but does not import tailwind.css — it will render unstyled`,
    );
  } else if (linksBridge && !mountsCompiled) {
    mapMismatch.push(
      `  ${relPage}\n      imports tailwind.css but mounts no component`,
    );
  }

  /* The Vite half, against the SOURCE tree — it is resolved at build time from
     where the page SITS, not from where it lands. A wrong one is a build error
     rather than a silent 404, so this is a courtesy check; it is here because
     the two halves are one line apart and reading them under one rule is
     exactly the mistake this file exists to stop anyone making. */
  for (const [, ref] of viteBody.matchAll(/from\s*['"](\.[^'"]+)['"]/g)) {
    if (!fs.existsSync(path.resolve(path.dirname(file), ref))) {
      sourceMissing.push(`  ${relPage}\n      ${ref}`);
    }
  }

  const refs = [
    ...[...browserBody.matchAll(/import\s[^'"]*from\s*['"](\.[^'"]+)['"]/g)].map((m) => m[1]),
    /* Any quoted src/href that is a relative URL -- NOT only the ones spelled
       with a leading ./ or ../. The examples gallery links its six cards as a
       bare `href="deck.html"`, which is every bit as relative and every bit as
       breakable by moving the page. Astro expressions are href={...} and are
       unquoted, so they are skipped here and covered by the menu checks. */
    ...[...browserBody.matchAll(/\s(?:src|href)="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((v) => !/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(v)),
    ...[...browserBody.matchAll(/url\(\s*['"]?(\.\.?\/[^)'"]+)['"]?\s*\)/g)].map((m) => m[1]),
  ];

  for (const ref of new Set(refs)) {
    /* An .astro is never fetched by a browser; if one appears below the fence
       it is a component tag's import and Astro owns it. */
    if (ref.endsWith('.astro')) continue;

    const target = path
      .normalize(path.join(outDir, ref.split('#')[0].split('?')[0]))
      .split(path.sep)
      .join('/');

    /* `routes` is the union of what the build RENDERS and what it COPIES, which
       is exactly what a browser can ask for. So ../index.html resolves against
       a page that is rendered, and ../storybook/compiled/Button.js against a
       file that is copied, with no special case for either. */
    if (routes.has(target) || routes.has(target + '/index.html') || routes.has(target + '/')) {
      runtimeOk += 1;
    } else {
      const rel = path.relative(root, file).split(path.sep).join('/');
      runtimeMissing.push(`  ${rel}\n      ${ref}   →   ${target}`);
    }
  }
}

if (mapMismatch.length) {
  console.error(
    `${mapMismatch.length} page(s) mount a component without what it needs to run:\n` +
      mapMismatch.join('\n') +
      '\n\nMounting a component takes something the page has to ask for, and\n' +
      'DocPage supplies it by default to nobody. docs/tailwind.css carries the\n' +
      'utilities those components are written in, compiled by Vite against the\n' +
      'two component roots; without it they mount and render as raw HTML, every\n' +
      'class resolving to nothing. That fails in the browser and nowhere else,\n' +
      'and it does not even look like a failure -- it looks like a component\n' +
      'with no styling of its own. Asked in both directions, because a\n' +
      'stylesheet imported and unused is a claim that has stopped being true.',
  );
  process.exit(1);
}

if (sourceMissing.length) {
  console.error(
    `${sourceMissing.length} reference(s) from a processed <script> point at a file that is not there:\n` +
      sourceMissing.join('\n') +
      "\n\nThese are Vite's, resolved at build time against the SOURCE tree, so\n" +
      'they are relative to where the page sits rather than to where it lands.\n' +
      'The two are different depths, and a path that is right for one is quietly\n' +
      'wrong for the other.',
  );
  process.exit(1);
}

if (runtimeMissing.length) {
  console.error(
    `${runtimeMissing.length} reference(s) from a page point at a file the build does not have:\n` +
      runtimeMissing.join('\n') +
      '\n\nThese are resolved by the BROWSER, against the built tree, so a wrong one\n' +
      'fails nowhere in this repository: the build succeeds and the reader gets an\n' +
      'empty box. Moving a page between directories is what breaks them, because a\n' +
      "relative path that was right at the old depth is wrong at the new one and\n" +
      'still looks perfectly reasonable.',
  );
  process.exit(1);
}

/* ---- where citations live ------------------------------------------------
 * An explicit list rather than a glob. A .html in a code comment is usually an
 * illustration of a rule ("a page written as both x.astro and x.html…"), not a
 * link, and sweeping those in would train everyone to ignore this check. These
 * are the files whose .html references are addresses a reader will follow. */
const SCAN = [
  'README.md',
  'CONTRIBUTING.md',
  'RELEASING.md',
  'CLAUDE.md',
  'WEBSITE-REVIEW.md',
  'docs/README.md',
  'docs/DESIGN.md',
  'docs/SKILL.md',
  'docs/guide.md',
  'src/styles/colors_and_type.css',
  'packages/brand/README.md',
  '.design-sync/conventions.md',
];

/* A route reference: an optional leading ./ ../ or /, an optional docs/ prefix,
   then a path ending in .html — plus the bare directory forms this site uses. */
const REF = /(?<![\w#?=])((?:\.{0,2}\/)?(?:docs\/)?[a-z0-9][a-z0-9._-]*(?:\/[a-z0-9][a-z0-9._-]*)*\/?)(#[a-z0-9-]+)?/gi;
/* Markdown link targets, which are addresses by construction whatever they
   look like. */
const MD_LINK = /\]\(([^)\s]+?)(#[a-z0-9-]+)?\)/gi;
const LOOKS_LIKE_ROUTE = (s) =>
  s.endsWith('.html') || /^(?:\.{0,2}\/)?(?:docs\/)?(kitchen-sink|examples)\/?$/.test(s);

/* A bare `newsletter.html` mid-sentence, after a fully qualified sibling, is a
   NAME rather than an address — "`docs/examples/raw/email.html`,
   `newsletter.html`" is ordinary English and nobody is going to type the second
   one into a browser. Flagging those buries the real dead links in noise, which
   is how a check stops being read. So a reference has to carry a `/` to count,
   unless it is a markdown link target, where the author has said it is an
   address. The cost is that renaming a page will not be caught in prose that
   mentions it by bare name; that is worth it. */
const IS_ADDRESS = (s, fromMarkdownLink) => fromMarkdownLink || s.includes('/');

/* Names of things that were DELETED. A record of what was removed has to keep
   calling it by the name it had, so these are addresses that must NOT resolve —
   and each has to be exercised, so one that starts resolving again (a new page
   claiming a retired name) fails rather than passing quietly. */
const GONE = [
  {
    file: 'docs/README.md',
    ref: 'system/index.html',
    why:
      'part of the generated token layer that was removed rather than corrected, ' +
      'because it derived a primary of #7040da from a seed of #5F20FE. The ' +
      'paragraph is a record of the deletion and has to name what it deleted.',
  },
];
const goneUsed = new Map(GONE.map((g) => [g, 0]));

const normalise = (s) =>
  s
    .replace(/^\.{0,2}\//, '')
    .replace(/^docs\//, '')
    .replace(/^\/+/, '');

const dead = [];
let live = 0;

for (const rel of SCAN) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.error(`${rel} is in SCAN but does not exist — remove it or fix the path.`);
    process.exit(1);
  }
  const src = fs.readFileSync(full, 'utf8');
  const seen = new Set();

  const found = [
    ...[...src.matchAll(MD_LINK)].map((m) => [m[1], m[2] ?? '', true]),
    ...[...src.matchAll(REF)].map((m) => [m[1], m[2] ?? '', false]),
  ];

  for (const [raw, frag, fromLink] of found) {
    if (!LOOKS_LIKE_ROUTE(raw)) continue;
    if (!IS_ADDRESS(raw, fromLink)) continue;
    /* A package path is not a route. */
    if (raw.startsWith('@') || raw.includes('node_modules')) continue;

    const target = normalise(raw);
    const key = target + frag;
    if (seen.has(key)) continue;
    seen.add(key);

    const retired = GONE.find((g) => g.file === rel && g.ref === target);
    if (retired) {
      goneUsed.set(retired, goneUsed.get(retired) + 1);
      if (routes.has(target) || routes.has(target + 'index.html')) {
        dead.push(
          `  ${rel}  →  ${raw}   (listed in GONE as deleted, but a route now claims that name)`,
        );
      }
      continue;
    }

    if (!routes.has(target) && !routes.has(target + 'index.html')) {
      dead.push(`  ${rel}  →  ${raw}${frag}`);
      continue;
    }
    /* A route that exists but does not declare the anchor is the same broken
       promise one level down — and is exactly what folding brand-kit.html into
       the home page as #anchors creates room for. */
    if (frag) {
      const page = routes.has(target) ? target : target + 'index.html';
      const ids = anchors.get(page);
      if (ids && !ids.has(frag.slice(1))) {
        dead.push(`  ${rel}  →  ${raw}${frag}   (page exists; it declares no id="${frag.slice(1)}")`);
        continue;
      }
    }
    live += 1;
  }
}

if (dead.length) {
  console.error(
    `${dead.length} dead documentation link(s):\n${dead.join('\n')}\n\n` +
      'Collapsing five surfaces into two moved most of this site’s URLs:\n' +
      '  preview/*.html, storybook/*.html  →  kitchen-sink/*.html\n' +
      '  artifacts/*.html                  →  examples/raw/*.html (wrapper: examples/*.html)\n' +
      '  brand-kit.html                    →  index.html, as #anchors\n' +
      'A markdown link to a page that no longer exists fails nowhere except for a\n' +
      'reader, which is why this is checked rather than remembered.',
  );
  process.exit(1);
}

const staleGone = [...goneUsed].filter(([, n]) => n === 0).map(([g]) => g);
if (staleGone.length) {
  console.error(
    `${staleGone.length} GONE entr(y/ies) match nothing any more:\n` +
      staleGone.map((g) => `  ${g.file}  ${g.ref} — ${g.why}`).join('\n') +
      '\n\nThe prose stopped naming it, so the entry is excusing nothing.\n' +
      'Delete it rather than leaving it to excuse something later.',
  );
  process.exit(1);
}

/* ---- repo-relative markdown links point at files that exist ---------------
 *
 * A link like [logos/](/docs/logos) is resolved by GitHub against the
 * repository, not by the site, so nothing above sees it and nothing at build
 * time does either. Moving a directory is what breaks them: README.md was
 * still offering [logos](/logos) and embedding thirteen PNGs from /logos/ and
 * /icons/ after both moved under docs/ -- fifteen dead links on the front page
 * of the repository, every check green.
 *
 * Only absolute (repository-rooted) links are checked. A relative one resolves
 * against the file's own directory and is a different question; an http(s) one
 * is somebody else's. */
const repoLinks = [];
const markdown = execFileSync('git', ['ls-files', '*.md'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean);

for (const file of markdown) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) continue;
  const text = fs.readFileSync(abs, 'utf8');
  for (const m of text.matchAll(/\]\((\/[^)#\s]+)/g)) {
    const target = m[1].replace(/^\//, '');
    if (!fs.existsSync(path.join(root, target))) repoLinks.push(`  ${file}  →  /${target}`);
  }
}

if (repoLinks.length) {
  console.error(`${repoLinks.length} repo-relative link(s) point at a path this repository does not have:`);
  for (const l of repoLinks) console.error(l);
  console.error('');
  console.error('These are resolved by GitHub against the checkout, so they fail for a');
  console.error('reader and nowhere else. Moving a directory is what breaks them.');
  process.exit(1);
}

console.log(
  `${runtimeOk} runtime reference(s) from pages resolve; ` +
    `${live} documentation link(s) resolve across ${SCAN.length} file(s), ` +
    `against ${routes.size} route(s) derived from docs/ ` +
    `(${GONE.length} deliberately-dead name(s) recorded); ` +
    `every repo-relative markdown link resolves on disk.`,
);
