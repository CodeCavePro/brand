/* ==========================================================================
 * The Design-project upload map: every file the CODECAVE Design System project
 * holds, and the authored file on disk that answers it.
 *
 * This replaced ds-bundle/'s derived half on 2026-08-27, and the reason it
 * could is one line of the DesignSync contract: `write_files` takes `path` (in
 * the project) and `localPath` (on disk) as INDEPENDENT arguments. The upload
 * is therefore a list of source→destination pairs, not a directory to mirror.
 * ds-bundle/ had been the mirror -- 46 gitignored copies of files that already
 * existed under src/ and docs/, materialized by tools/build-ds-bundle.sh before
 * every push, and verified byte-for-byte by 40 lines of that same script.
 *
 * All of that was work to keep a copy honest. A map has no copy to keep honest.
 *
 * The drift it was guarding against was real -- on 2026-08-20 the mirrored
 * colors_and_type.css sat two shape fixes behind its source for weeks, and
 * nothing failed, because a stale copy uploads exactly as cleanly as a fresh
 * one. That failure mode is now unreachable rather than checked for.
 *
 * WHAT IS STILL AUTHORED. ds-bundle/ keeps seven tracked files with no upstream
 * anywhere: README.md, styles.css, guidelines/brand.md and the four Foundations
 * cards. Those are source. The directory is no longer a bundle; it is where the
 * Design project's own hand-written pages live.
 *
 * WHAT IS STILL GENERATED. The seven Components cards, by
 * tools/build-ds-components.mjs, into gitignored ds-bundle/components/Components/.
 * They are generated rather than authored, they have no other home, and they are
 * uploaded from where they are written.
 *
 * THE PROJECT LAYOUT DOES NOT CHANGE. Every card resolves `../../../styles.css`
 * and its import map inside the PROJECT, after upload. So the remote tree keeps
 * exactly the shape it has always had; only the local staging disappeared.
 * check-design-sync.mjs is what proves that, by resolving every reference a card
 * makes against the project paths this map declares.
 * ====================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { STORIES, assetsFor } from './build-ds-components.mjs';

export const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const local = (p) => path.join(repo, ...p.split('/'));
const listing = (dir, re) =>
  fs.existsSync(local(dir))
    ? fs
        .readdirSync(local(dir))
        .filter((f) => re.test(f))
        .sort()
    : [];

/* Paths the project holds that this map no longer writes, deleted on the next
 * push rather than left to rot. A path leaves this list once a push has actually
 * removed it, which is why the list is empty: the 2026-08-27 sync deleted the
 * one entry it ever had. That entry was components/assets/images/checked-icon.svg
 * -- the cards ask for the tick at components/Components/assets/…, three levels
 * deep, so the copy sitting one level up was never reachable and the checkbox
 * would not tick in the Design pane. Empty is the steady state; add a path here
 * only when the map stops writing something the project still holds. */
export const STALE = [];

export function projectFiles() {
  const files = [];
  const add = (p, localPath) => files.push({ path: p, localPath });

  /* ---- authored, and living in ds-bundle/ because nothing else owns them --- */
  add('README.md', 'ds-bundle/README.md');
  add('styles.css', 'ds-bundle/styles.css');
  add('guidelines/brand.md', 'ds-bundle/guidelines/brand.md');
  for (const n of ['Colors', 'Patterns', 'Spacing', 'Typography']) {
    add(`components/Foundations/${n}/${n}.html`, `ds-bundle/components/Foundations/${n}/${n}.html`);
  }

  /* ---- the deliverable stylesheet and the token modules, from src/ ---------
   * These are the same bytes the npm package ships and the website links. They
   * were mirrored into ds-bundle/ and are now read where they are authored. */
  add('colors_and_type.css', 'src/styles/colors_and_type.css');
  for (const t of ['colors', 'layout', 'typography']) {
    add(`tokens/${t}.ts`, `src/tokens/${t}.ts`);
  }

  /* ---- the fonts, from src/ ------------------------------------------------
   * 20 binaries and the stylesheet -- 696K that used to be copied per push. */
  add('fonts/fonts.css', 'src/styles/fonts/fonts.css');
  for (const f of listing('src/styles/fonts', /\.woff2?$/)) {
    add(`fonts/${f}`, `src/styles/fonts/${f}`);
  }

  /* ---- what the Components cards MOUNT, from the storybook output ----------
   * tw-bridge.css carries the Tailwind utilities the templates use; without it
   * every card renders unstyled with no error at all. The vendored runtimes are
   * what the cards' import maps resolve, because esbuild leaves vue and gsap
   * external. All of it is `npm run build:storybook` output, read in place. */
  add('tw-bridge.css', 'docs/storybook/tw-bridge.css');
  add('vendor/vue.esm-browser.prod.js', 'docs/vendor/vue.esm-browser.prod.js');
  for (const f of listing('docs/vendor/gsap', /\.js$/)) {
    add(`vendor/gsap/${f}`, `docs/vendor/gsap/${f}`);
  }

  /* ---- the generated cards, and the bundles they mount -------------------- */
  for (const c of STORIES) {
    add(`compiled/${c.name}.js`, `docs/storybook/compiled/${c.name}.js`);
    add(
      `components/Components/${c.name}/${c.name}.html`,
      `ds-bundle/components/Components/${c.name}/${c.name}.html`,
    );
    /* Every url() the bundle reaches for, at the path the CARD asks for it. */
    for (const a of assetsFor(c.name)) add(a.path, a.localPath);
  }

  /* An asset two cards share would otherwise be added twice, and write_files
     counts entries against its 256-per-call cap. Last writer wins, and the
     duplicate check in check-design-sync.mjs proves they agreed. */
  const seen = new Map();
  for (const f of files) seen.set(f.path, f);
  return [...seen.values()];
}
