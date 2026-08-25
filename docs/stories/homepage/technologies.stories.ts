import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, waitFor, within } from 'storybook/test';
import Technologies from '../../authored/homepage/technologies.vue';

const TECHNOLOGIES = [
  { name: 'Platform engineering', title1: 'We build platforms', title2: 'teams want to use' },
  { name: 'Custom software', title1: 'We build software', title2: 'that outlives the pitch' },
  { name: 'Data & AI', title1: 'We build systems', title2: 'that earn their answers' },
];

const meta = {
  title: 'Homepage/Technologies',
  component: Technologies,
  tags: ['autodocs'],
  args: {
    technologies: TECHNOLOGIES,
    ctaHref: '/contact/',
    serviceLinks: {
      'Platform engineering': '/services/platform/',
      'Custom software': '/services/custom-software/',
    },
  },
} satisfies Meta<typeof Technologies>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const WithoutTheSelectedPanel: Story = { args: { hideSelected: true } };

/**
 * `ctaHref` and `serviceLinks` are what took this site's route table out.
 *
 * `serviceLinks` is plain DATA rather than a resolver function, and that is not
 * a style preference: every call site mounts this with `client:only`, and Astro
 * can only hand an island props it can serialise. A function would arrive
 * undefined.
 */
export const RoutesComeFromProps: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      await expect(within(canvasElement).getByText('Get a free consultation')).toBeVisible();
    });
    const cta = canvasElement.querySelector('a[href="/contact/"]');
    await expect(cta).not.toBeNull();
    await expect(canvasElement.querySelector('a[href="/services/platform/"]')).not.toBeNull();
  },
};

/**
 * CHARACTERISING A PROBLEM, not asserting it is fine.
 *
 * "15+ years of experience" and "4.8 average rating" are written into the
 * template. They are CODECAVE's numbers, and CLAUDE.md's own test for whether
 * something belongs in this package is whether it reaches for one company's
 * data -- a footer carrying an EIN is the example given. Two hardcoded claims
 * about one company are the same thing in miniature.
 *
 * It matters more now than when the component was the site's: a landing page or
 * a HubSpot theme built on this package renders someone else's credentials, and
 * a rating is the kind of claim that has to be true.
 *
 * Not fixed here because the fix is a product decision, not a correctness one:
 * making them props means codecave.pro's homepage renders nothing until it
 * passes them, and giving them defaults ships the same two claims inside the
 * tarball. This test is here so the change is deliberate when it happens.
 */
export const StatsAreHardcoded: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('15+')).toBeVisible();
    await expect(canvas.getByText('Years of experience')).toBeVisible();
    await expect(canvas.getByText('4.8')).toBeVisible();
  },
};
