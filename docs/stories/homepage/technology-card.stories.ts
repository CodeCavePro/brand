import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import TechnologyCard from '../../authored/homepage/technology-card.vue';

const meta = {
  title: 'Homepage/TechnologyCard',
  component: TechnologyCard,
  tags: ['autodocs'],
  argTypes: { index: { control: { type: 'range', min: 0, max: 5 } } },
  args: {
    name: 'Platform engineering',
    href: '/services/platform/',
    active: true,
    index: 0,
  },
} satisfies Meta<typeof TechnologyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Inactive: Story = { args: { active: false } };

/** All six fan positions, which is the arrangement the card exists for. */
export const TheFan: Story = {
  render: (args) => ({
    components: { TechnologyCard },
    setup: () => ({ args, seats: [0, 1, 2, 3, 4, 5] }),
    template: `<div class="relative h-[28rem]">
      <TechnologyCard v-for="i in seats" :key="i" v-bind="args" :index="i"
        :name="'Service ' + (i + 1)" />
    </div>`,
  }),
};

/**
 * The href is a prop, which is what took the site's route table out of the card.
 *
 * It used to switch on `name` across six known service routes. An empty string
 * renders the button inert, exactly as that switch's default did.
 */
export const HrefIsAProp: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Explore service' });
    await expect(link).toHaveAttribute('href', '/services/platform/');
  },
};

/**
 * FAILING ON PURPOSE. `index` is optional and indexes two arrays.
 *
 * `rotate[index]` and `translate[index]` are interpolated straight into the
 * class string, so omitting the prop -- which the type permits -- puts the
 * literal text `undefined` in the `class` attribute. It is not a crash and not
 * a visible error: the card simply loses its rotation and its offset and stacks
 * at the origin under whichever sibling drew last.
 *
 * The same happens for any index past 5, since neither array is checked.
 */
export const SurvivesAMissingIndex: Story = {
  args: { index: undefined },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.card-wrapper')!;
    await expect(card.className).not.toContain('undefined');
  },
};
