/* Keep dist/ a superset of docs/, and prove it every build.
 *
 * An Astro integration, wired in astro.config.mjs. It runs once, after the
 * build, and does two things — one of them mechanical, one of them the actual
 * reason this file exists.
 *
 *   1. PRUNE. publicDir and srcDir are the same directory (see the config for
 *      why), so Astro copies pages/, layouts/ and components/ into dist/ as raw
 *      .astro source alongside the HTML it rendered from them. Delete those
 *      three. Nothing else in docs/ is Astro's: the component roots hold .vue,
 *      .ts and .css, none of which Astro claims.
 *
 *   2. ASSERT. This is a migration that runs for five phases with two kinds of
 *      page live at once: 29 hand-written .html files that reach dist/ only by
 *      being copied, and a growing number of .astro pages that reach it only by
 *      being rendered. Both are silent when they fail. A publicDir that stops
 *      copying produces a build that succeeds and a site that is empty; a
 *      ported page whose route came out at a different path produces a build
 *      that succeeds and one dead link, in a nav that is on every page.
 *
 *      So: every file under docs/ outside the three owned directories must
 *      exist at the same path in dist/, and every routable page under
 *      docs/pages/ must have produced the .html file its path implies. Neither
 *      needs a list to maintain — a ported page stops being checked as a copy
 *      the moment its .html is deleted from docs/, and starts being checked as
 *      a route the moment its .astro appears. The check has no opinion about
 *      which phase the migration is in.
 *
 * The route mapping below is 'preserve' semantics and only 'preserve'
 * semantics: pages/x.astro -> x.html, pages/x/index.astro -> x/index.html.
 * Changing build.format in the config without changing it here would make this
 * check wrong rather than absent, so the config says so too.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Paths at the top of docs/ that belong to Astro, not to the payload.
 *
 * SPIKE (CCWEB2-374): `content.config.ts` and `starlight-overrides` are
 * Starlight's. Without them here, publicDir copies this site's own SOURCE into
 * dist/ and serves it — the collection config and the header override. Entries
 * may be files as well as directories; rmSync removes either, and the payload
 * filter splits on '/' so a top-level filename matches itself.
 *
 * There is deliberately no `content` entry. A collection normally lives in
 * srcDir/content/, and this one does not: the loader reads DESIGN.md, README.md,
 * SKILL.md and guide.md where they already sit, because those four are payload
 * that other things cite by path. So docs/content/ does not exist, and listing
 * it would be an exclusion for nothing — the same dead-entry problem GONE and
 * EXCEPTIONS are checked for elsewhere.
 */
const OWNED = ['pages', 'layouts', 'components', 'content.config.ts', 'starlight-overrides'];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const rel = (from, f) => path.relative(from, f).split(path.sep).join('/');

export default function docsPassthrough() {
  let docs;

  return {
    name: 'codecave:docs-passthrough',
    hooks: {
      'astro:config:done': ({ config }) => {
        docs = fileURLToPath(config.srcDir);
      },

      'astro:build:done': ({ dir, logger }) => {
        const out = fileURLToPath(dir);

        for (const owned of OWNED) {
          fs.rmSync(path.join(out, owned), { recursive: true, force: true });
        }

        const missing = [];

        /* --- every payload file survived the copy ------------------------- */

        const payload = walk(docs).filter((f) => {
          const top = rel(docs, f).split('/')[0];
          return !OWNED.includes(top);
        });

        for (const f of payload) {
          const r = rel(docs, f);
          if (!fs.existsSync(path.join(out, r))) missing.push(`  ${r}  was not copied to dist/`);
        }

        /* --- every page rendered to the path its source implies ----------- */

        const pages = walk(path.join(docs, 'pages')).filter(
          (f) => f.endsWith('.astro') && !path.basename(f).startsWith('_'),
        );

        for (const f of pages) {
          const src = rel(path.join(docs, 'pages'), f);
          const r = src.replace(/\.astro$/, '.html');

          /* The port that does nothing. publicDir and srcDir are the same
           * directory, and when both offer the same path Astro keeps the
           * public file and skips the page — "Skipping ... because a file with
           * the same name exists in the public folder", a WARN in a build that
           * still exits 0. The .astro is then dead source that renders on
           * nobody's screen, and checking dist/ for the output cannot see it:
           * the file is there, copied rather than rendered. Ask docs/ instead. */
          if (fs.existsSync(path.join(docs, r))) {
            missing.push(
              `  pages/${src}  is inert — docs/${r} still exists and publicDir wins.\n` +
                `      Porting a page means deleting the .html it replaces.`,
            );
            continue;
          }

          if (!fs.existsSync(path.join(out, r))) {
            missing.push(`  pages/${src}  did not render to dist/${r}`);
          }
        }

        if (missing.length) {
          for (const line of missing) logger.error(line);
          throw new Error(
            `${missing.length} file(s) missing from the build. dist/ is not a superset of docs/, ` +
              'so deploying it would take pages off the site.',
          );
        }

        logger.info(
          `passthrough verified — ${payload.length} payload file(s) copied, ` +
            `${pages.length} page(s) rendered.`,
        );
      },
    },
  };
}
