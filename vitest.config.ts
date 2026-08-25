import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { defineConfig } from 'vitest/config';

const here = path.dirname(fileURLToPath(import.meta.url));

/* Every story is a test case, and the play functions are the assertions.
 *
 * storybookTest() reads .storybook/main.ts, so the run inherits the same Vue
 * plugin, the same two resolvers and the same Tailwind build the canvas uses --
 * which is the property that makes this worth having. A test harness that
 * assembled the components its own way would be testing its own assembly.
 *
 * The browser is real Chromium rather than jsdom, and that is not incidental
 * here: half of what this design system asserts is CSS. `toBeDisabled()` and a
 * class-list check would survive jsdom, but a contrast ratio, a 48px control
 * height or a transform on a ::before pseudo-element only exist once something
 * has actually laid the page out. */
export default defineConfig({
  plugins: [storybookTest({ configDir: path.join(here, '.storybook') })],
  test: {
    name: 'storybook',
    setupFiles: ['.storybook/vitest.setup.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
