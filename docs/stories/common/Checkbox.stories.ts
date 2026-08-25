import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';
import Checkbox from '../../authored/common/Checkbox.vue';

const meta = {
  title: 'Common/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary'] },
    size: { control: 'inline-radio', options: ['small', 'medium'] },
    isRequired: { control: 'boolean' },
    isError: { control: 'boolean' },
  },
  args: { id: 'consent', label: 'I agree to the privacy policy' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Small: Story = { args: { size: 'small', id: 'consent-sm' } };
export const Required: Story = { args: { isRequired: true, id: 'consent-req' } };
export const Error: Story = { args: { isError: true, id: 'consent-err' } };

/**
 * Both sizes side by side, which is the only view that shows the corner radius
 * is size-dependent on purpose: 8px on a 16px box would be exactly half its
 * side -- a circle, reading as a radio button for a pick-any control. The
 * component keys that off `data-size` rather than a utility class so it holds
 * without a Tailwind build.
 */
export const BothSizes: Story = {
  render: (args) => ({
    components: { Checkbox },
    setup: () => ({ args }),
    template: `<div class="flex flex-col gap-4">
      <Checkbox v-bind="args" id="sz-md" size="medium" label="medium -- 24px box" />
      <Checkbox v-bind="args" id="sz-sm" size="small" label="small -- 16px box" />
    </div>`,
  }),
};

/**
 * The v-model round trip, which is the half a static specimen cannot show.
 *
 * This one PASSES, and it is here to keep it that way: the component declared
 * `modelValue` and ignored it for a while -- no emit, no `:checked`, no handler
 * -- so `v-model` type-checked at every call site and silently did nothing.
 * Nothing in the repo could see it, because the box still ticked (the browser
 * toggles an unbound checkbox by itself) and only the bound value stayed put.
 */
export const BindsVModel: Story = {
  render: (args) => ({
    components: { Checkbox },
    setup() {
      const checked = ref(false);
      return { args, checked };
    },
    template: `<div class="flex flex-col gap-3">
      <Checkbox v-bind="args" v-model="checked" />
      <p data-testid="state" class="text-body-secondary text-xs">{{ checked ? 'on' : 'off' }}</p>
    </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox');
    await expect(canvas.getByTestId('state')).toHaveTextContent('off');
    await userEvent.click(box);
    await expect(box).toBeChecked();
    await expect(canvas.getByTestId('state')).toHaveTextContent('on');
    await userEvent.click(box);
    await expect(canvas.getByTestId('state')).toHaveTextContent('off');
  },
};

/**
 * The label is what makes the box clickable, so it is worth asserting rather
 * than assuming: `for` and `id` have to agree or the hit area collapses to the
 * 16px box and the a11y name disappears with it.
 */
export const LabelIsClickable: Story = {
  render: (args) => ({
    components: { Checkbox },
    setup() {
      const checked = ref(false);
      return { args, checked };
    },
    template: `<Checkbox v-bind="args" v-model="checked" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('I agree to the privacy policy'));
    await expect(canvas.getByRole('checkbox')).toBeChecked();
  },
};
