import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/vue3-vite';
import tailwindcss from '@tailwindcss/vite';
// @storybook/vue3-vite does not depend on plugin-vue and never mentions it --
// a Vue project is assumed to have its own vite.config carrying one. This repo
// has no vite.config at all (Astro compiles Vue through @astrojs/vue), so
// without this line every .vue reaches rolldown as JavaScript and the build
// fails reporting `Unexpected JSX expression` on `<script setup lang="ts">`.
import vue from '@vitejs/plugin-vue';
// The alias table is READ, never restated. import-aliases.mjs says in its own
// header that a second copy of the arithmetic is the trap the aliases sprang;
// it already has two readers with no other code in common, and this is a third.
import { SELF_NAME, SITE_ALIAS_PATTERN, aliasTarget, sitePath } from '../docs/tools/import-aliases.mjs';

const repo = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/* The two source roots, in the same order and for the same reason as
 * build-storybook.mjs: authored/ is what this package ships, source_examples/
 * is what was captured from elsewhere. A story does not care which one supplied
 * the bytes -- but the order is fixed, because build.mjs fails the build when a
 * path exists in both rather than letting whichever walked last win. */
const ROOTS = ['docs/authored', 'docs/source_examples'].map((d) => path.join(repo, d));

const inRoots = (rel: string) =>
  ROOTS.map((r) => path.join(r, rel)).find((p) => fs.existsSync(p)) ?? null;

/* The roots mirror codecave.pro's src/ with one level removed: src/assets/ is
 * assets/, src/helpers/ is helpers/, and src/components/common/ is just
 * common/ -- the captures dropped `components/` because everything under it was
 * one. So a path in the SHIPPED layout becomes a root-relative one by stripping
 * a leading src/ and then a leading components/. Both resolvers below end here,
 * which is the point: one place decides what a root-relative path is. */
const intoRoots = (shipped: string) =>
  inRoots(shipped.replace(/^src\//, '').replace(/^components\//, ''));

/* codecave.pro's path aliases (@assets/, @helpers/, ...), resolved exactly as
 * the esbuild half does it in build-storybook.mjs: inRoots(sitePath(spec)).
 * Returning null for an alias that lands nowhere is deliberate -- @layouts and
 * @styles are in that table precisely because this package does not ship them,
 * so Vite reports the importer instead of this inventing a path into a
 * directory that does not exist. */
const siteAliases = () => ({
  name: 'codecave:site-aliases',
  enforce: 'pre' as const,
  resolveId(source: string) {
    if (new RegExp(`^(?:${SITE_ALIAS_PATTERN})`).test(source)) {
      const rel = sitePath(source);
      return rel ? intoRoots(rel) : null;
    }
    /* The package's own name, which several components use to import a Button.
     * Left alone, Vite resolves it through the workspace symlink to the BUILT
     * copy in packages/brand/dist -- so the story would render whatever the last
     * `npm run build` produced, and an edit to Button.vue would not show until
     * someone rebuilt. Silent, and wrong in the direction that matters: docs/ is
     * the origin. aliasTarget() returns null for anything not under src/
     * (tokens.css, theme.css, the root entry), which correctly falls through to
     * real package resolution. */
    if (source.startsWith(SELF_NAME)) {
      const target = aliasTarget(source);
      return target ? intoRoots(target) : null;
    }
    return null;
  },
});

/* A capture spells its relative imports for the SHIPPED layout, where
 * dist/src/components/common/Checkbox.vue reaches the icons as `../../assets/`.
 * The roots are one level flatter -- docs/authored/common/Checkbox.vue -- so
 * that same specifier overshoots docs/authored/ and lands on docs/assets/,
 * which does not exist.
 *
 * build-storybook.mjs settles it with two lines and this is the same rule: try
 * the literal path first, and only when it is not there, drop every leading
 * `../` and look the remainder up in the roots. Trying the literal path FIRST
 * is the half that matters -- it leaves a genuinely broken relative import
 * broken, instead of quietly re-rooting it onto whatever file happens to share
 * the name at the top of a root. */
const rerootRelative = () => ({
  name: 'codecave:reroot-relative',
  enforce: 'pre' as const,
  resolveId(source: string, importer?: string) {
    if (!source.startsWith('../') || !importer) return null;
    // The importer arrives carrying plugin-vue's query
    // (`Checkbox.vue?vue&type=script&...`), and dirname would keep it.
    if (fs.existsSync(path.resolve(path.dirname(importer.split('?')[0]), source))) return null;
    return inRoots(source.replace(/^(?:\.\.\/)+/, ''));
  },
});

const config: StorybookConfig = {
  // Stories live in a THIRD directory on purpose. authored/ means "this ships"
  // and source_examples/ means "this is evidence"; a story is neither, and
  // dropping one into either root would move the sourceDigest that
  // check:tw-bridge uses to decide the compiled bundles are stale.
  stories: ['../docs/stories/**/*.mdx', '../docs/stories/**/*.stories.@(ts|js)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: { name: '@storybook/vue3-vite', options: {} },
  core: { disableTelemetry: true },
  viteFinal(cfg) {
    cfg.plugins = [
      ...(cfg.plugins ?? []),
      vue(),
      rerootRelative(),
      siteAliases(),
      tailwindcss(),
    ];
    return cfg;
  },
};

export default config;
