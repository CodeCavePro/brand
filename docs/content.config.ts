/* The prose collection: four files that already exist, rendered as pages.
 *
 * THE FILES ARE NOT MOVED AND NOT EDITED, and that is the whole design of this
 * loader rather than a convenience. `DESIGN.md`, `docs/README.md`,
 * `docs/SKILL.md` and `docs/guide.md` are payload — they ship to dist/ and are
 * cited by path from a dozen other files — so they cannot become collection
 * entries under `src/content/`.
 *
 * PATHS HERE ARE REPO-RELATIVE, because the four no longer share a directory:
 * DESIGN.md moved to the repository root on 2026-08-27 to match the DESIGN.md
 * format spec, and tools/astro-passthrough.mjs publishes it back to /DESIGN.md,
 * the URL the front door has always linked.
 *
 * Two of them carry frontmatter that belongs to somebody else:
 *
 *   docs/SKILL.md   name / description / user-invocable  — Claude Skill metadata.
 *                   `user-invocable: true` is what makes it a slash command.
 *   DESIGN.md       the DESIGN.md spec's token schema — colors, typography,
 *                   rounded, spacing, components. Stitch's linter reads it.
 *
 * Starlight's docsSchema() requires a `title`, so writing one into those blocks
 * would mean editing metadata two other systems read, to satisfy a third. The
 * title is SYNTHESIZED here instead and the files on disk are never touched.
 *
 * TWO THINGS THAT LOOK OPTIONAL AND ARE NOT:
 *
 *   1. The data goes through `parseData()`. Setting `data` on the store
 *      directly stores the entry — the loader reports four successes — and
 *      Starlight then renders none of them, because the schema never ran and
 *      the entries are not valid docs. No error, no page, exit 0.
 *
 *   2. The titles are a MAP, not the first `# heading`. Deriving them from the
 *      heading is the obvious thing and it is wrong here: three of the four
 *      open with "# CODECAVE Design System", so the navigation came out with
 *      three identical entries. The heading is what the document calls the
 *      SYSTEM; the title is what it calls ITSELF, and only one of those is
 *      written down anywhere.
 *
 * The slugs here are also the routes, and docs/components/menu.ts points a
 * navigation bar at them. check:links asserts the two agree in both directions
 * — a slug the bar names and this file does not render, and a guide this file
 * renders that no bar names.
 */
import { defineCollection } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';
import fs from 'node:fs';
import path from 'node:path';

/** The four, in reading order — shortest orientation first, reference last.
 *
 *  `order` drives the page order. Left to itself Starlight sorts entries
 *  alphabetically, which puts the 1060-line rules document first and the 28-line
 *  orientation third: correct as a filename sort, useless as a path through the
 *  material. */
const GUIDES = [
  {
    file: 'docs/guide.md',
    slug: 'brand-guide',
    title: 'Brand guide',
    description: 'The whole system in a page: colours, type, voice and the four messaging pillars.',
  },
  {
    // The repository root, not docs/ — the one guide whose source sits outside
    // this directory. tools/astro-passthrough.mjs publishes it to /DESIGN.md.
    file: 'DESIGN.md',
    slug: 'design-rules',
    title: 'Design rules',
    description:
      'The canonical rules document — colour, typography, spacing, motion, voice, and the thirteen “Don’t” rules.',
  },
  {
    file: 'docs/README.md',
    slug: 'using-the-kit',
    title: 'Using the kit',
    description: 'What the package contains, where each value came from, and how to consume it.',
  },
  {
    file: 'docs/SKILL.md',
    slug: 'skill-definition',
    title: 'Skill definition',
    description: 'The map: what is inside, when to reach for it, and what it must not be used for.',
  },
];

/** Strip a leading `---` block, whoever it belongs to. */
function stripFrontmatter(src: string): string {
  if (!src.startsWith('---')) return src;
  const end = src.indexOf('\n---', 3);
  return end === -1 ? src : src.slice(src.indexOf('\n', end + 1) + 1);
}

export const collections = {
  docs: defineCollection({
    loader: {
      name: 'codecave-prose-loader',
      load: async ({ store, renderMarkdown, parseData, logger }) => {
        store.clear();
        const root = process.cwd();

        for (const [i, guide] of GUIDES.entries()) {
          const full = path.join(root, guide.file);

          /* A renamed prose file would otherwise drop its page silently — the
             collection would simply be one entry shorter, and a shorter bar
             looks like a shorter bar. */
          if (!fs.existsSync(full)) {
            throw new Error(
              `content.config.ts: ${guide.file} does not exist.\n` +
                `The prose collection names it explicitly; a rename has to be made here too.`,
            );
          }

          const body = stripFrontmatter(fs.readFileSync(full, 'utf8'));
          const id = `guides/${guide.slug}`;
          const filePath = guide.file;

          store.set({
            id,
            filePath,
            body,
            data: await parseData({
              id,
              filePath,
              data: {
                title: guide.title,
                description: guide.description,
                sidebar: { order: i },
                /* An edit link would point at a collection path that does not
                   exist. These four live at the repo root. */
                editUrl: false,
              },
            }),
            rendered: await renderMarkdown(body),
          });
        }

        logger.info(
          `prose collection — ${GUIDES.length} guide(s) rendered from files that stay where they are: ` +
            GUIDES.map((g) => g.file).join(', '),
        );
      },
    },
    schema: docsSchema(),
  }),
};
