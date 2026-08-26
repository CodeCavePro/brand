/* Keep dist/ a superset of docs/ AND of the published half of src/, and
 * prove it every build.
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
 * `tailwind.css` is there for a different reason from the rest: not because
 * Astro owns the directory, but because VITE owns the file. See the entry.
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
const OWNED = [
  'pages', 'layouts', 'components', 'content.config.ts', 'starlight-overrides',
  /* Vite's, not payload. tailwind.css is IMPORTED by the specimen pages so
   * Tailwind compiles it into a hashed stylesheet under _astro/; copying the
   * source through as well would publish a second tailwind.css at the site root
   * whose `@import "tailwindcss/theme.css"` no browser can resolve. It would
   * load, apply nothing, and look like the real one. */
  'tailwind.css',
];

/** Authored files that are ALSO deliverables, and the URL each one keeps.
 *
 * colors_and_type.css IS the product -- six standalone deliverables link it as
 * `../../colors_and_type.css`, it resolves its own faces as `./fonts/*.woff2`,
 * and the README tells a consumer to copy it. It is equally the file someone
 * edits to change a token. It used to sit in docs/ so that publicDir would
 * serve it, which put the origin of the design system inside the directory
 * that publishes the website: someone looking for the tokens found the
 * components in src/ and the tokens nowhere near them.
 *
 * So these live in src/ with the rest of the source and are copied out to the
 * SAME URLs they have always had -- nothing a consumer or a deliverable links
 * to moves. The copy is asserted like every other payload file, for the reason
 * this whole file exists: a copy that quietly stops happening produces a build
 * that succeeds and a site with no styling at all. */
export const PUBLISHED = [
  ['styles/colors_and_type.css', 'colors_and_type.css'],
  ['styles/theme.css', 'theme.css'],
  ['styles/fonts', 'fonts'],
  ['tokens', 'tokens'],
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const rel = (from, f) => path.relative(from, f).split(path.sep).join('/');

/** The file on disk behind a published site path, or null if src/ does not
 *  publish that path. The one resolver: the build hook, the dev middleware,
 *  check-links.mjs and check-examples.mjs all go through it, because four
 *  copies of this arithmetic is how the deliverables came to be reported as
 *  broken when they were correct. */
export function publishedSource(srcRoot, siteRel) {
  for (const [from, to] of PUBLISHED) {
    if (siteRel === to) return path.join(srcRoot, from);
    if (siteRel.startsWith(`${to}/`)) {
      return path.join(srcRoot, from, siteRel.slice(to.length + 1));
    }
  }
  return null;
}

const MIME = {
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.ts': 'text/plain',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

export default function docsPassthrough() {
  let docs;

  return {
    name: 'codecave:docs-passthrough',
    hooks: {
      'astro:config:done': ({ config }) => {
        docs = fileURLToPath(config.srcDir);
      },

      /* publicDir serves docs/ in dev; nothing serves the published half of
       * src/, because the copy above happens at astro:build:done. Without
       * this the dev server 404s /colors_and_type.css -- the site loads with
       * no styling at all and the only clue is a Starlight catch-all warning
       * about a getStaticPaths route. Same table, same resolver. */
      'astro:server:setup': ({ server }) => {
        const srcRoot = path.resolve(docs, '..', 'src');
        server.middlewares.use((req, res, next) => {
          const siteRel = decodeURIComponent((req.url || '').split('?')[0]).replace(/^\//, '');

          /* build.format 'preserve' emits x/index.html, and every link in this
           * site carries .html so the pages also open from disk. The dev server
           * routes the same page as /x and 404s /x/index.html -- so the whole
           * main menu is dead in dev while the leaf pages are perfect, which
           * reads as broken navigation rather than as the wrong server. Rewrite
           * it to the route Astro actually has. */
          if (siteRel.endsWith('index.html')) {
            /* No trailing slash: dev serves /kitchen-sink and 404s
             * /kitchen-sink/ just as readily as /kitchen-sink/index.html. */
            req.url = `/${siteRel.slice(0, -'index.html'.length).replace(/\/$/, '')}`;
            return next();
          }

          const file = publishedSource(srcRoot, siteRel);
          if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next();
          res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
          fs.createReadStream(file).pipe(res);
        });
      },

      'astro:build:done': ({ dir, logger }) => {
        const out = fileURLToPath(dir);

        for (const owned of OWNED) {
          fs.rmSync(path.join(out, owned), { recursive: true, force: true });
        }

        const missing = [];

        /* --- the published half of src/ reaches its URL ------------------- */

        const srcRoot = path.resolve(docs, '..', 'src');
        let published = 0;

        for (const [from, to] of PUBLISHED) {
          const source = path.join(srcRoot, from);
          if (!fs.existsSync(source)) {
            missing.push(`  src/${from}  is named by PUBLISHED and does not exist`);
            continue;
          }
          const isDir = fs.statSync(source).isDirectory();
          const target = path.join(out, to);
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.cpSync(source, target, { recursive: true });

          for (const f of isDir ? walk(source) : [source]) {
            const r = isDir ? `${to}/${rel(source, f)}` : to;
            if (fs.existsSync(path.join(out, r))) published += 1;
            else missing.push(`  src/${from}  did not reach dist/${r}`);
          }
        }

        /* --- a published stylesheet's own url() resolves AT THE SOURCE ---- */

        /* colors_and_type.css binds its faces as url(./fonts/...). That path
         * was correct only after publishing while the fonts sat at src/fonts/
         * and the stylesheet at src/styles/ -- so the tarball and the built
         * site were fine, and Vite reported the source as unresolvable in a
         * WARN nobody reads. A relative reference has to be right in BOTH
         * places, which is the same rule dist/ mirrors the source for. */
        for (const [from] of PUBLISHED) {
          const source = path.join(srcRoot, from);
          if (!fs.existsSync(source)) continue;
          const sheets = (fs.statSync(source).isDirectory() ? walk(source) : [source])
            .filter((f) => f.endsWith('.css'));
          for (const sheet of sheets) {
            const css = fs.readFileSync(sheet, 'utf8');
            for (const m of css.matchAll(/url\(\s*[\'"]?([^\'")]+)/g)) {
              const target = m[1].trim();
              if (/^(?:[a-z]+:|\/|#|data:)/i.test(target)) continue;
              if (fs.existsSync(path.resolve(path.dirname(sheet), target))) continue;
              missing.push(
                `  ${rel(srcRoot, sheet)}  reaches ${target}, which does not resolve beside the file that names it`,
              );
            }
          }
        }

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
            `${published} published from src/, ` +
            `${pages.length} page(s) rendered.`,
        );
      },
    },
  };
}
