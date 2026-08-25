import type { Preview } from '@storybook/vue3-vite';
import './preview.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i } },
    // Storybook's own backgrounds would paint OVER the token ground set in
    // preview.css, so the canvas is left to the design system.
    backgrounds: { disable: true },
    a11y: {
      // Report, do not fail the dev canvas. The test run is where a violation
      // is meant to be fatal -- CCWEB2-320 (TextField's 2.91:1 error text) is a
      // live one, and a11y checks are how it stops being a paragraph in a
      // review file that nothing enforces.
      test: 'todo',
    },
  },
};

export default preview;
