import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import LinkGroup from '../../authored/footer/link-group.vue';

const meta = {
  title: 'Footer/LinkGroup',
  component: LinkGroup,
  tags: ['autodocs'],
  args: {
    groupName: 'Services',
    items: [
      { name: 'Custom software', href: '/services/custom-software/' },
      { name: 'Platform engineering', href: '/services/platform/' },
      { name: 'Data & AI', href: '/services/data-ai/' },
    ],
  },
} satisfies Meta<typeof LinkGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Empty: Story = { args: { items: [] } };

/**
 * The items are props, which is the whole reason this ships.
 *
 * It used to import `./links.ts` -- this site's footer content -- so installing
 * it would have put codecave.pro's footer behind an npm release. The shape is
 * declared locally and TypeScript is structural, so every existing caller
 * passes exactly what it passed before.
 */
export const RendersEveryItem: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Services')).toBeVisible();
    for (const item of args.items) {
      await expect(canvas.getByRole('link', { name: item.name })).toHaveAttribute(
        'href',
        item.href,
      );
    }
  },
};
