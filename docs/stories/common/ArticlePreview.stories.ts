import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, within } from 'storybook/test';
import ArticlePreview from '../../authored/common/ArticlePreview.vue';

const ARTICLE = {
  slug: 'shipping-a-migration-in-six-weeks',
  title: 'Shipping a migration in six weeks',
  excerpt:
    'What we cut, what we kept, and the two decisions that made the handover ' +
    'possible without us.',
  date: new Date('2026-06-14T09:00:00Z'),
  locale: 'en',
  readingtime: 7,
  cover: {
    url: '/uploads/migration-cover.jpg',
    name: 'migration-cover.jpg',
    alternativeText: 'A migration plan drawn across a whiteboard',
  },
};

const meta = {
  title: 'Common/ArticlePreview',
  component: ArticlePreview,
  tags: ['autodocs'],
  args: { article: ARTICLE, basePath: '/insights/' },
} satisfies Meta<typeof ArticlePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

/**
 * `basePath` is the prop that made this installable.
 *
 * The href used to come from `paths.insights`, read straight off this site's
 * route table -- the last thing keeping the component from shipping. The caller
 * owns where its articles live now.
 */
export const BasePathOwnsTheUrl: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link')).toHaveAttribute(
      'href',
      '/insights/shipping-a-migration-in-six-weeks/',
    );
  },
};

/** Same inversion as Review's: the package names no CMS. */
export const ResolvesImageUrls: Story = {
  args: { resolveImage: fn((url: string) => `https://cdn.example.test${url}`) },
  play: async ({ canvasElement, args }) => {
    await expect(args.resolveImage).toHaveBeenCalledWith('/uploads/migration-cover.jpg');
    await expect(canvasElement.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn.example.test/uploads/migration-cover.jpg',
    );
  },
};

/**
 * FAILING ON PURPOSE. A null slug builds the string "null".
 *
 * `ArticleSummary` types `slug` as `string | null`, and the template
 * interpolates it unguarded: `${basePath ?? ''}${article.slug}/`. A draft with
 * no slug -- which is exactly when a CMS leaves the field null -- renders a card
 * that looks entirely normal and links to `/insights/null/`.
 *
 * The type is not wrong; the template is. A card with nowhere to go should not
 * be a link at all, which is what this asserts.
 */
export const HandlesAMissingSlug: Story = {
  args: { article: { ...ARTICLE, slug: null } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('link')).toBeNull();
    // Still a card: only the destination is missing.
    await expect(canvas.getByText('Shipping a migration in six weeks')).toBeVisible();
  },
};

/**
 * FAILING ON PURPOSE. The cover's alt text is its filename.
 *
 * The cover used to announce "migration-cover.jpg". A filename is worse than no
 * alt text at all -- an empty alt lets a screen reader skip a decorative image,
 * while a filename is read out in full and describes nothing. WCAG 1.1.1.
 *
 * So the editor's `alternativeText` is what renders, and where it is empty the
 * honest fallback is `alt=""` rather than the upload's name. Both halves are
 * asserted, because only having the first would let the filename creep back as
 * a "better than nothing" default.
 */
export const CoverAltTextIsNeverAFilename: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('img')).toHaveAttribute(
      'alt',
      'A migration plan drawn across a whiteboard',
    );
  },
};

export const CoverWithoutAltTextIsDecorative: Story = {
  args: { article: { ...ARTICLE, cover: { ...ARTICLE.cover, alternativeText: null } } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('img')).toHaveAttribute('alt', '');
  },
};
