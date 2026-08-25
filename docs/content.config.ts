/* SPIKE — CCWEB2-374. Not a decision; see STARLIGHT-SPIKE.md for the findings.
 *
 * Can Starlight render the REAL prose where it already lives — without moving
 * the files and without editing frontmatter that belongs to other systems?
 *
 * Yes. That is what this proves.
 *
 * The four prose files are the entire case for adopting Starlight: 1,577 lines
 * that today render as no pages at all, only as downloadable payload. Two of
 * them already carry frontmatter, and it is NOT Starlight's to take:
 *
 *   docs/SKILL.md   name / description / user-invocable  — Claude Skill metadata.
 *                   `user-invocable: true` is what makes it a slash command.
 *   docs/DESIGN.md  name / category / surface / colors   — a token manifest.
 *
 * Starlight's docsSchema() requires `title`, and writing one into these files
 * is not free: the blocks are read by other tools, and both files ship to
 * dist/ as payload and are cited by name. So the title is SYNTHESIZED at load
 * time instead, and the files on disk are never touched.
 *
 * Two details that each cost a build to find:
 *
 *   - The data has to go through `parseData()`. Setting `data` on the store
 *     directly stores the entry — the loader reports four successes — and
 *     Starlight then renders none of them, because the schema never ran and
 *     the entries are not valid docs. Silent: no error, no page, exit 0.
 *
 *   - Deriving the title from the first `# heading` is NOT good enough, and
 *     this file leaves it wrong deliberately so the finding stays visible.
 *     Three of the four open with "# CODECAVE Design System", so three sidebar
 *     entries and three search results come out identically named. A real
 *     adoption needs a per-file title map here.
 */
import { defineCollection } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';
import fs from 'node:fs';
import path from 'node:path';

const FILES = ['DESIGN.md', 'README.md', 'SKILL.md', 'guide.md'];

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
      load: async ({ store, renderMarkdown, parseData }) => {
        store.clear();
        const root = path.join(process.cwd(), 'docs');
        for (const file of FILES) {
          const body = stripFrontmatter(fs.readFileSync(path.join(root, file), 'utf8'));
          const title = (body.match(/^#\s+(.+)$/m)?.[1] ?? file).trim();
          const id = 'guides/' + file.replace(/\.md$/, '').toLowerCase();
          const filePath = `docs/${file}`;
          store.set({
            id,
            filePath,
            body,
            data: await parseData({ id, data: { title }, filePath }),
            rendered: await renderMarkdown(body),
          });
        }
      },
    },
    schema: docsSchema(),
  }),
};
