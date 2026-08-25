import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import PainPointsItem from '../../authored/project/pain-points-item.vue';

const IMAGE = { url: '/uploads/pain-point.jpg', name: 'pain-point.jpg' };

const meta = {
  title: 'Project/PainPointsItem',
  component: PainPointsItem,
  tags: ['autodocs'],
  args: {
    item: {
      content:
        'Exports ran overnight and failed silently.\n\n' +
        '- No one saw the failure until the morning stand-up\n' +
        '- The retry re-ran the whole batch\n',
      image: IMAGE,
    },
  },
} satisfies Meta<typeof PainPointsItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

/** The custom renderer is why this component parses markdown itself. */
export const RendersMarkdown: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Exports ran overnight/)).toBeVisible();
    await expect(canvasElement.querySelectorAll('li')).toHaveLength(2);
    // The renderer overrides exist to put these classes on, so assert them
    // rather than the tag alone -- an override that stops being applied is
    // invisible in a screenshot.
    await expect(canvasElement.querySelector('ul')?.className).toContain('list-disc');
    await expect(canvasElement.querySelector('p')?.className).toContain('text-lg');
  },
};

/**
 * The sanitiser, which is the whole reason this component has a port.
 *
 * `content` is CMS-authored markdown rendered with `v-html`, so the only thing
 * between an editor -- or anyone who reaches the CMS -- and script execution is
 * `sanitize()`. The docs storybook substitutes real `dompurify` for it rather
 * than a stub, pinned to the version codecave.pro resolves, precisely because
 * an identity function once made the one page people visit to check sanitising
 * the one page not doing it.
 *
 * This asserts it in the browser that runs it, which is the only place the
 * answer is real.
 */
export const StripsDangerousMarkup: Story = {
  args: {
    item: {
      content: [
        'Before',
        '',
        '<img src=x onerror="window.__xss = true">',
        '',
        '<' + 'script>window.__xss = true;</' + 'script>',
        '',
        '<a href="javascript:window.__xss=true">click</a>',
        '',
        'After',
      ].join('\n'),
      image: IMAGE,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The surrounding prose still renders: sanitising is not stripping.
    await expect(canvas.getByText(/Before/)).toBeVisible();
    await expect(canvas.getByText(/After/)).toBeVisible();

    await expect(canvasElement.querySelector('script')).toBeNull();
    await expect(canvasElement.innerHTML).not.toContain('onerror');
    await expect(canvasElement.innerHTML).not.toContain('javascript:');
    await expect((window as unknown as { __xss?: boolean }).__xss).toBeUndefined();
  },
};

/** Non-string content is coerced rather than thrown at `marked`. */
export const SurvivesNonStringContent: Story = {
  args: { item: { content: null, image: IMAGE } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.innerHTML).not.toContain('null');
  },
};
