import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';
import TextField from '../../authored/common/TextField.vue';

const meta = {
  title: 'Common/TextField',
  component: TextField,
  tags: ['autodocs'],
  args: {
    id: 'brief',
    label: 'Tell us about the project',
    placeholder: 'What are you building, and what is in the way?',
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Required: Story = { args: { isRequired: true } };
export const Errored: Story = {
  args: { isError: true, errorMessage: 'Tell us a little more than that.' },
};

/** The textarea grows with its content rather than scrolling. */
export const GrowsWithContent: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    const before = field.getBoundingClientRect().height;
    await userEvent.type(field, 'one\ntwo\nthree\nfour\nfive\nsix');
    await expect(field.getBoundingClientRect().height).toBeGreaterThan(before);
  },
};

/**
 * FAILING ON PURPOSE. The model updates on blur, not on input.
 *
 * The textarea listens on `@change`, which for a textarea fires when it loses
 * focus -- so the parent's `v-model` lags the visible text for as long as the
 * user stays in the field. `InputText`, in the same form, listens on `@input`
 * and updates per keystroke. Two controls a user fills in one after the other
 * disagree about when their value exists, which is how live validation lights
 * up on a field that has already been filled in correctly.
 *
 * (The component's own `autoResize` is bound to `@input`, so it already knows
 * that event is the one that tracks typing.)
 */
export const SyncsWhileTyping: Story = {
  render: (args) => ({
    components: { TextField },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `<div class="flex flex-col gap-3">
      <TextField v-bind="args" v-model="value" />
      <p data-testid="model" class="text-body-secondary text-xs">[{{ value }}]</p>
    </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), 'A checkout that loses the cart.');
    await expect(canvas.getByTestId('model')).toHaveTextContent('[A checkout that loses the cart.]');
  },
};

/**
 * FAILING ON PURPOSE, and the same gap as InputText's.
 *
 * No `role="alert"`, no `aria-describedby`, no `aria-invalid`. Separately, the
 * error colour measures 2.91:1 -- that half is CCWEB2-320 and belongs to Maria
 * Shaban, because it is a colour decision. This half is wiring.
 */
export const ErrorIsAnnounced: Story = {
  args: { isError: true, errorMessage: 'Tell us a little more than that.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAccessibleDescription('Tell us a little more than that.');
    await expect(canvas.getByRole('alert')).toHaveTextContent('Tell us a little more than that.');
  },
};
