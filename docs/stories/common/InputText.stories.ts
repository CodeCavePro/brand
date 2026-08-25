import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';
import InputText from '../../authored/common/InputText.vue';

const meta = {
  title: 'Common/InputText',
  component: InputText,
  tags: ['autodocs'],
  argTypes: { type: { control: 'inline-radio', options: ['text', 'email'] } },
  args: {
    id: 'work-email',
    label: 'Work email',
    type: 'email',
    placeholder: 'you@company.com',
  },
} satisfies Meta<typeof InputText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Required: Story = { args: { isRequired: true } };
export const Errored: Story = {
  args: { isError: true, errorMessage: 'Enter a valid work email address.' },
};

/**
 * Syncs per keystroke, which is the contract TextField does not keep.
 */
export const SyncsWhileTyping: Story = {
  render: (args) => ({
    components: { InputText },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `<div class="flex flex-col gap-3">
      <InputText v-bind="args" v-model="value" />
      <p data-testid="model" class="text-body-secondary text-xs">[{{ value }}]</p>
    </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), 'ada@codecave.pro');
    // No blur anywhere above: the model is expected to be current already.
    await expect(canvas.getByTestId('model')).toHaveTextContent('[ada@codecave.pro]');
  },
};

/**
 * FAILING ON PURPOSE. The error message is visible and nothing else.
 *
 * It renders in a plain `<span>`: no `role="alert"`, no `aria-live`, no
 * `aria-describedby` tying it to the field, and the input never gets
 * `aria-invalid`. A sighted user sees red text appear; a screen reader user is
 * told nothing at all, on exactly the text they most need. WCAG 3.3.1.
 *
 * Worth a test rather than a note because the fix is pure wiring -- no colour
 * decision, no layout change, nothing anyone needs to approve.
 */
export const ErrorIsAnnounced: Story = {
  args: { isError: true, errorMessage: 'Enter a valid work email address.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Enter a valid work email address.');
    await expect(canvas.getByRole('alert')).toHaveTextContent('Enter a valid work email address.');
  },
};
