import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import ServicesList from '../../authored/header/services-list.vue';

const meta = {
  title: 'Header/ServicesList',
  component: ServicesList,
  tags: ['autodocs'],
  args: {
    items: [
      {
        icon: null,
        name: 'Custom software',
        description: 'Systems built to outlive the team that shipped them.',
        link: '/services/custom-software/',
      },
      {
        icon: null,
        name: 'Platform engineering',
        description: 'Paved roads, not gates.',
        link: '/services/platform/',
      },
    ],
  },
} satisfies Meta<typeof ServicesList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Empty: Story = { args: { items: [] } };

/**
 * The list is a prop, which is what took this out of the site's menu.ts.
 *
 * It read that file directly, and that was the single thing keeping it out of
 * the package -- installing it would have put codecave.pro's navigation behind
 * an npm release.
 */
export const RendersEveryEntry: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (const item of args.items) {
      await expect(canvas.getByRole('link', { name: new RegExp(item.name) })).toHaveAttribute(
        'href',
        item.link,
      );
      await expect(canvas.getByText(item.description)).toBeVisible();
    }
  },
};
