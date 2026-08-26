/**
 * The ports, and the one place a specifier is wired to an adapter.
 *
 * A component sometimes reaches outside itself — for an HTML sanitiser. The
 * docs site cannot always satisfy that import the way production does, so the
 * dependency is inverted rather than faked: docs/storybook/ports/ports.d.ts
 * declares the narrow interface, an adapter beside it supplies an
 * implementation that works in a browser, and this table says which specifier
 * each adapter stands in for. `npm run check:ports` typechecks every adapter
 * against its interface, so one that drifts fails the build rather than
 * appearing as an `undefined` in a reader's browser.
 *
 * TWO BUILDS READ THIS, and that is why it is its own module rather than a
 * const inside one of them. build-storybook.mjs wires it into esbuild for the
 * compiled bundles that docs/ds-bundle consumes; astro.config.mjs wires the
 * same table into Vite, because the specimen pages import the component sources
 * DIRECTLY now and hit the same import through a different bundler. Two copies
 * of this would be two things to keep in step — and the one that fell behind
 * would fail in a browser, silently, on the one page people visit to check
 * sanitising.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const PORTS_DIR = path.join(repo, 'docs', 'storybook', 'ports');

export const PORTS = [
  {
    port: 'SanitizerPort',
    // Swaps the isomorphic wrapper for the DOMPurify inside it — same engine,
    // same version, without jsdom, which exists to give the sanitiser a DOM on
    // a server and has nothing to do in a browser. This one is a port for the
    // environment only: the specimen sanitises for real. See the adapter, and
    // the version assertion in build-storybook.mjs.
    specifier: /^isomorphic-dompurify$/,
    adapter: 'sanitizer.adapter.ts',
  },
];

/** The adapter file a bare specifier resolves to, or null. */
export const portFor = (bare) => {
  const hit = PORTS.find((p) => p.specifier.test(bare));
  return hit ? { ...hit, file: path.join(PORTS_DIR, hit.adapter) } : null;
};
