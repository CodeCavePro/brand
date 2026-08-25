import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ref } from 'vue';
import Button from '../../authored/common/Button.vue';

const meta = {
  title: 'Common/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'ghost', 'text', 'link', 'icon'],
    },
    isDisabled: { control: 'boolean' },
    as: { control: 'inline-radio', options: [undefined, 'link'] },
  },
  args: { title: 'Book a call', onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Tertiary: Story = { args: { variant: 'tertiary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const TextOnly: Story = { args: { variant: 'text', title: 'Read the case study' } };

/** Every variant at once, which is the view that catches a ramp going out of step. */
export const AllVariants: Story = {
  render: (args) => ({
    components: { Button },
    setup: () => ({ args, variants: ['primary', 'secondary', 'tertiary', 'ghost', 'text', 'link'] }),
    template: `<div class="flex flex-wrap items-center gap-4">
      <Button v-for="v in variants" :key="v" v-bind="args" :variant="v" :title="v" />
    </div>`,
  }),
};

/* --------------------------------------------------------------------------
 * The two below are FAILING ON PURPOSE. Both are live defects in Button.vue,
 * and both are the kind that no check in this repo could ever have caught: the
 * component renders, typechecks, and looks right in every static specimen.
 * ------------------------------------------------------------------------ */

/**
 * `isDisabled` styles a button without disabling it.
 *
 * The prop only ever reaches the class list -- `cursor-not-allowed opacity-20`.
 * There is no `:disabled` binding anywhere in the template, so a "disabled"
 * button is still focusable, still in the tab order, still announced as enabled,
 * and still fires click. A form's submit button dimmed to 20% opacity submits
 * the form.
 */
export const DisabledDoesNotDisable: Story = {
  args: { isDisabled: true, title: 'Submit' },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Submit' });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/**
 * `isDisabled` is read once, at setup, and never again.
 *
 * `buttonBaseClass` is a plain `const` template literal, not a `computed`, so
 * `props.isDisabled` is sampled during setup and baked into a string. The
 * `variantClass` computed then interpolates that stale string -- so it is
 * reactive to `variant` and inert to `isDisabled`. Toggling the prop after
 * mount changes nothing at all, which is exactly what a form does when it
 * disables its submit button while a request is in flight.
 */
export const DisabledIsNotReactive: Story = {
  render: (args) => ({
    components: { Button },
    setup() {
      const off = ref(false);
      return { args, off };
    },
    template: `<div class="flex items-center gap-4">
      <Button v-bind="args" :isDisabled="off" title="Target" />
      <button data-testid="toggle" class="underline" @click="off = !off">toggle isDisabled</button>
    </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const target = canvas.getByRole('button', { name: 'Target' });
    await expect(target).not.toHaveClass(/opacity-20/);
    await userEvent.click(canvas.getByTestId('toggle'));
    await expect(target).toHaveClass(/opacity-20/);
  },
};
