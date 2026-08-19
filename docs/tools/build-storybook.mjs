/* ===========================================================================
 * build-storybook.mjs — compile the REAL .vue components for the storybook.
 *
 * The storybook used to demo hand-copied HTML+CSS miniatures (.cc-* classes)
 * that drifted from the components they imitated. This script removes the
 * copy: it takes the verbatim SFCs in docs/source_examples/ and compiles
 * them to plain ES modules in docs/storybook/compiled/, using the SAME
 * toolchain versions the website builds with — everything here is resolved
 * from the codecave.pro repo's node_modules (vue/compiler-sfc, esbuild,
 * tailwindcss v4). Nothing is downloaded.
 *
 * It also generates docs/storybook/tw-bridge.css: the site's Tailwind theme
 * (source_examples/styles/global.css @theme) compiled against exactly the
 * utility classes the SFC templates use. The @theme aliases resolve to the
 * --color-brand-* ramp that colors_and_type.css defines, so the bridge adds
 * utilities without redefining the brand.
 *
 * Run:  node docs/tools/build-storybook.mjs [path-to-codecave.pro]
 *       (default sibling checkout: ../codecave.pro relative to the repo)
 *
 * Output modules keep 'vue' and 'gsap' as bare imports; the storybook pages
 * map them to docs/vendor/ via an import map. Everything else (helpers,
 * icon SFCs, the strapi stub) is bundled in.
 * ======================================================================== */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteDir = path.resolve(process.argv[2] ?? path.join(docs, '..', '..', 'codecave.pro'));
if (!fs.existsSync(path.join(siteDir, 'node_modules'))) {
  console.error(`codecave.pro checkout with node_modules not found at ${siteDir}`);
  console.error('Pass it as the first argument: node build-storybook.mjs <path>');
  process.exit(1);
}

const req = createRequire(path.join(siteDir, 'package.json'));
const compiler = req('vue/compiler-sfc');
const esbuild = req('esbuild');

const SRC = path.join(docs, 'source_examples');
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
  'common/TypingEffect.vue',
  'common/Review.vue',
  'common/ArticlePreview.vue',
  'homepage/technology-card.vue',
  'footer/link-group.vue',
  'project/pain-points-item.vue',
];

/* ---- .vue -> JS(TS) transform, one compile path for every SFC ------------ */
function compileSFC(file) {
  const source = fs.readFileSync(file, 'utf8');
  const filename = path.relative(SRC, file).replace(/\\/g, '/');
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
  code += `\n__sfc__.__file = ${JSON.stringify(`source_examples/${filename}`)};`;
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

/* The site nests SFCs under src/components/<group>/, so its relative imports
 * climb out of components/ ("../../assets/…"). source_examples/ flattens that
 * one level; when a climb overshoots, re-root it at source_examples/. */
function tryFile(p) {
  for (const c of [p, `${p}.ts`, `${p}.js`]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

const vuePlugin = {
  name: 'vue-sfc',
  setup(build) {
    build.onResolve({ filter: /^\.\.\// }, (args) => {
      if (tryFile(path.resolve(args.resolveDir, args.path))) return null; // esbuild handles it
      const rerooted = tryFile(path.join(SRC, args.path.replace(/^(\.\.\/)+/, '')));
      return rerooted ? { path: rerooted } : null;
    });
    build.onLoad({ filter: /\.vue$/ }, (args) => ({
      contents: compileSFC(args.path),
      loader: 'ts',
      resolveDir: path.dirname(args.path),
    }));
  },
};

/* ---- bundle each entry: vue + gsap stay external, the rest inlines ------ */
for (const entry of ENTRIES) {
  const name = path.basename(entry, '.vue');
  await esbuild.build({
    entryPoints: [path.join(SRC, entry)],
    bundle: true,
    format: 'esm',
    outfile: path.join(OUT, `${name}.js`),
    external: ['vue', 'gsap', 'gsap/*'],
    // Bare imports (e.g. pain-points-item's `marked`) resolve from the SITE's
    // node_modules — source_examples lives in the brand repo, which has none.
    nodePaths: [path.join(siteDir, 'node_modules')],
    plugins: [vuePlugin],
    banner: {
      js: `/* GENERATED from source_examples/${entry} by tools/build-storybook.mjs — do not edit. */`,
    },
    logLevel: 'silent',
  });
  console.log(`compiled ${entry} -> storybook/compiled/${name}.js`);
}

/* ---- tw-bridge.css: the site's Tailwind, only the utilities in use ------- */
const twNode = req('@tailwindcss/node');
const oxide = req('@tailwindcss/oxide');

const globalCss = fs.readFileSync(path.join(SRC, 'styles', 'global.css'), 'utf8');
const themeBlock = globalCss.match(/@theme \{[\s\S]*?\n\}/);
if (!themeBlock) throw new Error('no @theme block found in source_examples/styles/global.css');
const rootBlock = globalCss.match(/^:root \{([\s\S]*?)^\}/m);
if (!rootBlock) throw new Error('no :root block found in source_examples/styles/global.css');

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
  base: siteDir,
  onDependency: () => {},
});
const scanner = new oxide.Scanner({
  sources: [{ base: SRC, pattern: '**/*.vue', negated: false }],
});
const candidates = scanner.scan();
const built = twCompiler.build(candidates);

/* ---- canvas scope: the SITE's tokens, only where components render ------- */
/* The site's palette has moved past the docs design system (gray ramp,
 * re-numbered brand ramp, ground #0A0A0B), and several names collide with
 * colors_and_type.css at different values. Custom properties inherit from
 * the nearest ancestor that sets them, so scoping the site's :root + @theme
 * declarations (and Tailwind's emitted theme vars, e.g. --radius-sm) to the
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
 * compiled against the utility classes the source_examples SFC templates
 * actually use, plus the site's tokens scoped to the demo canvases so the
 * real components render exactly as the live site does. This file serves
 * mounted components only — it does not restyle the docs. */
` + built + canvasScope + '\n';
fs.writeFileSync(path.join(docs, 'storybook', 'tw-bridge.css'), bridge);
console.log(`tw-bridge.css written (${candidates.length} candidates scanned)`);
