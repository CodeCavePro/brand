import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import ContactUsForm from '../../../authored/common/forms/ContactUsForm.vue';
import type { CrmSubmitResult } from '../../../authored/lib/crm/types';

/* CRM-neutral by construction: nothing here names HubSpot, and the component
 * could not tell you which CRM is on the other end of `client`. */
const DEFINITION = {
  email: { label: 'Work email', placeholder: 'you@company.com', required: true },
  firstName: { label: 'First name', placeholder: 'Ada', required: true },
  lastName: { label: 'Last name', placeholder: 'Lovelace', required: true },
  companyName: { label: 'Company', placeholder: 'Fyndra', required: false },
  linkedinCompanyPage: {
    label: 'LinkedIn page',
    placeholder: 'https://www.linkedin.com/company/fyndra',
    required: false,
  },
  services: {
    label: 'What do you need?',
    required: false,
    options: [
      { id: 'custom-software', label: 'Custom software' },
      { id: 'platform', label: 'Platform engineering' },
    ],
  },
  description: {
    label: 'Tell us about the project',
    placeholder: 'What are you building?',
    required: false,
    maxLength: 500,
  },
};

const accepts = () => fn(async (): Promise<CrmSubmitResult> => ({ ok: true }));

const meta = {
  title: 'Forms/ContactUsForm',
  component: ContactUsForm,
  tags: ['autodocs'],
  args: { definition: DEFINITION, client: { submit: accepts() } },
} satisfies Meta<typeof ContactUsForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

const fillTheForm = async (canvas: ReturnType<typeof within>) => {
  await userEvent.type(canvas.getByLabelText(/Work email/), 'ada@fyndra.test');
  await userEvent.type(canvas.getByLabelText(/First name/), 'Ada');
  await userEvent.type(canvas.getByLabelText(/Last name/), 'Lovelace');
  await userEvent.type(canvas.getByLabelText(/Company/), 'Fyndra');
  await userEvent.click(canvas.getByRole('radio', { name: 'Platform engineering' }));
  await userEvent.type(canvas.getByLabelText(/Tell us about the project/), 'A migration.');
  await userEvent.click(canvas.getByRole('checkbox', { name: /privacy policy/i }));
};

/**
 * The submission reaches the injected client, and nothing else.
 *
 * This is the test the whole CRM inversion was for. The component takes an
 * `ICrmFormClient` and a set of labels; which CRM receives the values, what it
 * calls its fields and what its wire format is are the caller's business. If
 * that boundary ever leaked, this is where it would show.
 */
export const SubmitsToTheClient: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await fillTheForm(canvas);
    await userEvent.click(canvas.getByText('Leave consultation request'));

    await waitFor(async () => {
      await expect(args.client.submit).toHaveBeenCalledWith({
        email: 'ada@fyndra.test',
        firstName: 'Ada',
        lastName: 'Lovelace',
        companyName: 'Fyndra',
        linkedinCompanyPage: '',
        services: 'platform',
        description: 'A migration.',
        privacyPolicyAccepted: true,
      });
    });
  },
};

/** An empty form never reaches the CRM, and says which fields are missing. */
export const RequiredFieldsBlockSubmission: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Leave consultation request'));
    await waitFor(async () => {
      await expect(canvas.getAllByRole('alert').length).toBeGreaterThan(0);
    });
    await expect(args.client.submit).not.toHaveBeenCalled();
  },
};

/** A malformed email is caught here rather than by the CRM. */
export const ValidatesEmailFormat: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await fillTheForm(canvas);
    await userEvent.clear(canvas.getByLabelText(/Work email/));
    await userEvent.type(canvas.getByLabelText(/Work email/), 'ada@@fyndra');
    await userEvent.click(canvas.getByText('Leave consultation request'));
    await waitFor(async () => {
      await expect(canvas.getByText('Please enter valid email')).toBeVisible();
    });
    await expect(args.client.submit).not.toHaveBeenCalled();
  },
};

/**
 * A failed submission tells the visitor, which it once did not.
 *
 * The code this replaced did `catch (error) { console.log('request err>>', error) }`
 * -- the form went quiet and someone whose enquiry never sent had no way to
 * know. `CrmSubmitResult` is a union rather than a thrown error precisely so
 * that handling the failure is the obvious thing to write; this asserts it was
 * written.
 */
export const TellsTheVisitorWhenTheCrmRefuses: Story = {
  args: {
    client: { submit: fn(async (): Promise<CrmSubmitResult> => ({ ok: false, reason: 'network' })) },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await fillTheForm(canvas);
    await userEvent.click(canvas.getByText('Leave consultation request'));
    await expect(args.client.submit).toHaveBeenCalled();
    // The alert is v-show, so it is in the DOM either way -- visibility is the
    // assertion, not presence.
    await waitFor(async () => {
      await expect(canvas.getByText(/wrong|not|error|try again/i)).toBeVisible();
    });
  },
};
