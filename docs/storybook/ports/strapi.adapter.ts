/**
 * StrapiPort for the static docs build.
 *
 * Stands in for `src/lib/strapi.ts`, which constructs a `StrapiClient` against
 * `import.meta.env.STRAPI_TOKEN`. The storybook has no token and needs none:
 * the only thing that crosses this seam is the media base URL that
 * `helpers/image-url.ts` prefixes onto a path, and the CMS serves media
 * unauthenticated. The specimens therefore load the real production images.
 *
 * The URL is the live one on purpose — a placeholder host would make every
 * specimen show a broken image and teach nothing about the component.
 */

import type { StrapiPort } from './ports';

const adapter: StrapiPort = {
  strapiUrl: 'https://strapi.azure.codecave.network',
};

// Destructured so the named export matches what the component imports, while
// the object above is what gets typechecked against the interface.
export const { strapiUrl } = adapter;

export default adapter;
