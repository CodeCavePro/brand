import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, within } from 'storybook/test';
import Review from '../../authored/common/Review.vue';

const ITEM = {
  name: 'Marta Oliveira',
  position: 'Head of Engineering, Fyndra',
  review:
    'They shipped the migration in six weeks and left us able to run it again ' +
    'without them. The handover was the product.',
  verification: 'Verified client',
  linkedinurl: 'https://www.linkedin.com/company/codecavepro',
  photo: { url: '/uploads/marta.jpg', name: 'marta.jpg', alternativeText: 'Marta Oliveira' },
};

const meta = {
  title: 'Common/Review',
  component: Review,
  tags: ['autodocs'],
  args: { item: ITEM },
} satisfies Meta<typeof Review>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Unverified: Story = { args: { item: { ...ITEM, verification: null } } };
export const NoLinkedin: Story = { args: { item: { ...ITEM, linkedinurl: '' } } };

/** `no-image.svg` is the CMS's empty-photo sentinel and renders no image. */
export const NoPhoto: Story = {
  args: { item: { ...ITEM, photo: { url: '', name: 'no-image.svg' } } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('img')).toBeNull();
  },
};

/**
 * The injected `resolveImage` is the whole reason this component ships.
 *
 * It is what replaced a direct import of the site's Strapi helper: the package
 * names no CMS, so a caller whose URLs are relative hands in the resolver and a
 * caller whose URLs are absolute omits it. That inversion is the difference
 * between a part and an assembly, so it is worth a test -- if the prop were ever
 * dropped the component would still render, just with a broken image on one
 * consumer and not the other.
 */
export const ResolvesImageUrls: Story = {
  args: { resolveImage: fn((url: string) => `https://cdn.example.test${url}`) },
  play: async ({ canvasElement, args }) => {
    await expect(args.resolveImage).toHaveBeenCalledWith('/uploads/marta.jpg');
    // LazyImage holds the resolved URL in data-src until it scrolls into view.
    const img = canvasElement.querySelector('img')!;
    await expect(
      img.getAttribute('src') ?? img.getAttribute('data-src'),
    ).toBe('https://cdn.example.test/uploads/marta.jpg');
  },
};

/** Omitted resolver: the URL is used exactly as given. */
export const AbsoluteUrlsNeedNoResolver: Story = {
  args: {
    item: { ...ITEM, photo: { url: 'https://cdn.example.test/m.jpg', name: 'm.jpg' } },
  },
  play: async ({ canvasElement }) => {
    const img = canvasElement.querySelector('img')!;
    await expect(
      img.getAttribute('src') ?? img.getAttribute('data-src'),
    ).toBe('https://cdn.example.test/m.jpg');
  },
};
