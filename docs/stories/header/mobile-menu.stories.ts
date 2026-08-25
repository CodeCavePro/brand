import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import MobileMenu from '../../authored/header/mobile-menu.vue';

const LOGO =
  'data:image/svg+xml,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="24"/>');

const meta = {
  title: 'Header/MobileMenu',
  component: MobileMenu,
  tags: ['autodocs'],
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    logo: LOGO,
    homeHref: '/',
    items: [
      {
        name: 'Services',
        submenuTitle: 'What we do',
        submenu: [
          {
            icon: null,
            name: 'Platform engineering',
            description: 'Paved roads, not gates.',
            link: '/services/platform/',
          },
        ],
      },
      { name: 'Work', link: '/work/' },
      { name: 'Contact us', link: '/contact/', emphasis: true },
    ],
  },
} satisfies Meta<typeof MobileMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const OpensAndCloses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const burger = canvasElement.querySelector<HTMLElement>('.burger-menu')!;
    await expect(canvas.queryByRole('navigation')).toBeNull();
    await userEvent.click(burger);
    await waitFor(async () => {
      await expect(canvas.getByRole('navigation')).toBeVisible();
    });
    await userEvent.click(burger);
    await waitFor(async () => {
      await expect(canvas.queryByRole('navigation')).toBeNull();
    });
  },
};

/** The submenu is a second screen, not a nested list. */
export const OpensTheServicesSubmenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvasElement.querySelector<HTMLElement>('.burger-menu')!);
    await userEvent.click(await canvas.findByText('Services'));
    await waitFor(async () => {
      await expect(canvas.getByText('What we do')).toBeVisible();
      await expect(canvas.getByRole('link', { name: /Platform engineering/ })).toBeVisible();
    });
  },
};

/** The page behind an open menu must not scroll. */
export const LocksTheScrollBehindIt: Story = {
  play: async ({ canvasElement }) => {
    const burger = canvasElement.querySelector<HTMLElement>('.burger-menu')!;
    await expect(document.body.style.overflow).not.toBe('hidden');
    await userEvent.click(burger);
    await waitFor(async () => {
      await expect(document.body.style.overflow).toBe('hidden');
    });
    await userEvent.click(burger);
    await waitFor(async () => {
      await expect(document.body.style.overflow).not.toBe('hidden');
    });
  },
};

/**
 * FAILING ON PURPOSE. The burger button is announced as nothing at all.
 *
 * Its only content is an empty `<span>` -- the bars are drawn in CSS -- and
 * there is no `aria-label`, so a screen reader reaches it and says "button".
 * On a phone that is the ONLY way into the navigation. WCAG 4.1.2 and 2.4.4.
 *
 * It also never says whether the menu is open, which `aria-expanded` exists for
 * and which is free here because the component already holds that state.
 */
export const BurgerIsAnnounced: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const burger = canvas.getByRole('button', { name: /menu/i });
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(burger);
    await waitFor(async () => {
      await expect(burger).toHaveAttribute('aria-expanded', 'true');
    });
  },
};
