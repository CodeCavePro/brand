/* Hold the six deliverables to the design system they are meant to demonstrate.
 *
 *   node docs/tools/check-examples.mjs
 *
 * The files under docs/examples/raw/ are the only things on this site that are
 * NOT pages: they are standalone documents a client is handed, and Astro never
 * renders them. That is exactly why they need checking -- nothing else looks at
 * them. A page with a broken asset fails a build or shows up in a console; a
 * payload file with a broken asset ships.
 *
 * Three assertions, each of which exists because the thing it checks had
 * already gone wrong or was holding only by luck.
 *
 * 1. REFERENCES RESOLVE. Moving artifacts/ to examples/raw/ to make room for
 *    the wrapper pages put these files one directory deeper, and four of the
 *    six lost `../assets/codecave-wide.svg` while email and newsletter lost
 *    all four Satoshi @font-face rules and fell back to Times New Roman. Every
 *    check in the repo stayed green, and the wrapper pages that embed them
 *    stayed green too, because an <iframe> reports nothing about what happens
 *    inside it.
 *
 * 2. SIZE AND RADIUS LITERALS ARE RAMP VALUES. The email and the newsletter
 *    write every value out in full, because a mail client will not resolve a
 *    custom property. That constraint is real and it is about var(), not about
 *    the values: font-size and border-radius are ordinary properties every
 *    client handles, so their literals still have to BE ramp values. They all
 *    were -- 43 of 45 exactly, the other two a documented trick -- but nothing
 *    said so, which means they agreed with the ramp by luck rather than by
 *    construction, and a palette change would have parted them silently.
 *
 * 3. THE DECK KEEPS ITS DERIVED RAMP. The deck is container-scaled (cqi) and
 *    that is correct -- a slide must read the same projected at 1920 and on a
 *    laptop, which a rem ramp cannot do. What was wrong is that it had no
 *    scale: twenty ad-hoc font sizes and seven ad-hoc radii, some 0.05cqi
 *    apart. It now derives both from --d-base / --dr-control at the system's
 *    own ratios, and a raw cqi literal is how that would come undone.
 *
 * The ramp is read from src/styles/colors_and_type.css, the origin -- so a palette
 * change moves this check with it rather than leaving it asserting last
 * month's numbers.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLISHED } from './astro-passthrough.mjs';

const docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const raw = path.join(docs, 'examples', 'raw');

/* A deliverable links `../../colors_and_type.css`, which is a SITE path: the
 * file is authored under src/ and published at the root of dist/. Resolving it
 * against the source tree alone reported all twelve as broken the day they
 * moved, which is the wrong answer -- the deliverables are correct and the
 * resolver was not. The map is read from the passthrough, never restated;
 * that file is the one place that decides what src/ publishes and where. */
const srcRoot = path.resolve(docs, '..', 'src');
function sourceOf(siteRel) {
  for (const [from, to] of PUBLISHED) {
    if (siteRel === to) return path.join(srcRoot, from);
    if (siteRel.startsWith(`${to}/`)) return path.join(srcRoot, from, siteRel.slice(to.length + 1));
  }
  return path.join(docs, siteRel);
}
const rel = (p) => path.relative(process.cwd(), p);
const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

if (!fs.existsSync(raw)) fail(`no ${rel(raw)} — the deliverables moved without this check.`);

const files = fs.readdirSync(raw).filter((f) => f.endsWith('.html')).sort();
if (!files.length) fail(`no artifacts in ${rel(raw)} — nothing to check.`);

const source = new Map(files.map((f) => [f, fs.readFileSync(path.join(raw, f), 'utf8')]));

/* ---- the ramp, from the origin ------------------------------------------ */
const palette = fs
  .readFileSync(path.join(docs, '..', 'src', 'styles', 'colors_and_type.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, ''); // a commented-out declaration is not one

const px = (v) => {
  const m = /^([\d.]+)(rem|px)$/.exec(v.trim());
  if (!m) return null;
  return m[2] === 'rem' ? Number(m[1]) * 16 : Number(m[1]);
};

const scale = (prefix, skip = () => false) => {
  const out = new Map();
  for (const m of palette.matchAll(new RegExp(`(--${prefix}[a-z0-9-]*)\\s*:\\s*([^;]+);`, 'g'))) {
    const [, name, value] = m;
    const size = px(value);
    if (size === null || skip(name)) continue;
    out.set(size, name);
  }
  return out;
};

/* `--text-heading-lg--line-height` is a percentage and is not a size. */
const TEXT = scale('text-', (n) => n.includes('--line-height'));
const RADIUS = scale('radius-');
if (TEXT.size < 8 || RADIUS.size < 8) {
  fail(
    `read only ${TEXT.size} type step(s) and ${RADIUS.size} radius step(s) out of ` +
      `colors_and_type.css — the declarations moved, and this check would pass ` +
      `everything if it kept going.`,
  );
}

/* ---- exceptions ---------------------------------------------------------
 * Each carries its reason as a string, the way NOT_SHIPPED does in the package
 * build, AND has to be exercised: an exception nothing matches is a claim that
 * has stopped being true, so it fails rather than lingering. */
const EXCEPTIONS = [
  {
    file: 'email.html',
    prop: 'font-size',
    value: '1px',
    count: 1,
    why:
      'the preheader — the grey line a mail client prints beside the subject. ' +
      'It has to be in the markup and must not be in the message, so it is ' +
      'shrunk to nothing rather than display:none, which several clients ignore.',
  },
  {
    file: 'newsletter.html',
    prop: 'font-size',
    value: '1px',
    count: 1,
    why: 'the preheader, same trick and same reason as email.html.',
  },
  {
    file: 'landing.html',
    prop: 'font-size',
    value: '11px',
    count: 1,
    why:
      'the address bar of the drawn browser chrome — a picture of somebody ' +
      'else’s UI, alongside 10px traffic-light dots and a 22px bar, not type ' +
      'set in this brand’s voice. Snapping it to --text-caption would make the ' +
      'illustration wrong rather than the page more compliant. The deck’s ' +
      '.s-screen wireframe is the same category.',
  },
];
const used = new Map(EXCEPTIONS.map((e) => [e, 0]));

/* ---- 1. every relative reference resolves -------------------------------- */
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
const REF = /(?:src|href)="([^"]+)"|url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)/g;

const broken = [];
let refs = 0;

for (const [file, src] of source) {
  for (const m of src.matchAll(REF)) {
    const target = m[1] ?? m[2] ?? m[3] ?? m[4];
    if (!target || EXTERNAL.test(target)) continue;
    refs += 1;
    const clean = target.split('#')[0].split('?')[0];
    if (!clean) continue;
    const abs = path.resolve(raw, clean);
    const siteRel = path.relative(docs, abs).split(path.sep).join('/');
    if (!fs.existsSync(abs) && !fs.existsSync(sourceOf(siteRel))) {
      broken.push(`  ${file} → ${target}`);
    }
  }
}

if (broken.length) {
  fail(
    `${broken.length} unresolved reference(s) in the deliverables:\n${broken.join('\n')}\n\n` +
      'These files are handed to clients as they are. A reference that does not\n' +
      'resolve here is a broken wordmark or an unstyled document in somebody’s\n' +
      'inbox, and the wrapper pages cannot see it: an <iframe> reports nothing\n' +
      'about what happens inside it.',
  );
}

/* ---- 2 & 3. literals ----------------------------------------------------- */
const DECL = /(font-size|border-radius)\s*:\s*([^;}"\n]+)/g;
const CQI = /(?<![\w.])[\d.]+cqi\b/;
const offRamp = [];
const rawCqi = [];
let onRamp = 0;
let derivedCqi = 0;

for (const [file, src] of source) {
  for (const m of src.matchAll(DECL)) {
    const prop = m[1];
    const value = m[2].trim().split(/\s+/)[0].replace(/[,)]$/, '');
    if (value.startsWith('var(')) continue;

    /* A raw cqi literal is the deck's own failure mode: the unit is right, the
       absence of a scale behind it is not.

       Scan the WHOLE value rather than its first token. `calc(var(--x) - 4cqi)`
       parses as a non-length and would be skipped in silence -- and so would a
       hand-picked number hidden in the same shape. A cqi inside a calc() that
       also names a token is a derivation FROM the system, which is what that
       spelling is for; a bare cqi anywhere in the value is a number somebody
       chose. */
    const whole = m[2].trim();
    if (CQI.test(whole)) {
      if (whole.includes('calc(') && whole.includes('var(--')) derivedCqi += 1;
      else rawCqi.push(`  ${file}  ${prop}: ${whole}`);
      continue;
    }

    const size = px(value);
    if (size === null) continue; // %, em, keywords — not on either scale

    const table = prop === 'font-size' ? TEXT : RADIUS;
    if (table.has(size)) {
      onRamp += 1;
      continue;
    }

    const hit = EXCEPTIONS.find((e) => e.file === file && e.prop === prop && e.value === value);
    if (hit) {
      used.set(hit, used.get(hit) + 1);
      continue;
    }

    const near = [...table].sort((a, b) => Math.abs(a[0] - size) - Math.abs(b[0] - size))[0];
    offRamp.push(
      `  ${file}  ${prop}: ${value}  (${size}px — nearest is ${near[1]} at ${near[0]}px)`,
    );
  }
}

if (rawCqi.length) {
  fail(
    `${rawCqi.length} raw cqi literal(s) in the deliverables:\n${rawCqi.join('\n')}\n\n` +
      'cqi is the correct unit for a slide — a deck has to read the same\n' +
      'projected at 1920 and on a laptop, which the rem ramp cannot do. But the\n' +
      'deck derives a ramp from --d-base and --dr-control at the system’s own\n' +
      'ratios precisely so that a size is chosen from a scale rather than picked\n' +
      'per element. It carried twenty font sizes and seven radii before that,\n' +
      'some of them 0.05cqi apart. Reach for a step, or add one.',
  );
}

if (offRamp.length) {
  fail(
    `${offRamp.length} literal(s) in the deliverables are not ramp values:\n` +
      `${offRamp.join('\n')}\n\n` +
      'The email and the newsletter write values out in full because a mail\n' +
      'client will not resolve a custom property — but that constraint is about\n' +
      'var(), not about the values. font-size and border-radius are ordinary\n' +
      'properties every client handles, so a literal here still has to BE a ramp\n' +
      'value. Use the step, or add an entry to EXCEPTIONS with its reason.',
  );
}

const dead = [...used].filter(([, n]) => n === 0).map(([e]) => e);
if (dead.length) {
  fail(
    `${dead.length} exception(s) match nothing any more:\n` +
      dead.map((e) => `  ${e.file}  ${e.prop}: ${e.value} — ${e.why}`).join('\n') +
      '\n\nAn exception nothing exercises is a claim that has stopped being true.\n' +
      'Delete it rather than leaving it to excuse something later.',
  );
}

const excused = [...used.values()].reduce((a, b) => a + b, 0);
console.log(
  `${files.length} deliverable(s) intact — ${refs} relative reference(s) resolve; ` +
    `${onRamp} size/radius literal(s) are ramp values, ${derivedCqi} derived from a ` +
    `token, ${excused} excused ` +
    `(${files.map((f) => f.replace('.html', '')).join(', ')}).`,
);
