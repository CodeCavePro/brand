import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';
import Radio from '../../authored/common/Radio.vue';

const meta = {
  title: 'Common/Radio',
  component: Radio,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'inline-radio', options: ['primary', 'secondary'] } },
  args: { id: 'email', name: 'contact', label: 'Email' },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Checked: Story = { args: { isChecked: true } };

/** A real group, which is the only shape that shows the shared `name` working. */
export const Group: Story = {
  render: (args) => ({
    components: { Radio },
    setup: () => ({ args }),
    template: `<div class="flex flex-col gap-2">
      <Radio v-bind="args" id="by-email" label="Email" :isChecked="true" />
      <Radio v-bind="args" id="by-phone" label="Phone" />
      <Radio v-bind="args" id="by-post" label="Carrier pigeon" />
    </div>`,
  }),
};

/**
 * FAILING ON PURPOSE. `modelValue` is declared and then ignored.
 *
 * The input binds `:checked="isChecked"`, never `modelValue`, so `v-model`
 * type-checks at every call site, emits correctly on click, and has no effect
 * whatsoever on what is rendered. A group bound to a model opens with nothing
 * selected however the model is initialised, and setting the model from
 * elsewhere -- restoring a draft, resetting a form -- moves nothing on screen.
 *
 * This is the defect Checkbox had and no longer has, which is why it is worth a
 * test rather than a paragraph: the two components disagree about what
 * `modelValue` means and only one of them is right.
 */
export const BindsVModel: Story = {
  render: () => ({
    components: { Radio },
    setup() {
      const picked = ref('by-phone');
      return { picked };
    },
    template: `<div class="flex flex-col gap-2">
      <Radio id="by-email" name="pref" label="Email" v-model="picked" />
      <Radio id="by-phone" name="pref" label="Phone" v-model="picked" />
      <p data-testid="picked" class="text-body-secondary text-xs">{{ picked }}</p>
    </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The model says Phone, so Phone is what should be filled in.
    await expect(canvas.getByRole('radio', { name: 'Phone' })).toBeChecked();
    await userEvent.click(canvas.getByRole('radio', { name: 'Email' }));
    await expect(canvas.getByTestId('picked')).toHaveTextContent('by-email');
  },
};
