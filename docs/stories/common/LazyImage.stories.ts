import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, waitFor, within } from 'storybook/test';
import LazyImage from '../../authored/common/images/LazyImage.vue';

/* A 2x1 SVG, inline, so the test asserts loading rather than the network. */
const PIXEL =
  'data:image/svg+xml,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="2" height="1"/>');

const meta = {
  title: 'Common/LazyImage',
  component: LazyImage,
  tags: ['autodocs'],
  args: { src: PIXEL, alt: 'A placeholder', width: 240, height: 120 },
} satisfies Meta<typeof LazyImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

/**
 * In view, so the observer fires: `data-src` becomes `src` and is removed.
 *
 * Worth asserting because the swap is the component's entire job and it happens
 * asynchronously in a callback -- if the observer never fires, or fires and the
 * handler bails, the element renders as a broken image and nothing anywhere
 * reports it.
 */
export const LoadsWhenVisible: Story = {
  play: async ({ canvasElement }) => {
    const img = within(canvasElement).getByRole('img') as HTMLImageElement;
    await waitFor(async () => {
      await expect(img).toHaveAttribute('src', PIXEL);
      await expect(img).not.toHaveAttribute('data-src');
    });
  },
};

/**
 * Out of view, and therefore genuinely empty.
 *
 * This characterises the contract rather than complaining about it: `src` is
 * only ever set from the observer callback, so until the element comes within
 * `threshold` px it is an `<img>` with no `src` at all.
 *
 * KNOWN LIMITATION, deliberately not fixed here. Wherever IntersectionObserver
 * does not run -- server-rendered HTML read by a crawler, a reader with
 * JavaScript off -- that is not a slow image but a permanently broken one, which
 * is the failure a lazy loader exists to avoid. The obvious fix is native
 * `loading="lazy"` with a real `src`, and it costs the `threshold` prop its
 * meaning: codecave.pro tunes it deliberately (1200px on one services section,
 * 200px on another), so dropping it changes how that page loads. That is a
 * product call, not a correctness one.
 *
 * If someone later adds `:src` to the template, this test is what tells them
 * they changed the contract rather than fixed a bug.
 */
export const DefersUntilVisible: Story = {
  render: (args) => ({
    components: { LazyImage },
    setup: () => ({ args }),
    // 200vh of spacer keeps the image well outside the root margin, so the
    // observer has genuinely not fired when the assertion runs.
    template: `<div><div style="height:200vh"></div><LazyImage v-bind="args" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    const img = within(canvasElement).getByRole('img') as HTMLImageElement;
    await expect(img).not.toHaveAttribute('src');
    await expect(img).toHaveAttribute('data-src', PIXEL);
  },
};
