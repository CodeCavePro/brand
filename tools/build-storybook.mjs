/* ===========================================================================
 * build-storybook.mjs — compile the REAL .vue components for the storybook.
 *
 * The storybook used to demo hand-copied HTML+CSS miniatures (.cc-* classes)
 * that drifted from the components they imitated. This script removes the
 * copy: it takes the verbatim SFCs under src/ and compiles them to plain ES
 * modules in docs/storybook/compiled/, using THIS repository's toolchain --
 * vue/compiler-sfc, esbuild and tailwindcss v4, all declared here and pinned to
 * the versions the site resolves. Nothing is downloaded, and no second checkout
 * is needed; see the note beside the resolver for why that changed.
 *
 * It also generates docs/storybook/tw-bridge.css: the site's Tailwind theme
 * (the captured global.css @theme) compiled against exactly the
 * utility classes the SFC templates use, PLUS the site's own :root and @theme
 * tokens scoped to `.sb-canvas, .sb-mount`.
 *
 * That scoping is deliberate, and inside the canvases it DOES redefine the
 * brand. The site's palette has moved past this package's, so a mounted
 * component resolved against colors_and_type.css would document the docs
 * system rather than the shipped one. The colour ramps are the clearest case:
 * `--color-brand-400` is #5F3ABD on the site and a different step here, and
 * the gray ramp was renumbered entirely, so an unscoped specimen would show a
 * component that exists nowhere. Scoping the site's values to the canvases is
 * what makes a specimen faithful. Outside them the docs palette is untouched.
 *
 * The radius family used to be the worked example here, because this package
 * published a `--radius-sm` at 0.5rem while Checkbox.vue reads the name and
 * the site resolves it to Tailwind's 0.25rem. That collision is gone: the two
 * t-shirt-sized radii were renamed `--radius-control` and `--radius-tile` on
 * 2026-08-20, so nothing in this package can shadow a Tailwind default any
 * more. The scoping still carries Tailwind's radii into the canvases, which is
 * now belt and braces rather than the thing holding the specimen together.
 *
 * tw-bridge.css records a digest of everything under both roots so
 * check-tw-bridge.mjs can prove the two are in step; see source-digest.mjs.
 *
 * Run:  npm run build:storybook
 *       An optional path to a codecave.pro checkout enables one extra
 *       assertion -- that the sanitizer port's dompurify matches the site's.
 *
 * Output modules keep 'vue' and 'gsap' as bare imports; the storybook pages
 * map them to docs/vendor/ via an import map. Everything else — helpers, icon
 * SFCs, and the port adapters with whatever they depend on — is bundled in.
 * Bundled rather than externalised because a page cannot forget a bundle: the
 * import map is per-page, so an adapter dependency added to the map on one page
 * and not another fails as a bare-specifier error in a reader's browser, which
 * is precisely the failure the ports exist to make impossible.
 * ======================================================================== */
import { PORTS, portFor } from './storybook-ports.mjs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { sourceDigest, DIGEST_PREFIX } from './source-digest.mjs';
import { SITE_ALIAS_PATTERN, sitePath, unalias, usesAlias } from './import-aliases.mjs';

const docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');
/* THE TOOLCHAIN IS THIS REPOSITORY'S, and that is a reversal worth stating.
 *
 * Every module below used to be resolved from a codecave.pro checkout, on the
 * argument that a specimen must be built with the SAME versions the website
 * builds with. That held while this repository was downstream. It has not been
 * since 2026-08-25: the components are authored here, the package is built
 * here, and the site installs the package -- so "the versions the site builds
 * with" is a claim about a consumer, not about the origin.
 *
 * Everything needed is already declared here and pinned to mirror the site:
 * vue/compiler-sfc 3.5.41, tailwindcss 4.3.3, @tailwindcss/oxide 4.3.3, plus
 * marked, gsap and dompurify for the bare imports the specimens carry. esbuild
 * is declared explicitly rather than taken transitively, because a transitive
 * bump would silently rewrite every bundle.
 *
 * The practical half: this script, check-tw-bridge.mjs and the Pages workflow
 * all needed a second private repository to be reachable. It was not -- CI's
 * token has been returning 403 -- so the rebuild step had never once run.
 */
const repoRoot = path.resolve(docs, '..');
const req = createRequire(path.join(repoRoot, 'package.json'));
const compiler = req('vue/compiler-sfc');
const esbuild = req('esbuild');

/* The site checkout is now OPTIONAL and has exactly one reader left: the
 * dompurify cross-check below, which already degraded to a warning when it was
 * absent. Pass a path to enable it. */
const siteDir = path.resolve(process.argv[2] ?? path.join(repoRoot, '..', 'codecave.pro'));

/* The two roots a component's source can come from, in resolution order.
 *
 * src/components/ holds what is written here; src/captured/ holds what was
 * captured from somewhere else. Both are searched, because a specimen does not
 * care which one supplied the bytes -- but the ORDER is fixed, and build.mjs
 * fails outright on a path present in both, so the ambiguity never arises. */
const srcRoot = path.resolve(docs, '..', 'src');
const AUTHORED = path.join(srcRoot, 'components');
const CAPTURES = path.join(srcRoot, 'captured');
const ROOTS = [AUTHORED, CAPTURES];

/** The root holding a capture-relative path, or null when no root has it. */
const rootHolding = (rel) => ROOTS.find((r) => fs.existsSync(path.join(r, rel))) ?? null;

/** Absolute path to a capture-relative file, in whichever root holds it.
 *  Falls back to authored/ so a file no root has fails by NAME, rather than
 *  resolving somewhere plausible and wrong. */
const inRoots = (rel) => path.join(rootHolding(rel) ?? AUTHORED, rel);

/** The root an ABSOLUTE path sits under, or null. */
const rootUnder = (file) => ROOTS.find((r) => !path.relative(r, file).startsWith('..')) ?? null;

/* The package's shipped component tree — CCWEB2-318 phase 4.
 *
 * The storybook compiles a component FROM THE PACKAGE whenever the package
 * carries it, and from the captures otherwise. That is not a detail of where
 * files are read: it is what makes the docs the package's first consumer for
 * components, exactly as they have been for tokens since phase 2. If a
 * specimen renders, the package's layout works — including the two-level
 * climbs (`../../assets/images/logo.svg`) that only resolve because dist/src/
 * restores the directory depth the captures flattened away.
 *
 * Nothing about a specimen's MEANING changes. `npm run check` asserts the
 * package's copies are byte-identical to the sources under docs/authored/, so
 * the two roots are the same bytes either way.
 *
 * What a specimen is a record OF has changed, though, and the comment here used
 * to say otherwise: it claimed a chain to codecave.pro, with check-captures.mjs
 * as the far link. That link was cut on 2026-08-25 — the site installs this
 * package now and pins it, so it lags by design and a check demanding equality
 * was wrong. A specimen is a record of what THIS repository ships, which is
 * what the site will get at its next bump rather than what it renders today.
 *
 * Entries the package does NOT carry stay on the captures, and the build says
 * which those are on every run rather than hiding the split. Today there are
 * none: every component under docs/authored/ ships. That is worth printing
 * anyway, because a specimen quietly falling back to the captures is exactly
 * the drift this arrangement exists to prevent, and the build log is the only
 * place it would ever show.
 */
const PKG = path.join(docs, '..', 'packages', 'brand', 'dist', 'src');
if (!fs.existsSync(PKG)) {
  console.error(`The package is not built — no ${path.relative(path.join(docs, '..'), PKG)}`);
  console.error('Run: npm run build -w @codecavepro/brand');
  process.exit(1);
}

/** Where an entry's source lives, and which root it is relative to.
 *
 * The package's copy must equal the capture it was copied from, or this build
 * is documenting a package that no longer exists. dist/ is generated and
 * gitignored, so it goes stale the moment a capture is refreshed without
 * `npm run build -w @codecavepro/brand` after it — and nothing else here would
 * notice: the bytes still compile, the specimen still renders, and it renders
 * the OLD component. Caught doing exactly that on 2026-08-21, refreshing five
 * captures and rebuilding the storybook before the package.
 *
 * "Equal" means equal once the @helpers alias is resolved (CCWEB2-355). The
 * package rewrites that alias to a relative path on the way into dist/, because
 * a consumer has no tsconfig of the site's — so for the nine captures that use
 * it, identical bytes would mean the package was NOT built from this capture.
 * Both sides read the rule from import-aliases.mjs rather than restating it. */
function rootOf(entry) {
  const shipped = path.join(PKG, entry);
  if (!fs.existsSync(shipped)) {
    const root = rootHolding(entry) ?? AUTHORED;
    return { file: path.join(root, entry), root, label: 'sources' };
  }
  const capture = inRoots(entry);
  const captured = fs.readFileSync(capture, 'utf8');
  const expected = usesAlias(captured)
    ? unalias(captured, `src/${entry}`)
    : captured;
  if (fs.readFileSync(shipped, 'utf8') !== expected) {
    console.error(`the package's ${entry} is not the capture it was copied from.`);
    console.error('dist/ is stale. Run: npm run build -w @codecavepro/brand');
    process.exit(1);
  }
  return { file: shipped, root: PKG, label: 'package' };
}

const OUT = path.join(docs, 'storybook', 'compiled');
fs.mkdirSync(OUT, { recursive: true });

/* ---- the components the storybook documents ----------------------------- */
const ENTRIES = [
  'common/Button.vue',
  'common/Checkbox.vue',
  'common/Radio.vue',
  'common/InputText.vue',
  'common/TextField.vue',
  'common/GlowButton.vue',
  // The site moved this into common/effects/ on 2026-08-20; the capture path
  // follows the site's, because a capture whose path has drifted is no longer
  // evidence of where the code lives.
  'common/effects/TypingEffect.vue',
  'common/Review.vue',
  'common/ArticlePreview.vue',
  'homepage/technology-card.vue',
  'footer/link-group.vue',
  'project/pain-points-item.vue',
];

/* ---- .vue -> JS(TS) transform, one compile path for every SFC ------------ */
function compileSFC(file) {
  const source = fs.readFileSync(file, 'utf8');
  /* A component's identity is its CAPTURE path, whichever root the bytes were
   * read from. It seeds the scoped-style id and Vue devtools' __file, and both
   * must name the component rather than the directory it happened to be
   * resolved through -- otherwise moving a component into the package (or out
   * of it) rewrites every data-v- attribute in its bundle for no reason anyone
   * could act on. dist/src/ MIRRORS docs/authored/, so the path relative to
   * either base is already the identity -- and because it is relative to
   * whichever ROOT held the file, moving a component between authored/ and
   * source_examples/ does not touch a scoped id either. */
  const underPkg = !path.relative(PKG, file).startsWith('..');
  const base = underPkg ? PKG : (rootUnder(file) ?? AUTHORED);
  const rel = path.relative(base, file).replace(/\\/g, '/');
  const filename = rel;
  const id = crypto.createHash('sha1').update(filename).digest('hex').slice(0, 8);
  const { descriptor, errors } = compiler.parse(source, { filename });
  if (errors.length) throw new Error(`${filename}: ${errors[0].message}`);

  const scoped = descriptor.styles.some((s) => s.scoped);
  let code;
  if (descriptor.script || descriptor.scriptSetup) {
    code = compiler.compileScript(descriptor, {
      id,
      inlineTemplate: true,
      genDefaultAs: '__sfc__',
      templateOptions: { scoped },
    }).content;
  } else {
    // Template-only SFC (the icons have an empty <script setup>, which the
    // parser drops) — compile the template alone and wrap it.
    const tpl = compiler.compileTemplate({
      id, filename, scoped,
      source: descriptor.template.content,
      compilerOptions: scoped ? { scopeId: `data-v-${id}` } : undefined,
    });
    if (tpl.errors.length) throw new Error(`${filename} <template>: ${tpl.errors[0]}`);
    code = tpl.code.replace(/\bexport (function render)/, '$1')
      + `\nconst __sfc__ = { render };`;
  }

  let css = '';
  for (const style of descriptor.styles) {
    const res = compiler.compileStyle({
      id, filename,
      source: style.content,
      scoped: style.scoped,
    });
    if (res.errors.length) throw new Error(`${filename} <style>: ${res.errors[0].message}`);
    css += res.code;
  }

  if (scoped) code += `\n__sfc__.__scopeId = ${JSON.stringify(`data-v-${id}`)};`;
  /* Devtools' __file must name a path a reader can open, so it is the ROOT
   * that holds this component -- not the directory the bytes were read from.
   * A specimen compiled out of the package would otherwise point at dist/,
   * which is generated and gitignored. */
  const home = path.basename(rootHolding(filename) ?? AUTHORED);
  code += `
__sfc__.__file = ${JSON.stringify(`${home}/${filename}`)};`;
  if (css) {
    code += `
const __css__ = ${JSON.stringify(css)};
if (typeof document !== 'undefined' && !document.getElementById(${JSON.stringify(`sfc-style-${id}`)})) {
  const el = document.createElement('style');
  el.id = ${JSON.stringify(`sfc-style-${id}`)};
  el.textContent = __css__;
  document.head.appendChild(el);
}`;
  }
  code += `\nexport default __sfc__;`;
  return code;
}

/* ---- ports: the storybook's outside world -------------------------------
 * The table itself is tools/storybook-ports.mjs, because the docs site's Vite
 * build reads the same wiring -- the specimen pages import the component
 * sources directly, so they hit these specifiers through a different bundler
 * and must substitute them the same way. See that module for the rule about
 * what does and does not qualify as a port.
 *
 * Note the specifiers are matched after leading ./ and ../ are stripped, so one
 * entry covers a module however deep the importer sits. */

/* Which specimens each port actually stood in for, filled in as esbuild
 * resolves and printed at the end. `npm run check:ports` typechecks every
 * adapter whether or not a specimen imports it, so on its own a green check
 * reads as coverage of something that may run for nothing — which is how
 * StrapiPort came to sit here for a week after CCWEB2-332 removed its last
 * importer. A port exists because a captured component needs it; when that
 * stops being true the build is the only place it shows. */
const exercised = new Map(PORTS.map((p) => [p.port, new Set()]));
let currentEntry = null;

/* SanitizerPort is only honest while its DOMPurify is the DOMPurify the site
 * ships. That was a comment asking whoever bumped one to bump the other, and it
 * had already failed by the time it was written — the adapter was pinned a patch
 * ahead of production within a day. So the build asserts it instead.
 *
 * Deliberately here rather than in `npm run check`: this needs the site
 * checkout, which the checks do not require and CI does not have. The build
 * already demands it. */
function siteDomPurifyVersion() {
  const top = path.join(siteDir, 'node_modules');
  const iso = path.join(top, 'isomorphic-dompurify');
  if (!fs.existsSync(iso)) return null;   // site tree not installed; see below

  const candidates = [
    // pnpm's isolated layout: the real isomorphic-dompurify sits in a private
    // directory with its own dependencies beside it.
    path.join(path.dirname(fs.realpathSync(iso)), 'dompurify', 'package.json'),
    // npm/yarn hoist it to the top level instead.
    path.join(top, 'dompurify', 'package.json'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return JSON.parse(fs.readFileSync(c, 'utf8')).version;
  }
  return null;
}

const ours = JSON.parse(fs.readFileSync(
  path.join(repoRoot, 'node_modules', 'dompurify', 'package.json'), 'utf8')).version;
const theirs = siteDomPurifyVersion();
if (theirs === null) {
  /* Not a warning any more. The site checkout is optional, so its absence is
     the ordinary case rather than a degraded one -- and a warning printed on
     every build is a warning nobody reads. The pin is asserted when a checkout
     is passed; otherwise dompurify's exact version in package.json is the
     claim, alongside tailwindcss and vue, which are pinned the same way and for
     the same reason. */
} else if (theirs !== ours) {
  console.error(`SanitizerPort would sanitize with dompurify ${ours}, but the site ships ${theirs}.`);
  console.error(`Fix: npm i -D --save-exact dompurify@${theirs}`);
  process.exit(1);
}

const vuePlugin = {
  name: 'vue-sfc',
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      const bare = args.path.replace(/^(?:\.\.?\/)+/, '');
      const hit = portFor(bare);
      if (hit) exercised.get(hit.port).add(currentEntry);
      return hit ? { path: hit.file } : null;
    });
    build.onLoad({ filter: /\.vue$/ }, (args) => ({
      contents: compileSFC(args.path),
      loader: 'ts',
      resolveDir: path.dirname(args.path),
    }));
  },
};

/**
 * Resolve the site's @helpers alias when compiling a CAPTURE.
 *
 * A specimen built from the package never needs this — build.mjs rewrote the
 * alias to a relative path on the way into dist/. A specimen built from the
 * capture gets the site's spelling verbatim, and esbuild has never heard of the
 * alias, so it fails outright: "Could not resolve @helpers/paths.ts".
 *
 * That was invisible while every aliased component happened to be in the
 * package. Excluding the seven site-coupled ones (CCWEB2-371) put ArticlePreview
 * back on the capture path and the build stopped, which is the good version of
 * this: a loud failure rather than a specimen quietly missing.
 *
 * The alias table comes from import-aliases.mjs rather than being spelled again
 * here. The target differs from the package's, and that is the point — the
 * package rewrites to its own shipped layout, while here a capture's imports
 * are simply resolved where the site keeps them.
 *
 * It resolves EVERY site alias, not just @helpers. It knew only @helpers while
 * @helpers was the only one codecave.pro declared; the moment the site aliased
 * one directory per top-level folder, a capture importing @assets/icons/
 * shevron.vue stopped compiling with "could not resolve" — which names the
 * specifier and not one word about why.
 */
const siteAliases = {
  name: 'site-aliases',
  setup(build) {
    build.onResolve({ filter: new RegExp(`^(?:${SITE_ALIAS_PATTERN})`) }, (args) => ({
      path: inRoots(sitePath(args.path)),
    }));
  },
};

/* ---- bundle each entry: vue + gsap stay external, the rest inlines ------ */
const fromCaptures = [];
for (const entry of ENTRIES) {
  const name = path.basename(entry, '.vue');
  const { file, root, label } = rootOf(entry);
  if (label !== 'package') fromCaptures.push(entry);
  currentEntry = entry;
  const from = label === 'package'
    ? `@codecavepro/brand/components/${entry}`
    : `${path.basename(root)}/${entry}`;
  await esbuild.build({
    entryPoints: [file],
    bundle: true,
    format: 'esm',
    outfile: path.join(OUT, `${name}.js`),
    // Pin esbuild's frame of reference to docs/ so the `// authored/…`
    // annotations it writes into each bundle do not depend on where the script
    // was invoked from. Without this, running from the repo root and running
    // from docs/ emit different comments and every module shows up as changed —
    // noise that would make a CI drift check useless. entryPoints/outfile are
    // absolute, so this only affects the annotations.
    absWorkingDir: docs,
    external: ['vue', 'gsap', 'gsap/*'],
    // Bare imports (e.g. pain-points-item's `marked`) resolve from this repo,
    // which declares every one of them as a devDependency pinned to the version
    // the site resolves. They used to come from the site's node_modules.
    nodePaths: [path.join(repoRoot, 'node_modules')],
    plugins: [siteAliases, vuePlugin],
    banner: {
      js: `/* GENERATED from ${from} by tools/build-storybook.mjs — do not edit. */`,
    },
    logLevel: 'silent',
  });
  console.log(`compiled ${entry} (${label}) -> storybook/compiled/${name}.js`);
}

/* Say the split out loud on every build. A specimen quietly falling back to
 * the captures is exactly the drift phase 4 exists to prevent, and the only
 * moment anyone would notice is here. */
const fromPackage = ENTRIES.length - fromCaptures.length;
if (fromCaptures.length) {
  console.log(`\n${fromPackage} of ${ENTRIES.length} specimens came from the package; ${fromCaptures.length} from the captures:`);
  for (const entry of fromCaptures) console.log(`  ${entry}`);
  console.log('Those are not shipped — packages/brand/scripts/build.mjs names the reason for each.');
} else {
  console.log(`\nall ${ENTRIES.length} specimens came from the package.`);
}

/* And say the same about the ports, for the same reason. */
const idle = PORTS.filter((p) => !exercised.get(p.port).size);
console.log('');
for (const { port } of PORTS) {
  const users = [...exercised.get(port)].sort();
  console.log(users.length
    ? `${port} stood in for ${users.length} specimen(s): ${users.join(', ')}`
    : `! ${port} was exercised by nothing — no compiled specimen imports it.`);
}
if (idle.length) {
  console.log('A port exists because a captured component needs it. Delete the idle');
  console.log('one(s), and their interfaces in ports.d.ts, or capture what needs them:');
  for (const { port, adapter } of idle) console.log(`  ${port}  (storybook/ports/${adapter})`);
}

/* ---- tw-bridge.css: the site's Tailwind, only the utilities in use ------- */
const twNode = req('@tailwindcss/node');
const oxide = req('@tailwindcss/oxide');

/* Both blocks used to come out of the site's global.css, because that is where
 * they were written. They are not there any more: CCWEB2-318 moved the palette
 * and the @theme entries into this repo, and the site now imports them back as
 * @codecavepro/brand/tokens.css and theme.css. Its :root is down to a single
 * declaration and it has no @theme at all, so reading them from the capture
 * found nothing the moment that capture told the truth.
 *
 * The bridge still has to reproduce the SITE's cascade, which is now three
 * sources rather than one: the 102 tokens this repo owns, the @theme block this
 * repo owns, and whatever the site still declares for itself. That last part is
 * not vestigial -- --duration-control lives there because the package has no
 * token for it, and Checkbox.vue and Radio.vue read it from their scoped
 * styles. Drop it and two specimens silently lose their transition. */
const themeSrc = fs.readFileSync(path.join(srcRoot, 'styles', 'theme.css'), 'utf8');
const themeBlock = themeSrc.match(/@theme \{[\s\S]*?\n\}/);
if (!themeBlock) throw new Error('no @theme block found in src/styles/theme.css');

const tokensSrc = fs.readFileSync(path.join(srcRoot, 'styles', 'colors_and_type.css'), 'utf8');
const tokensRoot = tokensSrc.match(/^:root \{([\s\S]*?)^\}/m);
if (!tokensRoot) throw new Error('no :root block found in src/styles/colors_and_type.css');

const globalCss = fs.readFileSync(path.join(CAPTURES, 'styles', 'global.css'), 'utf8');
const siteRoot = globalCss.match(/^:root \{([\s\S]*?)^\}/m);
if (!siteRoot) throw new Error('no :root block found in src/captured/styles/global.css');
const rootBlock = [null, `${tokensRoot[1]}${siteRoot[1]}`];

/* Utilities keep their var(--…) references — do NOT inline theme values.
 * The site defines its gray/brand ramps in plain :root, invisible to
 * Tailwind's theme resolution; inlining would bake Tailwind's DEFAULT
 * palette (oklch grays) into the utilities instead of the site's. Every
 * runtime var() resolves through the canvas scope emitted below, exactly
 * as the site's own unlayered :root out-cascades its theme layer. */
const input = `@layer base, theme, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
@layer base {
  /* Preflight-equivalent, canvas-scoped. The site imports full Tailwind
   * preflight; the bridge imports only theme+utilities, so without this the
   * UA stylesheet leaks into mounted components — ButtonFace fills on
   * buttons, white textareas, 2px inset input borders, 1em <p> margins —
   * none of which exist in production. This reproduces the preflight rules
   * the mounted components actually rely on, scoped to the canvases.
   * Utilities still win — base is a lower layer. */
  :is(.sb-canvas, .sb-mount) *,
  :is(.sb-canvas, .sb-mount) ::before,
  :is(.sb-canvas, .sb-mount) ::after {
    box-sizing: border-box; margin: 0; padding: 0; border: 0 solid;
  }
  .sb-canvas a, .sb-mount a { color: inherit; text-decoration: inherit; }
  :is(.sb-canvas, .sb-mount) :is(h1, h2, h3, h4, h5, h6) {
    font-size: inherit; font-weight: inherit;
  }
  :is(.sb-canvas, .sb-mount) :is(ol, ul, menu) { list-style: none; }
  :is(.sb-canvas, .sb-mount) :is(img, svg, video, canvas, audio, iframe, embed, object) {
    display: block; vertical-align: middle;
  }
  :is(.sb-canvas, .sb-mount) :is(img, video) { max-width: 100%; height: auto; }
  :is(.sb-canvas, .sb-mount) :is(button, input, select, optgroup, textarea) {
    font: inherit; font-feature-settings: inherit; font-variation-settings: inherit;
    letter-spacing: inherit; color: inherit; border-radius: 0;
    background-color: transparent; opacity: 1;
  }
  :is(.sb-canvas, .sb-mount) :is(button, input:where([type='button'], [type='reset'], [type='submit'])) {
    appearance: button;
  }
  :is(.sb-canvas, .sb-mount) ::placeholder {
    opacity: 1; color: color-mix(in oklab, currentColor 50%, transparent);
  }
  :is(.sb-canvas, .sb-mount) textarea { resize: vertical; }
  :is(.sb-canvas, .sb-mount) :is(b, strong) { font-weight: bolder; }
  :is(.sb-canvas, .sb-mount) small { font-size: 80%; }
  :is(.sb-canvas, .sb-mount) table {
    text-indent: 0; border-color: inherit; border-collapse: collapse;
  }
}
${themeBlock[0]}`;

const twCompiler = await twNode.compile(input, {
  /* Where `@import "tailwindcss/..."` is resolved from. This repo declares
     tailwindcss at the same version, so the emitted theme and utilities are
     identical to what the site's copy produced. */
  base: repoRoot,
  onDependency: () => {},
});
const scanner = new oxide.Scanner({
  sources: ROOTS.map((base) => ({ base, pattern: '**/*.vue', negated: false })),
});
const candidates = scanner.scan();
const built = twCompiler.build(candidates);

/* ---- canvas scope: the SITE's tokens, only where components render ------- */
/* The site's palette has moved past the docs design system (gray ramp,
 * re-numbered brand ramp, ground #0A0A0B), and several names collide with
 * colors_and_type.css at different values. Custom properties inherit from
 * the nearest ancestor that sets them, so scoping the site's :root + @theme
 * declarations (and Tailwind's emitted theme vars, e.g. --radius-sm, which
 * this package no longer publishes — see the header) to the
 * demo canvases lets mounted components resolve every var() to the value
 * the live site computes — while the docs chrome around them keeps the
 * design-system palette. */
const decls = (block) => block
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l.startsWith('--'))
  /* @theme re-exports some :root tokens self-referentially (--x: var(--x)).
   * On the site those live in a lower cascade layer and lose to the raw
   * value; merged into ONE rule they would win and cycle the property to
   * invalid. They are no-ops by design — drop them. */
  .filter((l) => {
    const m = l.match(/^(--[\w-]+)\s*:\s*var\((--[\w-]+)\)\s*;?$/);
    return !(m && m[1] === m[2]);
  })
  .map((l) => '  ' + l)
  .join('\n');
const emittedTheme = built.match(/@layer theme \{\s*:root, :host \{([\s\S]*?)\}/);
/* One rule = last declaration wins, so dedupe by name with the SITE's
 * declarations taking precedence: Tailwind's emission carries its DEFAULT
 * palette for names the site defines in plain :root (the gray ramp), and
 * appending those unfiltered would override the site's values. */
const seen = new Set();
const dedupe = (block) => decls(block)
  .split('\n')
  .filter((l) => {
    const name = l.match(/^\s*(--[\w-]+)/)?.[1];
    if (!name || seen.has(name)) return false;
    seen.add(name);
    return true;
  })
  .join('\n');
const canvasScope = `
/* Site tokens, canvas-scoped — see header comment. */
.sb-canvas, .sb-mount {
${dedupe(rootBlock[1])}
${dedupe(themeBlock[0])}
${emittedTheme ? dedupe(emittedTheme[1]) : ''}
}`;

const bridge = `/* GENERATED by tools/build-storybook.mjs — do not edit.
 * The site's Tailwind v4 theme (source_examples/styles/global.css @theme)
 * compiled against the utility classes the component SFC templates
 * actually use, plus the site's tokens scoped to the demo canvases so the
 * real components render exactly as the live site does. This file serves
 * mounted components only — it does not restyle the docs.
 *
 * The digest below covers every file under authored/ and source_examples/,
 * this file's only sources. Verify with: node docs/tools/check-tw-bridge.mjs
${DIGEST_PREFIX}${sourceDigest(ROOTS)}
 */
` + built + canvasScope + '\n';
fs.writeFileSync(path.join(docs, 'storybook', 'tw-bridge.css'), bridge);
console.log(`tw-bridge.css written (${candidates.length} candidates scanned)`);
