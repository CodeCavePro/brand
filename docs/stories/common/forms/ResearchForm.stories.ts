import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import ResearchForm from '../../../authored/common/forms/ResearchForm.vue';

const meta = {
  title: 'Forms/ResearchForm',
  component: ResearchForm,
  tags: ['autodocs'],
} satisfies Meta<typeof ResearchForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const RequiresAnEmail: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Grab research'));
    await waitFor(async () => {
      await expect(canvas.getByText('This field is required')).toBeVisible();
    });
  },
};

export const ValidatesTheFormat: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/E-mail/), 'not-an-address');
    await userEvent.click(canvas.getByText('Grab research'));
    await waitFor(async () => {
      await expect(canvas.getByText('Please enter valid email')).toBeVisible();
    });
  },
};

/**
 * FAILING ON PURPOSE. A valid address goes nowhere.
 *
 * `submitForm` checks that the field is filled and that the address parses --
 * and then returns. There is no emit, no client, no request: the form validates
 * the visitor's email and discards it. Nothing on screen says so, so someone who
 * typed a correct address is left believing the research is on its way.
 *
 * That is worse than an obviously broken button, and it is invisible to every
 * other kind of check: the component renders, typechecks, and both error paths
 * work perfectly.
 *
 * ContactUsForm already shows the shape of the answer -- it emits `submit` with
 * the values and takes an injected client for delivery. This needs at least the
 * first half, so the caller has something to wire.
 */
export const HandsAValidEmailToTheCaller: Story = {
  args: { onSubmit: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/E-mail/), 'ada@fyndra.test');
    await userEvent.click(canvas.getByText('Grab research'));
    await waitFor(async () => {
      await expect(args.onSubmit).toHaveBeenCalledWith('ada@fyndra.test');
    });
  },
};
