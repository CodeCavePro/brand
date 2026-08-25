import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, waitFor, within } from 'storybook/test';
import BrandNav from '../../authored/common/BrandNav.vue';

const LOGO = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22120%22%20height%3D%2224%22%2F%3E';

const meta = {
  title: 'Common/BrandNav',
  component: BrandNav,
  tags: ['autodocs'],
  args: {
    logo: LOGO,
    logoAlt: 'CODECAVE',
    left: [
      { name: 'Services', slot: 'services' },
      { name: 'Work', href: '/work/' },
    ],
    right: [
      { name: 'Insights', href: '/insights/' },
      { name: 'Contact us', href: '/contact/', badge: true },
    ],
  },
} satisfies Meta<typeof BrandNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const OnTheWorkPage: Story = { args: { current: 'Work' } };

/**
 * `current` marks exactly one item, and marks it by NAME.
 *
 * The attention dot works the same way. It used to be a
 * `ul:last-of-type li:last-child::after` rule, so the marker belonged to a
 * POSITION and moved on its own the first time the menu was reordered.
 */
export const MarksTheCurrentPage: Story = {
  args: { current: 'Work' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Work' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvasElement.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    await expect(canvasElement.querySelectorAll('.badged')).toHaveLength(1);
  },
};

/** The wordmark is a link home, and a link needs an accessible name. */
export const WordmarkIsNamed: Story = {
  args: { logoLabel: 'CODECAVE, home' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'CODECAVE, home' }),
    ).toHaveAttribute('href', '/');
  },
};

/** Left off, the link is named by the image alt, which is the right default. */
export const WordmarkFallsBackToAltText: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'CODECAVE' })).toBeVisible();
  },
};

/**
 * The dropdown opens from a keyboard, with no JavaScript involved.
 *
 * Its trigger used to be a `<span>`, which is not focusable and carries no
 * role, so a keyboard user tabbed straight past "Services" and could never
 * reach anything inside it. WCAG 2.1.1.
 *
 * Asserting the panel actually becomes visible, not just that the button takes
 * focus, is the half that matters -- `:focus-within` has to fire on the trigger
 * itself, because `visibility: hidden` keeps the panel's own links out of the
 * tab order until something else reveals it.
 */
export const DropdownOpensFromTheKeyboard: Story = {
  render: (args) => ({
    components: { BrandNav },
    setup: () => ({ args }),
    template: `<BrandNav v-bind="args">
      <template #services><a href="/services/platform/">Platform engineering</a></template>
    </BrandNav>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Services' });
    const panel = canvasElement.querySelector<HTMLElement>('.dropdown-content')!;

    await expect(getComputedStyle(panel).visibility).toBe('hidden');
    trigger.focus();
    await expect(trigger).toHaveFocus();
    await waitFor(async () => {
      await expect(getComputedStyle(panel).visibility).toBe('visible');
    });
    await expect(canvas.getByRole('link', { name: 'Platform engineering' })).toBeVisible();
  },
};
